using ArquaBilling.Api.Common;
using ArquaBilling.Api.Data;
using ArquaBilling.Api.DTOs.Projects;
using ArquaBilling.Api.Entities;
using ArquaBilling.Api.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace ArquaBilling.Api.Services;

public class ProjectService : IProjectService
{
    private readonly AppDbContext _db;

    public ProjectService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<IReadOnlyList<ProjectListItem>> GetAllAsync(
        int? clientId = null, ProjectStage? etapa = null, bool includeInactive = false)
    {
        var query = _db.Projects.AsNoTracking()
            .Include(p => p.Client)
            .Include(p => p.Responsable)
            .AsQueryable();

        if (!includeInactive)
        {
            query = query.Where(p => p.IsActive);
        }
        if (clientId.HasValue)
        {
            query = query.Where(p => p.ClientId == clientId.Value);
        }
        if (etapa.HasValue)
        {
            query = query.Where(p => p.Etapa == etapa.Value);
        }

        var projects = await query.OrderByDescending(p => p.Id).ToListAsync();
        return projects.Select(p => new ProjectListItem(
            p.Id, p.ClientId, p.Client.Name, p.Nombre, p.CapacidadKwp, p.Etapa, p.Progreso,
            p.ResponsableId, p.Responsable.FullName, p.IsActive, p.CreatedAt)).ToList();
    }

    public async Task<ServiceResult<ProjectResponse>> GetByIdAsync(int id)
    {
        var project = await LoadAsync(id);
        return project is null
            ? ServiceResult<ProjectResponse>.NotFound("Proyecto no encontrado.")
            : ServiceResult<ProjectResponse>.Success(await ToResponseAsync(project));
    }

    public async Task<ServiceResult<ProjectResponse>> CreateAsync(ProjectCreateRequest request)
    {
        var validation = await ValidateClientAndResponsableAsync(request.ClientId, request.ResponsableId);
        if (validation is not null)
        {
            return validation;
        }

        var project = new Project
        {
            ClientId = request.ClientId,
            Nombre = request.Nombre.Trim(),
            CapacidadKwp = request.CapacidadKwp,
            Etapa = request.Etapa,
            Progreso = request.Progreso,
            FechaInicio = NormalizeToUtc(request.FechaInicio)!.Value,
            FechaClave = NormalizeToUtc(request.FechaClave),
            ResponsableId = request.ResponsableId,
            Costo = request.Costo,
            Presupuesto = request.Presupuesto,
            Notes = NormalizeOptional(request.Notes),
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        _db.Projects.Add(project);
        await _db.SaveChangesAsync();

        return ServiceResult<ProjectResponse>.Success(await ToResponseAsync((await LoadAsync(project.Id))!));
    }

    public async Task<ServiceResult<ProjectResponse>> UpdateAsync(int id, ProjectUpdateRequest request)
    {
        var project = await _db.Projects.FirstOrDefaultAsync(p => p.Id == id);
        if (project is null)
        {
            return ServiceResult<ProjectResponse>.NotFound("Proyecto no encontrado.");
        }

        // El cliente no se cambia en update (cuelga del proyecto desde su creación); sí el responsable.
        var responsable = await _db.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Id == request.ResponsableId);
        if (responsable is null)
        {
            return ServiceResult<ProjectResponse>.NotFound("Responsable no encontrado.");
        }
        if (!responsable.IsActive)
        {
            return ServiceResult<ProjectResponse>.Validation("El responsable está inactivo.");
        }

        project.Nombre = request.Nombre.Trim();
        project.CapacidadKwp = request.CapacidadKwp;
        project.Etapa = request.Etapa;
        project.Progreso = request.Progreso;
        project.FechaInicio = NormalizeToUtc(request.FechaInicio)!.Value;
        project.FechaClave = NormalizeToUtc(request.FechaClave);
        project.ResponsableId = request.ResponsableId;
        project.Costo = request.Costo;
        project.Presupuesto = request.Presupuesto;
        project.Notes = NormalizeOptional(request.Notes);
        project.IsActive = request.IsActive;

        await _db.SaveChangesAsync();
        return ServiceResult<ProjectResponse>.Success(await ToResponseAsync((await LoadAsync(id))!));
    }

    public async Task<ServiceResult<ProjectResponse>> UpdateStageProgressAsync(int id, ProjectStageProgressRequest request)
    {
        var project = await _db.Projects.FirstOrDefaultAsync(p => p.Id == id);
        if (project is null)
        {
            return ServiceResult<ProjectResponse>.NotFound("Proyecto no encontrado.");
        }

        project.Etapa = request.Etapa;
        project.Progreso = request.Progreso; // manual, no derivado de la etapa
        await _db.SaveChangesAsync();

        return ServiceResult<ProjectResponse>.Success(await ToResponseAsync((await LoadAsync(id))!));
    }

    public async Task<ServiceResult> DeleteAsync(int id)
    {
        var project = await _db.Projects.FirstOrDefaultAsync(p => p.Id == id);
        if (project is null)
        {
            return ServiceResult.NotFound("Proyecto no encontrado.");
        }

        // Borrado lógico (coherente con el resto del sistema).
        project.IsActive = false;
        await _db.SaveChangesAsync();
        return ServiceResult.Success();
    }

    private async Task<ServiceResult<ProjectResponse>?> ValidateClientAndResponsableAsync(int clientId, int responsableId)
    {
        var client = await _db.Clients.AsNoTracking().FirstOrDefaultAsync(c => c.Id == clientId);
        if (client is null)
        {
            return ServiceResult<ProjectResponse>.NotFound("Cliente no encontrado.");
        }
        if (!client.IsActive)
        {
            return ServiceResult<ProjectResponse>.Validation("El cliente está inactivo.");
        }

        var responsable = await _db.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Id == responsableId);
        if (responsable is null)
        {
            return ServiceResult<ProjectResponse>.NotFound("Responsable no encontrado.");
        }
        if (!responsable.IsActive)
        {
            return ServiceResult<ProjectResponse>.Validation("El responsable está inactivo.");
        }

        return null;
    }

    private Task<Project?> LoadAsync(int id) => _db.Projects.AsNoTracking()
        .Include(p => p.Client)
        .Include(p => p.Responsable)
        .FirstOrDefaultAsync(p => p.Id == id);

    private async Task<ProjectResponse> ToResponseAsync(Project p)
    {
        var equiposCount = await _db.EquiposInstalados.CountAsync(e => e.ProjectId == p.Id);
        var invoicesCount = await _db.Invoices.CountAsync(i => i.ProjectId == p.Id);
        return new ProjectResponse(
            p.Id, p.ClientId, p.Client.Name, p.Nombre, p.CapacidadKwp, p.Etapa, p.Progreso,
            p.FechaInicio, p.FechaClave, p.ResponsableId, p.Responsable.FullName, p.Costo, p.Presupuesto,
            p.Notes, p.IsActive, p.CreatedAt, equiposCount, invoicesCount);
    }

    private static string? NormalizeOptional(string? value) =>
        string.IsNullOrWhiteSpace(value) ? null : value.Trim();

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
