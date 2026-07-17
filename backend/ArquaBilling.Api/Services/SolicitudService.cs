using ArquaBilling.Api.Common;
using ArquaBilling.Api.Data;
using ArquaBilling.Api.DTOs.Solicitudes;
using ArquaBilling.Api.Entities;
using ArquaBilling.Api.Helpers;
using ArquaBilling.Api.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace ArquaBilling.Api.Services;

public class SolicitudService : ISolicitudService
{
    private const int DiasDelMes = 30; // mes comercial: el estimado es orientativo

    private readonly AppDbContext _db;
    private readonly CaptacionOptions _options;

    public SolicitudService(AppDbContext db, IOptions<CaptacionOptions> options)
    {
        _db = db;
        _options = options.Value;
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
        if (!string.IsNullOrWhiteSpace(request.Website))
        {
            return ServiceResult<SolicitudCreatedResponse>.Success(
                BuildResponse(SolicitudNumberGenerator.Format(0, DateTime.UtcNow.Year), kwhDia));
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

    private SolicitudCreatedResponse BuildResponse(string numero, decimal kwhDia)
    {
        var kwhMes = Round(kwhDia * DiasDelMes);
        // Costo DERIVADO, no guardado: la tarifa cambia y es configurable.
        var costo = Round(kwhMes * _options.TarifaKwh);
        return new SolicitudCreatedResponse(numero, kwhDia, kwhMes, costo);
    }

    private static decimal Round(decimal value) => Math.Round(value, 2, MidpointRounding.AwayFromZero);

    private static string? NormalizeOptional(string? value)
        => string.IsNullOrWhiteSpace(value) ? null : value.Trim();
}
