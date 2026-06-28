using System.ComponentModel.DataAnnotations;
using ArquaBilling.Api.Entities;

namespace ArquaBilling.Api.DTOs.Payments;

public class PaymentCreateRequest
{
    // InvoiceId viene de la ruta, no del body.
    [Range(0.01, double.MaxValue, ErrorMessage = "El monto del pago debe ser mayor que cero.")]
    public decimal Amount { get; set; }

    [EnumDataType(typeof(PaymentMethod), ErrorMessage = "Método de pago inválido.")]
    public PaymentMethod PaymentMethod { get; set; }

    [MaxLength(100)]
    public string? Reference { get; set; }

    // Opcional; el service usa UtcNow si no se envía.
    public DateTime? PaidAt { get; set; }

    [MaxLength(1000)]
    public string? Notes { get; set; }
}
