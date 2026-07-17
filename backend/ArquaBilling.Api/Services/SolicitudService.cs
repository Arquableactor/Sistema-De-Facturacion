using ArquaBilling.Api.Common;
using ArquaBilling.Api.Data;
using ArquaBilling.Api.DTOs.Clients;
using ArquaBilling.Api.DTOs.Solicitudes;
using ArquaBilling.Api.Entities;
using ArquaBilling.Api.Helpers;
using ArquaBilling.Api.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace ArquaBilling.Api.Services;

public class SolicitudService : ISolicitudService
{
    private const int DiasDelMes = 30; // mes comercial: el estimado es orientativo

    private readonly AppDbContext _db;
    private readonly IClientService _clientService;

    public SolicitudService(AppDbContext db, IClientService clientService)
    {
        _db = db;
        // Reusamos la creación (y validación) de Client al aprobar: comparten el mismo
        // AppDbContext (scoped), así que el CreateAsync se enlista en nuestra transacción.
        _clientService = clientService;
    }

    public async Task<IReadOnlyList<ApplianceResponse>> GetAppliancesAsync()
        => await _db.ElectrodomesticosCatalogo.AsNoTracking()
            .Where(e => e.IsActive)
            .OrderBy(e => e.Id)
            .Select(e => new ApplianceResponse(
                e.Id, e.Nombre, e.WattsTipicos, e.HorasPorDiaSugeridas, e.Categoria))
            .ToListAsync();

    public async Task<ServiceResult<SolicitudCreatedResponse>> CreateAsync(SolicitudCreateRequest request)
    {
        // 1) Resolver los equipos contra el CATÁLOGO. Los watts salen de aquí, nunca
        //    del request: es lo único que hace confiable al estimado.
        var ids = request.Equipos.Select(e => e.ElectrodomesticoId).ToList();
        var catalogo = await _db.ElectrodomesticosCatalogo.AsNoTracking()
            .Where(e => ids.Contains(e.Id) && e.IsActive)
            .ToDictionaryAsync(e => e.Id);

        var faltantes = ids.Where(id => !catalogo.ContainsKey(id)).ToList();
        if (faltantes.Count > 0)
        {
            return ServiceResult<SolicitudCreatedResponse>.Validation(
                "Hay equipos que no existen o ya no están disponibles.");
        }

        // 2) Estimado: Σ (watts × cantidad × horas) / 1000, redondeado a 2.
        var lineas = request.Equipos.Select(e =>
        {
            var cat = catalogo[e.ElectrodomesticoId];
            return new SolicitudEquipo
            {
                ElectrodomesticoId = cat.Id,
                NombreEquipo = cat.Nombre, // snapshot
                Watts = cat.WattsTipicos,  // snapshot
                Cantidad = e.Cantidad,
                HorasPorDia = e.HorasPorDia
            };
        }).ToList();

        var kwhDia = Round(lineas.Sum(l => l.Watts * l.Cantidad * l.HorasPorDia) / 1000m);

        // 3) HONEYPOT: el campo `website` está oculto en el formulario, así que solo un
        //    bot lo llena. Devolvemos un 201 creíble (con su estimado real) pero NO
        //    escribimos nada: si respondiéramos un error, el bot aprendería a evitarlo.
        //    El folio también tiene que ser creíble y VARIAR entre envíos: uno fijo
        //    (ej. siempre -000000) delataría la trampa a quien enviara dos veces y
        //    comparara. No colisiona con nada real porque no se guarda, y el folio no
        //    se puede consultar públicamente.
        if (!string.IsNullOrWhiteSpace(request.Website))
        {
            var folioSenuelo = SolicitudNumberGenerator.Format(
                Random.Shared.Next(100, 9999), DateTime.UtcNow.Year);
            return ServiceResult<SolicitudCreatedResponse>.Success(BuildResponse(folioSenuelo, kwhDia));
        }

        var solicitud = new SolicitudCliente
        {
            // Placeholder único; se reemplaza por el folio real al conocer el Id.
            NumeroSolicitud = "TMP-" + Guid.NewGuid().ToString("N")[..24],
            Nombre = request.Nombre.Trim(),
            DocumentType = request.DocumentType!.Value,
            DocumentNumber = request.DocumentNumber.Trim(),
            Phone = request.Phone.Trim(),
            Email = NormalizeOptional(request.Email),
            Provincia = NormalizeOptional(request.Provincia),
            Ubicacion = request.Ubicacion.Trim(),
            FacturaLuzMensual = request.FacturaLuzMensual,
            ConsumoEstimadoKwhDia = kwhDia,
            Estado = SolicitudEstado.Pendiente,
            Notas = NormalizeOptional(request.Notas),
            CreatedAt = DateTime.UtcNow,
            Equipos = lineas
        };

        // Todo-o-nada: la solicitud y sus equipos, o nada.
        await using var tx = await _db.Database.BeginTransactionAsync();
        _db.SolicitudesClientes.Add(solicitud);
        await _db.SaveChangesAsync(); // genera el Id
        solicitud.NumeroSolicitud = SolicitudNumberGenerator.Format(solicitud.Id, solicitud.CreatedAt.Year);
        await _db.SaveChangesAsync();
        await tx.CommitAsync();

        return ServiceResult<SolicitudCreatedResponse>.Success(
            BuildResponse(solicitud.NumeroSolicitud, kwhDia));
    }

    // Solo consumo (kWh). Sin costo en RD$: ver SolicitudCreatedResponse.
    private static SolicitudCreatedResponse BuildResponse(string numero, decimal kwhDia)
        => new(numero, kwhDia, Round(kwhDia * DiasDelMes));

    // ==================== Bandeja interna ====================

    public async Task<IReadOnlyList<SolicitudListItem>> GetAllAsync(SolicitudEstado? estado, string? search)
    {
        var query = _db.SolicitudesClientes.AsNoTracking().Include(s => s.RevisadoPor).AsQueryable();

        if (estado.HasValue)
        {
            query = query.Where(s => s.Estado == estado.Value);
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim();
            query = query.Where(s =>
                EF.Functions.ILike(s.Nombre, $"%{term}%") ||
                EF.Functions.ILike(s.DocumentNumber, $"%{term}%"));
        }

        // Pendientes primero (0 antes que 1/2 del enum), luego por fecha desc: la bandeja
        // pone arriba lo que espera acción.
        var rows = await query
            .OrderBy(s => s.Estado == SolicitudEstado.Pendiente ? 0 : 1)
            .ThenByDescending(s => s.CreatedAt)
            .ToListAsync();

        return rows.Select(ToListItem).ToList();
    }

    public async Task<ServiceResult<SolicitudDetailResponse>> GetByIdAsync(int id)
    {
        var s = await _db.SolicitudesClientes.AsNoTracking()
            .Include(x => x.RevisadoPor)
            .Include(x => x.Equipos)
            .FirstOrDefaultAsync(x => x.Id == id);

        return s is null
            ? ServiceResult<SolicitudDetailResponse>.NotFound("Solicitud no encontrada.")
            : ServiceResult<SolicitudDetailResponse>.Success(ToDetail(s));
    }

    public async Task<ServiceResult<SolicitudDetailResponse>> AprobarAsync(
        int id, AprobarSolicitudRequest request, int currentUserId)
    {
        await using var tx = await _db.Database.BeginTransactionAsync();

        // 1) Bloqueo de fila (FOR UPDATE): serializa aprobaciones de la MISMA solicitud
        //    (doble-click / dos revisores). ToListAsync ejecuta el SQL crudo tal cual.
        var solicitud = (await _db.SolicitudesClientes
            .FromSqlRaw("SELECT * FROM \"SolicitudesClientes\" WHERE \"Id\" = {0} FOR UPDATE", id)
            .ToListAsync()).FirstOrDefault();

        if (solicitud is null)
        {
            return ServiceResult<SolicitudDetailResponse>.NotFound("Solicitud no encontrada.");
        }
        if (solicitud.Estado != SolicitudEstado.Pendiente)
        {
            return ServiceResult<SolicitudDetailResponse>.Conflict("La solicitud ya fue revisada.");
        }

        // 2) BLOQUEO POR CÉDULA con el documento de la SOLICITUD (nunca del body). Solo
        //    contra clientes ACTIVOS: es la misma unicidad que aplica el alta manual de
        //    Client. Traemos el nombre para el mensaje.
        var existente = await _db.Clients.AsNoTracking()
            .FirstOrDefaultAsync(c => c.IsActive && c.DocumentNumber == solicitud.DocumentNumber);
        if (existente is not null)
        {
            return ServiceResult<SolicitudDetailResponse>.Conflict(
                $"Ya existe un cliente con este documento (Cliente: {existente.Name}).");
        }

        // 3) Crear el Cliente reusando ClientService (misma validación + creación). El
        //    documento SIEMPRE sale de la solicitud; los demás campos son los corregidos.
        var clientReq = new ClientCreateRequest
        {
            Name = request.Nombre.Trim(),
            DocumentType = solicitud.DocumentType,      // ← de la solicitud, no del body
            DocumentNumber = solicitud.DocumentNumber,  // ← de la solicitud, no del body
            Phone = request.Phone.Trim(),
            Email = string.IsNullOrWhiteSpace(request.Email) ? null : request.Email.Trim(),
            InstallationAddress = ComponerDireccion(request.Ubicacion, request.Provincia)
        };

        var created = await _clientService.CreateAsync(clientReq);
        if (!created.IsSuccess)
        {
            // No debería ocurrir (ya chequeamos el duplicado), pero por si acaso: propagamos.
            return created.Status switch
            {
                ResultStatus.Conflict => ServiceResult<SolicitudDetailResponse>.Conflict(created.Error!),
                ResultStatus.Validation => ServiceResult<SolicitudDetailResponse>.Validation(created.Error!),
                _ => ServiceResult<SolicitudDetailResponse>.Validation(created.Error ?? "No se pudo crear el cliente.")
            };
        }

        // 4) Marcar la solicitud como aprobada. NO tocamos sus datos personales: quedan
        //    como el prospecto los envió (registro histórico); las correcciones viven en
        //    el Cliente nuevo. `solicitud` viene trackeada desde el FromSqlRaw.
        solicitud.Estado = SolicitudEstado.Aprobada;
        solicitud.RevisadoPorUserId = currentUserId;
        solicitud.RevisadoAt = DateTime.UtcNow;
        solicitud.ClienteCreadoId = created.Value!.Id;

        await _db.SaveChangesAsync();
        await tx.CommitAsync();

        return await GetByIdAsync(id);
    }

    public async Task<ServiceResult<SolicitudDetailResponse>> RechazarAsync(
        int id, RechazarSolicitudRequest request, int currentUserId)
    {
        var solicitud = await _db.SolicitudesClientes.FirstOrDefaultAsync(x => x.Id == id);
        if (solicitud is null)
        {
            return ServiceResult<SolicitudDetailResponse>.NotFound("Solicitud no encontrada.");
        }
        if (solicitud.Estado != SolicitudEstado.Pendiente)
        {
            return ServiceResult<SolicitudDetailResponse>.Conflict("La solicitud ya fue revisada.");
        }

        solicitud.Estado = SolicitudEstado.Rechazada;
        solicitud.RevisadoPorUserId = currentUserId;
        solicitud.RevisadoAt = DateTime.UtcNow;
        solicitud.MotivoRechazo = request.MotivoRechazo.Trim();

        await _db.SaveChangesAsync();
        return await GetByIdAsync(id);
    }

    // Dirección del Cliente = ubicación + provincia (opción A). Solo anexa la provincia
    // si viene y no está YA contenida en la ubicación, para no duplicar ("...Santiago,
    // Santiago"). Client no tiene columna de provincia, así que este es su único destino.
    private static string ComponerDireccion(string ubicacion, string? provincia)
    {
        var dir = ubicacion.Trim();
        var prov = provincia?.Trim();
        if (string.IsNullOrWhiteSpace(prov))
        {
            return dir;
        }
        var yaContenida = dir.Contains(prov, StringComparison.OrdinalIgnoreCase);
        return yaContenida ? dir : $"{dir}, {prov}";
    }

    private static SolicitudListItem ToListItem(SolicitudCliente s) => new(
        s.Id, s.NumeroSolicitud, s.Nombre, s.DocumentType, s.DocumentNumber, s.Phone, s.Email,
        s.Provincia, s.Ubicacion, s.FacturaLuzMensual, s.ConsumoEstimadoKwhDia, s.Estado, s.CreatedAt,
        s.RevisadoAt, s.RevisadoPor?.FullName, s.MotivoRechazo, s.ClienteCreadoId);

    private static SolicitudDetailResponse ToDetail(SolicitudCliente s) => new(
        s.Id, s.NumeroSolicitud, s.Nombre, s.DocumentType, s.DocumentNumber, s.Phone, s.Email,
        s.Provincia, s.Ubicacion, s.FacturaLuzMensual, s.ConsumoEstimadoKwhDia, s.Estado, s.Notas,
        s.CreatedAt, s.RevisadoAt, s.RevisadoPor?.FullName, s.MotivoRechazo, s.ClienteCreadoId,
        s.Equipos.OrderBy(e => e.Id).Select(e => new SolicitudEquipoLine(
            e.NombreEquipo, e.Watts, e.Cantidad, e.HorasPorDia,
            Round(e.Watts * e.Cantidad * e.HorasPorDia / 1000m))).ToList());

    private static decimal Round(decimal value) => Math.Round(value, 2, MidpointRounding.AwayFromZero);

    private static string? NormalizeOptional(string? value)
        => string.IsNullOrWhiteSpace(value) ? null : value.Trim();
}
