using System.ComponentModel.DataAnnotations;

namespace ArquaBilling.Api.DTOs.Products;

public class ProductCreateRequest
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
}
