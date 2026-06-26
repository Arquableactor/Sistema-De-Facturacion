using ArquaBilling.Api.Entities;

namespace ArquaBilling.Api.DTOs.Invoices;

// Resumen para la lista (sin las líneas).
public record InvoiceListItem(
    int Id,
    string InvoiceNumber,
    string? NCF,
    int ClientId,
    string ClientName,
    DateTime Date,
    decimal Total,
    decimal Balance,
    InvoiceStatus Status,
    DateTime CreatedAt);
