using System.ComponentModel.DataAnnotations;

namespace ArquaBilling.Api.DTOs.NcfSequences;

// Alta de una secuencia NCF a partir de la autorización de la DGII. El server inicializa
// CurrentNumber = StartNumber-1 (nadie lo manda ni lo puede mandar). Las reglas cruzadas
// (StartNumber<=MaxNumber, fecha futura, no solape con otra activa del mismo tipo) las
// valida el service y devuelven 400/409.
public class NcfSequenceCreateRequest
{
    [Required(ErrorMessage = "El tipo de comprobante es obligatorio.")]
    [MaxLength(10)]
    public string Type { get; set; } = string.Empty;

    [Required(ErrorMessage = "El número de autorización de la DGII es obligatorio.")]
    [MaxLength(50)]
    public string NumeroAutorizacion { get; set; } = string.Empty;

    [Range(1, int.MaxValue, ErrorMessage = "El número inicial debe ser mayor que cero.")]
    public int StartNumber { get; set; }

    [Range(1, int.MaxValue, ErrorMessage = "El número final debe ser mayor que cero.")]
    public int MaxNumber { get; set; }

    // Nullable + [Required]: así un JSON sin fecha se rechaza con 400 (un DateTime no-nullable
    // aceptaría el default y colaría una secuencia sin vencimiento).
    [Required(ErrorMessage = "La fecha de vencimiento es obligatoria.")]
    public DateTime? FechaVencimiento { get; set; }
}
