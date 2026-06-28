namespace ArquaBilling.Api.Entities;

public class Payment
{
    public int Id { get; set; }
    public int InvoiceId { get; set; }
    public decimal Amount { get; set; }
    public PaymentMethod PaymentMethod { get; set; }
    public string? Reference { get; set; }
    public DateTime PaidAt { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; }

    // Anulación lógica: el pago no se borra; se marca y deja de contar para el balance.
    public bool IsVoided { get; set; }
    public DateTime? VoidedAt { get; set; }
    public string? VoidReason { get; set; }

    // Navegación
    public Invoice Invoice { get; set; } = null!;
}
