namespace ArquaBilling.Api.Entities;

public class WarrantyItem
{
    public int Id { get; set; }
    public int WarrantyId { get; set; }
    public int ProductId { get; set; }
    public string ProductName { get; set; } = null!;
    public string? SerialNumber { get; set; }
    public int WarrantyMonths { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public WarrantyItemStatus Status { get; set; }

    // Navegación
    public Warranty Warranty { get; set; } = null!;
    public Product Product { get; set; } = null!;
}
