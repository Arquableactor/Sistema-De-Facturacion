using ArquaBilling.Api.Common;
using ArquaBilling.Api.Data;
using ArquaBilling.Api.DTOs.Warranties;
using ArquaBilling.Api.Entities;
using ArquaBilling.Api.Helpers;
using Microsoft.EntityFrameworkCore;
using ArquaBilling.Api.Interfaces;

namespace ArquaBilling.Api.Services;

public class WarrantyService : IWarrantyService
{
    private readonly AppDbContext _db;

    public WarrantyService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<ServiceResult<WarrantyResponse>> GenerateFromProjectAsync(
        GenerateWarrantyRequest request, int currentUserId)
    {
        await using var tx = await _db.Database.BeginTransactionAsync();

        // Bloqueo de fila del proyecto (FOR UPDATE): serializa generaciones del MISMO proyecto
        // para que dos llamadas simultáneas no creen garantías duplicadas.
        var project = (await _db.Projects
            .FromSqlRaw("SELECT * FROM \"Projects\" WHERE \"Id\" = {0} FOR UPDATE", request.ProjectId)
            .ToListAsync()).FirstOrDefault();

        if (project is null)
        {
            return ServiceResult<WarrantyResponse>.NotFound("Proyecto no encontrado.");
        }

        // No duplicar: un proyecto tiene a lo sumo una garantía vigente (no anulada).
        var existing = await _db.Warranties
            .Where(w => w.ProjectId == project.Id && w.Status != WarrantyStatus.Void)
            .Select(w => w.WarrantyNumber)
            .FirstOrDefaultAsync();
        if (existing is not null)
        {
            return ServiceResult<WarrantyResponse>.Conflict(
                $"El proyecto ya tiene la garantía {existing}.");
        }

        // Cubre los equipos instalados del proyecto.
        var equipos = await _db.EquiposInstalados
            .Where(e => e.ProjectId == project.Id)
            .OrderBy(e => e.Id)
            .ToListAsync();

        if (equipos.Count == 0)
        {
            return ServiceResult<WarrantyResponse>.Conflict(
                "El proyecto no tiene equipos instalados; no hay nada que garantizar.");
        }

        var items = equipos.Select(e => new WarrantyItem
        {
            EquipoInstaladoId = e.Id,
            SerialNumber = e.SerialNumber, // snapshot
            Marca = e.Marca,
            Modelo = e.Modelo,
            WarrantyMonths = e.WarrantyMonths,
            StartDate = e.FechaInstalacion,
            EndDate = e.FechaInstalacion.AddMonths(e.WarrantyMonths),
            Status = WarrantyItemStatus.Active
        }).ToList();

        var warranty = new Warranty
        {
            // Placeholder temporal único (<30 chars); se reemplaza por GAR-... tras obtener el Id.
            WarrantyNumber = "TMP-" + Guid.NewGuid().ToString("N")[..24],
            VerificationCode = Guid.NewGuid().ToString("N"), // único (índice único en DB) y no adivinable
            ProjectId = project.Id,
            ClientId = project.ClientId,
            StartDate = DateTime.UtcNow, // la cabecera arranca en la generación
            EndDate = items.Max(i => i.EndDate), // vence con el último equipo cubierto
            Status = WarrantyStatus.Active,
            Notes = string.IsNullOrWhiteSpace(request.Notes) ? null : request.Notes.Trim(),
            CreatedAt = DateTime.UtcNow,
            Items = items
        };

        _db.Warranties.Add(warranty);
        await _db.SaveChangesAsync(); // genera el Id (y los Ids de los items)
        warranty.WarrantyNumber = WarrantyNumberGenerator.Format(warranty.Id);
        await _db.SaveChangesAsync();

        await tx.CommitAsync();

        return ServiceResult<WarrantyResponse>.Success(await LoadResponseAsync(warranty.Id));
    }

    public async Task<ServiceResult<WarrantyResponse>> GetByIdAsync(int id)
    {
        var warranty = await QueryWithIncludes().FirstOrDefaultAsync(w => w.Id == id);
        return warranty is null
            ? ServiceResult<WarrantyResponse>.NotFound("Garantía no encontrada.")
            : ServiceResult<WarrantyResponse>.Success(ToResponse(warranty, DateTime.UtcNow));
    }

    public async Task<IReadOnlyList<WarrantyListItem>> GetAllAsync(int? clientId = null, int? projectId = null)
    {
        var query = QueryWithIncludes();
        if (clientId.HasValue)
        {
            query = query.Where(w => w.ClientId == clientId.Value);
        }
        if (projectId.HasValue)
        {
            query = query.Where(w => w.ProjectId == projectId.Value);
        }

        var warranties = await query.OrderByDescending(w => w.Id).ToListAsync();
        var now = DateTime.UtcNow;
        return warranties.Select(w => new WarrantyListItem(
            w.Id, w.WarrantyNumber, w.VerificationCode, w.ProjectId, w.Project.Nombre,
            w.ClientId, w.Client.Name, w.StartDate, w.EndDate,
            EffectiveStatus(w.Status, w.EndDate, now), w.Items.Count, w.CreatedAt)).ToList();
    }

    public async Task<ServiceResult<IReadOnlyList<WarrantyResponse>>> SearchBySerialAsync(string serialNumber)
    {
        var serial = serialNumber.Trim();
        var warranties = await QueryWithIncludes()
            .Where(w => w.Items.Any(i => i.SerialNumber == serial))
            .OrderByDescending(w => w.Id)
            .ToListAsync();

        if (warranties.Count == 0)
        {
            return ServiceResult<IReadOnlyList<WarrantyResponse>>.NotFound(
                $"No se encontró garantía para el número de serie {serial}.");
        }

        var now = DateTime.UtcNow;
        IReadOnlyList<WarrantyResponse> response = warranties.Select(w => ToResponse(w, now)).ToList();
        return ServiceResult<IReadOnlyList<WarrantyResponse>>.Success(response);
    }

    public async Task<ServiceResult<PublicWarrantyVerificationResponse>> VerifyByCodeAsync(string verificationCode)
    {
        var code = verificationCode.Trim();
        // Solo los items: la respuesta pública NO incluye cliente ni proyecto.
        var warranty = await _db.Warranties.AsNoTracking()
            .Include(w => w.Items)
            .FirstOrDefaultAsync(w => w.VerificationCode == code);

        if (warranty is null)
        {
            // 404 genérico: no revelar si el código "casi" existe.
            return ServiceResult<PublicWarrantyVerificationResponse>.NotFound("Garantía no encontrada.");
        }

        var now = DateTime.UtcNow;
        var status = EffectiveStatus(warranty.Status, warranty.EndDate, now);
        var response = new PublicWarrantyVerificationResponse(
            warranty.WarrantyNumber,
            IsValid: status == WarrantyStatus.Active,
            IsVoided: warranty.Status == WarrantyStatus.Void,
            Status: status,
            warranty.StartDate,
            warranty.EndDate,
            warranty.Items.OrderBy(i => i.Id).Select(i => new PublicWarrantyItem(
                i.Marca, i.Modelo, i.SerialNumber, i.WarrantyMonths, i.EndDate)).ToList());

        return ServiceResult<PublicWarrantyVerificationResponse>.Success(response);
    }

    private async Task<WarrantyResponse> LoadResponseAsync(int id)
    {
        var warranty = await QueryWithIncludes().FirstAsync(w => w.Id == id);
        return ToResponse(warranty, DateTime.UtcNow);
    }

    private IQueryable<Warranty> QueryWithIncludes() => _db.Warranties.AsNoTracking()
        .Include(w => w.Client)
        .Include(w => w.Project)
        .Include(w => w.Items);

    private static WarrantyResponse ToResponse(Warranty w, DateTime now) => new(
        w.Id, w.WarrantyNumber, w.VerificationCode, w.ProjectId, w.Project.Nombre,
        w.ClientId, w.Client.Name, w.Client.DocumentNumber,
        w.StartDate, w.EndDate, EffectiveStatus(w.Status, w.EndDate, now),
        w.Notes, w.CreatedAt,
        w.Items.OrderBy(i => i.Id).Select(i => new WarrantyItemResponse(
            i.Id, i.EquipoInstaladoId, i.SerialNumber, i.Marca, i.Modelo, i.WarrantyMonths,
            i.StartDate, i.EndDate, EffectiveItemStatus(i.Status, i.EndDate, now))).ToList());

    // El Status se deriva al vuelo de la fecha actual vs EndDate (no hace falta job programado).
    private static WarrantyStatus EffectiveStatus(WarrantyStatus stored, DateTime endDate, DateTime now)
        => stored == WarrantyStatus.Void ? WarrantyStatus.Void
           : endDate < now ? WarrantyStatus.Expired
           : WarrantyStatus.Active;

    private static WarrantyItemStatus EffectiveItemStatus(WarrantyItemStatus stored, DateTime endDate, DateTime now)
        => stored == WarrantyItemStatus.Void ? WarrantyItemStatus.Void
           : endDate < now ? WarrantyItemStatus.Expired
           : WarrantyItemStatus.Active;

    // TODO: endpoint público de verificación por VerificationCode + QR del certificado (sesión futura).
}
