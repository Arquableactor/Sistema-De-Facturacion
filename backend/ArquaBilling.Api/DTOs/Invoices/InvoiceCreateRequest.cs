using System.ComponentModel.DataAnnotations;

namespace ArquaBilling.Api.DTOs.Invoices;

public class InvoiceCreateRequest
{
    // Toda factura pertenece a un proyecto existente; el cliente se deriva del proyecto.
    [Range(1, int.MaxValue, ErrorMessage = "La factura debe pertenecer a un proyecto.")]
    public int ProjectId { get; set; }

    [Required, MinLength(1, ErrorMessage = "La factura debe tener al menos una línea.")]
    public List<InvoiceItemRequest> Items { get; set; } = new();

    // Fecha de vencimiento (para derivar "Vencida" en la presentación).
    [Required]
    public DateTime DueDate { get; set; }

    [MaxLength(1000)]
    public string? Notes { get; set; }

    public DateTime? Date { get; set; }
}
