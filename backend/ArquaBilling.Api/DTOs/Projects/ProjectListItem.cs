using ArquaBilling.Api.Entities;

namespace ArquaBilling.Api.DTOs.Projects;

// Resumen para la lista.
public record ProjectListItem(
    int Id,
    int ClientId,
    string ClientName,
    string Nombre,
    decimal CapacidadKwp,
    ProjectStage Etapa,
    int Progreso,
    int ResponsableId,
    string ResponsableName,
    bool IsActive,
    DateTime CreatedAt);
