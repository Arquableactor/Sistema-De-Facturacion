using ArquaBilling.Api.Common;
using ArquaBilling.Api.DTOs.Payments;

namespace ArquaBilling.Api.Interfaces;

public interface IPaymentService
{
    // Registra un pago contra una factura Issued/PartiallyPaid. Rechaza sobrepago (Conflict).
    Task<ServiceResult<PaymentResult>> AddPaymentAsync(
        int invoiceId, PaymentCreateRequest request, int currentUserId);

    // Anulación lógica de un pago ya registrado; recalcula la factura.
    Task<ServiceResult<PaymentResult>> VoidPaymentAsync(
        int paymentId, string? reason, int currentUserId);

    // Pagos de una factura (incluye anulados, marcados como tales). NotFound si la factura no existe.
    Task<ServiceResult<IReadOnlyList<PaymentResponse>>> GetPaymentsByInvoiceAsync(int invoiceId);
}
