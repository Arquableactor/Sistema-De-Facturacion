using System.ComponentModel.DataAnnotations;
using ArquaBilling.Api.Entities;

namespace ArquaBilling.Api.DTOs.Products;

public class ProductUpdateRequest
{
    [Required, MaxLength(200)]
    public string Name { get; set; } = string.Empty;

    [Required, MaxLength(50)]
    public string Code { get; set; } = string.Empty;

    [MaxLength(50)]
    public string? Barcode { get; set; }

    [MaxLength(500)]
    public string? Description { get; set; }

    [Range(0, double.MaxValue, ErrorMessage = "El precio no puede ser negativo.")]
    public decimal Price { get; set; }

    [Range(0, int.MaxValue, ErrorMessage = "Los meses de garantía no pueden ser negativos.")]
    public int WarrantyMonths { get; set; }

    public bool IsSerialized { get; set; }

    // Catálogo de equipos (opcional).
    public EquipmentCategory? Categoria { get; set; }

    [MaxLength(100)]
    public string? Marca { get; set; }

    [MaxLength(100)]
    public string? Modelo { get; set; }

    [MaxLength(500)]
    public string? Especificacion { get; set; }

    // PUT = reemplazo completo del recurso (incluye el estado activo/inactivo).
    public bool IsActive { get; set; }
}
