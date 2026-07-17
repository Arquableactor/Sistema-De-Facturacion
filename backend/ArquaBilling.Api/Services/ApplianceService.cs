using ArquaBilling.Api.Common;
using ArquaBilling.Api.Data;
using ArquaBilling.Api.DTOs.Appliances;
using ArquaBilling.Api.Entities;
using ArquaBilling.Api.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace ArquaBilling.Api.Services;

public class ApplianceService : IApplianceService
{
    private readonly AppDbContext _db;

    public ApplianceService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<IReadOnlyList<ApplianceAdminResponse>> GetAllAsync(bool includeInactive = false)
    {
        var query = _db.ElectrodomesticosCatalogo.AsNoTracking();
        if (!includeInactive)
        {
            query = query.Where(e => e.IsActive);
        }
        return await query
            .OrderBy(e => e.Nombre)
            .Select(e => ToResponse(e))
            .ToListAsync();
    }

    public async Task<ServiceResult<ApplianceAdminResponse>> CreateAsync(ApplianceCreateRequest request)
    {
        var nombre = request.Nombre.Trim();
        // El nombre es único en el catálogo (índice a nivel de DB): evita duplicados.
        if (await _db.ElectrodomesticosCatalogo.AnyAsync(e => e.Nombre == nombre))
        {
            return ServiceResult<ApplianceAdminResponse>.Conflict("Ya existe un electrodoméstico con ese nombre.");
        }

        var appliance = new ElectrodomesticoCatalogo
        {
            Nombre = nombre,
            WattsTipicos = request.WattsTipicos,
            HorasPorDiaSugeridas = request.HorasPorDiaSugeridas,
            Categoria = NormalizeOptional(request.Categoria),
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        _db.ElectrodomesticosCatalogo.Add(appliance);
        await _db.SaveChangesAsync();
        return ServiceResult<ApplianceAdminResponse>.Success(ToResponse(appliance));
    }

    public async Task<ServiceResult<ApplianceAdminResponse>> UpdateAsync(int id, ApplianceUpdateRequest request)
    {
        var appliance = await _db.ElectrodomesticosCatalogo.FirstOrDefaultAsync(e => e.Id == id);
        if (appliance is null)
        {
            return ServiceResult<ApplianceAdminResponse>.NotFound("Electrodoméstico no encontrado.");
        }

        var nombre = request.Nombre.Trim();
        if (await _db.ElectrodomesticosCatalogo.AnyAsync(e => e.Id != id && e.Nombre == nombre))
        {
            return ServiceResult<ApplianceAdminResponse>.Conflict("Ya existe un electrodoméstico con ese nombre.");
        }

        // Cambiar los watts aquí NO afecta solicitudes ya enviadas: guardaron su snapshot
        // en SolicitudEquipo. Solo cambia el estimado de solicitudes futuras.
        appliance.Nombre = nombre;
        appliance.WattsTipicos = request.WattsTipicos;
        appliance.HorasPorDiaSugeridas = request.HorasPorDiaSugeridas;
        appliance.Categoria = NormalizeOptional(request.Categoria);
        appliance.IsActive = request.IsActive;

        await _db.SaveChangesAsync();
        return ServiceResult<ApplianceAdminResponse>.Success(ToResponse(appliance));
    }

    public async Task<ServiceResult> DeleteAsync(int id)
    {
        var appliance = await _db.ElectrodomesticosCatalogo.FirstOrDefaultAsync(e => e.Id == id);
        if (appliance is null)
        {
            return ServiceResult.NotFound("Electrodoméstico no encontrado.");
        }

        // Borrado LÓGICO: las solicitudes históricas referencian el catálogo (FK Restrict),
        // así que no se borra físicamente; se desactiva y deja de ofrecerse en el formulario.
        appliance.IsActive = false;
        await _db.SaveChangesAsync();
        return ServiceResult.Success();
    }

    private static string? NormalizeOptional(string? value)
        => string.IsNullOrWhiteSpace(value) ? null : value.Trim();

    private static ApplianceAdminResponse ToResponse(ElectrodomesticoCatalogo e) => new(
        e.Id, e.Nombre, e.WattsTipicos, e.HorasPorDiaSugeridas, e.Categoria, e.IsActive, e.CreatedAt);
}
