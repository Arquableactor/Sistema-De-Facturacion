namespace ArquaBilling.Api.Entities;

public class InvoiceItem
{
    public int Id { get; set; }
    public int InvoiceId { get; set; }
    public int ProductId { get; set; }
    public string? Description { get; set; }
    public decimal Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal Discount { get; set; }
    public decimal Itbis { get; set; }
    public decimal LineTotal { get; set; }
    public string? SerialNumber { get; set; }

    // Navegación
    public Invoice Invoice { get; set; } = null!;
    public Product Product { get; set; } = null!;
}
