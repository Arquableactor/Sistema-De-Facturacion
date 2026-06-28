using ArquaBilling.Api.Entities;

namespace ArquaBilling.Api.DTOs.Payments;

public record PaymentResponse(
    int Id,
    int InvoiceId,
    decimal Amount,
    PaymentMethod PaymentMethod,
    string? Reference,
    DateTime PaidAt,
    string? Notes,
    bool IsVoided,
    DateTime? VoidedAt,
    string? VoidReason,
    DateTime CreatedAt);
