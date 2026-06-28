using ArquaBilling.Api.Entities;

namespace ArquaBilling.Api.DTOs.Warranties;

public record WarrantyResponse(
    int Id,
    string WarrantyNumber,
    string VerificationCode,
    int ProjectId,
    string ProjectNombre,
    int ClientId,
    string ClientName,
    string ClientDocumentNumber,
    DateTime StartDate,
    DateTime EndDate,
    WarrantyStatus Status,
    string? Notes,
    DateTime CreatedAt,
    IReadOnlyList<WarrantyItemResponse> Items);
