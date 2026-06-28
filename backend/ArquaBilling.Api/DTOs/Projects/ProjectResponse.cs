using ArquaBilling.Api.Entities;

namespace ArquaBilling.Api.DTOs.Projects;

public record ProjectResponse(
    int Id,
    int ClientId,
    string ClientName,
    string Nombre,
    decimal CapacidadKwp,
    ProjectStage Etapa,
    int Progreso,
    DateTime FechaInicio,
    DateTime? FechaClave,
    int ResponsableId,
    string ResponsableName,
    decimal Costo,
    decimal Presupuesto,
    string? Notes,
    bool IsActive,
    DateTime CreatedAt,
    int EquiposInstaladosCount,
    int InvoicesCount);
