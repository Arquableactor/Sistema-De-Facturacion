using System.ComponentModel.DataAnnotations;

namespace ArquaBilling.Api.DTOs.Invoices;

// El cliente manda producto y cantidad y, opcionalmente, un precio unitario y una
// descripción PERSONALIZADOS por línea (el precio está sujeto al mercado). Si no
// vienen, el server usa el precio y la descripción del catálogo. El ITBIS y los
// totales SIEMPRE los calcula el server; el catálogo (Product.Price) nunca se toca.
public class InvoiceItemRequest
{
    [Range(1, int.MaxValue)]
    public int ProductId { get; set; }

    // Quantity > 0 se valida en el service (mensaje claro); aquí bloqueamos negativos.
    [Range(0, double.MaxValue)]
    public decimal Quantity { get; set; }

    [Range(0, double.MaxValue)]
    public decimal? Discount { get; set; }

    // Override del precio unitario para ESTA factura (no modifica el catálogo).
    [Range(0, double.MaxValue, ErrorMessage = "El precio unitario no puede ser negativo.")]
    public decimal? UnitPrice { get; set; }

    // Descripción personalizada de la línea.
    [MaxLength(500)]
    public string? Description { get; set; }
}
