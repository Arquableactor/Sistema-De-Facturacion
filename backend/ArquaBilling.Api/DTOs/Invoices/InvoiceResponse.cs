using ArquaBilling.Api.Entities;

namespace ArquaBilling.Api.DTOs.Invoices;

public record InvoiceResponse(
    int Id,
    string InvoiceNumber,
    string? NCF,
    int ProjectId,
    int ClientId,
    string ClientName,
    string ClientDocumentNumber,
    int UserId,
    DateTime Date,
    DateTime DueDate,
    decimal Subtotal,
    decimal Itbis,
    decimal Discount,
    decimal Total,
    decimal PaidAmount,
    decimal Balance,
    InvoiceStatus Status,
    // "Vencida" no es un estado del enum: se deriva (Issued/PartiallyPaid + DueDate < hoy).
    bool IsOverdue,
    string? Notes,
    DateTime CreatedAt,
    IReadOnlyList<InvoiceItemResponse> Items);
