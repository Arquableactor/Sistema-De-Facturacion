namespace ArquaBilling.Api.Entities;

public class Invoice
{
    public int Id { get; set; }
    public string InvoiceNumber { get; set; } = null!;
    public string? NCF { get; set; }
    public int ProjectId { get; set; } // toda factura pertenece a un proyecto (obligatorio)
    public int ClientId { get; set; }
    public int UserId { get; set; }
    public DateTime Date { get; set; }
    public DateTime DueDate { get; set; } // vencimiento; "Vencida" se deriva en la respuesta
    public decimal Subtotal { get; set; }
    public decimal Itbis { get; set; }
    public decimal Discount { get; set; }
    public decimal Total { get; set; }
    public decimal PaidAmount { get; set; }
    public decimal Balance { get; set; }
    public InvoiceStatus Status { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; }

    // Navegación
    public Project Project { get; set; } = null!;
    public Client Client { get; set; } = null!;
    public User User { get; set; } = null!;
    public ICollection<InvoiceItem> Items { get; set; } = new List<InvoiceItem>();
    public ICollection<Payment> Payments { get; set; } = new List<Payment>();
}
