namespace ArquaBilling.Api.DTOs.Products;

// Nunca exponemos la entidad Product directamente; este DTO desacopla la API del modelo.
public record ProductResponse(
    int Id,
    string Name,
    string Code,
    string? Barcode,
    string? Description,
    decimal Price,
    int WarrantyMonths,
    bool IsSerialized,
    bool IsActive,
    DateTime CreatedAt);
