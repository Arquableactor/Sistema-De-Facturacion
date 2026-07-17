namespace ArquaBilling.Api.DTOs.Appliances;

// Fila del catálogo para el CRUD interno (Admin). Incluye IsActive y CreatedAt, a
// diferencia de ApplianceResponse (el público), que solo expone lo mínimo para estimar.
public record ApplianceAdminResponse(
    int Id,
    string Nombre,
    int WattsTipicos,
    decimal HorasPorDiaSugeridas,
    string? Categoria,
    bool IsActive,
    DateTime CreatedAt);
