using ArquaBilling.Api.Entities;

namespace ArquaBilling.Api.DTOs.Clients;

// Nunca exponemos la entidad Client directamente: este DTO desacopla la API
// del modelo de DB y evita filtrar navegaciones o campos internos.
public record ClientResponse(
    int Id,
    string Name,
    DocumentType DocumentType,
    string DocumentNumber,
    string Phone,
    string? Email,
    string InstallationAddress,
    bool IsActive,
    DateTime CreatedAt);
