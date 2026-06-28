namespace ArquaBilling.Api.Entities;

public class Product
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public string Code { get; set; } = null!;
    public string? Barcode { get; set; }
    public string? Description { get; set; }
    public decimal Price { get; set; }
    public int WarrantyMonths { get; set; }
    public bool IsSerialized { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }

    // Catálogo de equipos (nullable; el seed los puebla para los productos demo).
    public EquipmentCategory? Categoria { get; set; }
    public string? Marca { get; set; }
    public string? Modelo { get; set; }
    public string? Especificacion { get; set; }

    // Navegación
    public ICollection<InvoiceItem> InvoiceItems { get; set; } = new List<InvoiceItem>();
    public ICollection<EquipoInstalado> EquiposInstalados { get; set; } = new List<EquipoInstalado>();
}
