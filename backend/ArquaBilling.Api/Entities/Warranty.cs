namespace ArquaBilling.Api.Entities;

public class Warranty
{
    public int Id { get; set; }
    public int InvoiceId { get; set; }
    public int ClientId { get; set; }
    public string WarrantyNumber { get; set; } = null!;
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public WarrantyStatus Status { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; }

    // Navegación
    public Invoice Invoice { get; set; } = null!;
    public Client Client { get; set; } = null!;
    public ICollection<WarrantyItem> Items { get; set; } = new List<WarrantyItem>();
}
