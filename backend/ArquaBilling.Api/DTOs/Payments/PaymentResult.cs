using ArquaBilling.Api.Entities;

namespace ArquaBilling.Api.DTOs.Payments;

// Devuelve el pago afectado + el estado/balance resultante de la factura, para que
// el cliente vea el efecto del registro o la anulación sin un GET adicional.
public record PaymentResult(
    PaymentResponse Payment,
    InvoicePaymentState Invoice);

public record InvoicePaymentState(
    int InvoiceId,
    InvoiceStatus Status,
    decimal Total,
    decimal PaidAmount,
    decimal Balance);
