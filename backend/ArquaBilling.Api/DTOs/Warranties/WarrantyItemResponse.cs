using ArquaBilling.Api.Entities;

namespace ArquaBilling.Api.DTOs.Warranties;

public record WarrantyItemResponse(
    int Id,
    int EquipoInstaladoId,
    string SerialNumber,
    string? Marca,
    string? Modelo,
    int WarrantyMonths,
    DateTime StartDate,
    DateTime EndDate,
    WarrantyItemStatus Status);
