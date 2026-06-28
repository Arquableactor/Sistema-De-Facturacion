using ArquaBilling.Api.Entities;

namespace ArquaBilling.Api.DTOs.Invoices;

// Resumen para la lista (sin las líneas).
public record InvoiceListItem(
    int Id,
    string InvoiceNumber,
    string? NCF,
    int ProjectId,
    int ClientId,
    string ClientName,
    DateTime Date,
    DateTime DueDate,
    decimal Total,
    decimal Balance,
    InvoiceStatus Status,
    bool IsOverdue,
    DateTime CreatedAt);
