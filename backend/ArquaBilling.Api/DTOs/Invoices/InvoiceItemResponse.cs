namespace ArquaBilling.Api.DTOs.Invoices;

public record InvoiceItemResponse(
    int Id,
    int ProductId,
    string? Description,
    decimal Quantity,
    decimal UnitPrice,
    decimal Discount,
    decimal Itbis,
    decimal LineTotal,
    string? SerialNumber);
