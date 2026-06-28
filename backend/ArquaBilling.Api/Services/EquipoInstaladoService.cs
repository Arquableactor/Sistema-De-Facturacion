using ArquaBilling.Api.Common;
using ArquaBilling.Api.Data;
using ArquaBilling.Api.DTOs.EquiposInstalados;
using ArquaBilling.Api.Entities;
using ArquaBilling.Api.Interfaces;
using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace ArquaBilling.Api.Services;

public class EquipoInstaladoService : IEquipoInstaladoService
{
    private const string DuplicateSerialMessage = "Ya existe un equipo con ese número de serie.";

    private readonly AppDbContext _db;

    public EquipoInstaladoService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<ServiceResult<EquipoInstaladoResponse>> CreateAsync(
        int projectId, EquipoInstaladoCreateRequest request)
    {
        var project = await _db.Projects.AsNoTracking().FirstOrDefaultAsync(p => p.Id == projectId);
        if (project is null)
        {
            return ServiceResult<EquipoInstaladoResponse>.NotFound("Proyecto no encontrado.");
        }
        if (!project.IsActive)
        {
            return ServiceResult<EquipoInstaladoResponse>.Validation("El proyecto está inactivo.");
        }

        var product = await _db.Products.AsNoTracking().FirstOrDefaultAsync(p => p.Id == request.ProductId);
        if (product is null || !product.IsActive)
        {
            return ServiceResult<EquipoInstaladoResponse>.Validation(
                $"El producto {request.ProductId} no existe o está inactivo.");
        }

        var equipo = new EquipoInstalado
        {
            ProductId = product.Id,
            ProjectId = project.Id,
            ClientId = project.ClientId, // derivado del proyecto
            SerialNumber = request.SerialNumber.Trim(),
            FechaInstalacion = NormalizeToUtc(request.FechaInstalacion)!.Value,
            // Snapshots del producto al instalar (inmutabilidad histórica).
            Marca = product.Marca,
            Modelo = product.Modelo,
            WarrantyMonths = product.WarrantyMonths,
            CreatedAt = DateTime.UtcNow
        };

        _db.EquiposInstalados.Add(equipo);
        try
        {
            await _db.SaveChangesAsync();
        }
        catch (DbUpdateException ex)
            when (ex.InnerException is PostgresException { SqlState: PostgresErrorCodes.UniqueViolation })
        {
            return ServiceResult<EquipoInstaladoResponse>.Conflict(DuplicateSerialMessage);
        }

        return ServiceResult<EquipoInstaladoResponse>.Success(await LoadResponseAsync(equipo.Id));
    }

    public async Task<ServiceResult<IReadOnlyList<EquipoInstaladoResponse>>> GetByProjectAsync(int projectId)
    {
        if (!await _db.Projects.AnyAsync(p => p.Id == projectId))
        {
            return ServiceResult<IReadOnlyList<EquipoInstaladoResponse>>.NotFound("Proyecto no encontrado.");
        }

        var equipos = await QueryWithProduct()
            .Where(e => e.ProjectId == projectId)
            .OrderBy(e => e.Id)
            .ToListAsync();

        IReadOnlyList<EquipoInstaladoResponse> response = equipos.Select(ToResponse).ToList();
        return ServiceResult<IReadOnlyList<EquipoInstaladoResponse>>.Success(response);
    }

    public async Task<IReadOnlyList<EquipoInstaladoResponse>> GetByClientAsync(int clientId)
    {
        var equipos = await QueryWithProduct()
            .Where(e => e.ClientId == clientId)
            .OrderByDescending(e => e.Id)
            .ToListAsync();
        return equipos.Select(ToResponse).ToList();
    }

    private async Task<EquipoInstaladoResponse> LoadResponseAsync(int id)
    {
        var equipo = await QueryWithProduct().FirstAsync(e => e.Id == id);
        return ToResponse(equipo);
    }

    private IQueryable<EquipoInstalado> QueryWithProduct() =>
        _db.EquiposInstalados.AsNoTracking().Include(e => e.Product);

    private static EquipoInstaladoResponse ToResponse(EquipoInstalado e) => new(
        e.Id, e.ProductId, e.Product.Name, e.ProjectId, e.ClientId, e.SerialNumber,
        e.FechaInstalacion, e.Marca, e.Modelo, e.WarrantyMonths, e.CreatedAt);

    private static DateTime? NormalizeToUtc(DateTime? value)
    {
        if (!value.HasValue)
        {
            return null;
        }
        var d = value.Value;
        return d.Kind switch
        {
            DateTimeKind.Utc => d,
            DateTimeKind.Local => d.ToUniversalTime(),
            _ => DateTime.SpecifyKind(d, DateTimeKind.Utc)
        };
    }
}
