using ArquaBilling.Api.Entities;

namespace ArquaBilling.Api.DTOs.Warranties;

// Resumen para la lista (sin los items).
public record WarrantyListItem(
    int Id,
    string WarrantyNumber,
    string VerificationCode,
    int ProjectId,
    string ProjectNombre,
    int ClientId,
    string ClientName,
    DateTime StartDate,
    DateTime EndDate,
    WarrantyStatus Status,
    int ItemCount,
    DateTime CreatedAt);
