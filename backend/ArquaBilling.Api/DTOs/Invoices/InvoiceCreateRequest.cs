using System.ComponentModel.DataAnnotations;
using ArquaBilling.Api.DTOs.Clients;

namespace ArquaBilling.Api.DTOs.Invoices;

public class InvoiceCreateRequest
{
    // Exactamente UNO de los dos (se valida en el service): cliente existente o nuevo.
    public int? ClientId { get; set; }

    public ClientCreateRequest? NewClient { get; set; }

    [Required, MinLength(1, ErrorMessage = "La factura debe tener al menos una línea.")]
    public List<InvoiceItemRequest> Items { get; set; } = new();

    [MaxLength(1000)]
    public string? Notes { get; set; }

    public DateTime? Date { get; set; }
}
