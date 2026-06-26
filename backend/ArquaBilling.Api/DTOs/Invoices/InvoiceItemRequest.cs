using System.ComponentModel.DataAnnotations;

namespace ArquaBilling.Api.DTOs.Invoices;

// El cliente solo manda producto y cantidad: precio e ITBIS los calcula el server.
public class InvoiceItemRequest
{
    [Range(1, int.MaxValue)]
    public int ProductId { get; set; }

    // Quantity > 0 se valida en el service (mensaje claro); aquí bloqueamos negativos.
    [Range(0, double.MaxValue)]
    public decimal Quantity { get; set; }

    [Range(0, double.MaxValue)]
    public decimal? Discount { get; set; }
}
