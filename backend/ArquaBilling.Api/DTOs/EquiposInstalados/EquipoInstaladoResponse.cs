namespace ArquaBilling.Api.DTOs.EquiposInstalados;

public record EquipoInstaladoResponse(
    int Id,
    int ProductId,
    string ProductName,
    int ProjectId,
    int ClientId,
    string SerialNumber,
    DateTime FechaInstalacion,
    string? Marca,
    string? Modelo,
    int WarrantyMonths,
    DateTime CreatedAt);
