using System.ComponentModel.DataAnnotations;

namespace ArquaBilling.Api.DTOs.EquiposInstalados;

// El ProjectId viene de la ruta. ClientId, Marca, Modelo y WarrantyMonths se derivan
// del proyecto y del producto (snapshots); no se piden al cliente.
public class EquipoInstaladoCreateRequest
{
    [Range(1, int.MaxValue, ErrorMessage = "ProductId es obligatorio.")]
    public int ProductId { get; set; }

    [Required, MaxLength(100)]
    public string SerialNumber { get; set; } = string.Empty;

    [Required]
    public DateTime FechaInstalacion { get; set; }
}
