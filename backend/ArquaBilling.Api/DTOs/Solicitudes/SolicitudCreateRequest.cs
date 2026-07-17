using System.ComponentModel.DataAnnotations;
using ArquaBilling.Api.DTOs.Shared;
using ArquaBilling.Api.Entities;

namespace ArquaBilling.Api.DTOs.Solicitudes;

// Lo que envía un PROSPECTO desde el formulario público. Es anónimo y sin login, así
// que todo lo que llega es hostil hasta demostrar lo contrario: longitudes acotadas,
// mismas reglas que Client (esto será un Client al aprobarse), y NADA de watts — el
// consumo lo calcula el server con los vatios del catálogo.
public class SolicitudCreateRequest : IValidatableObject
{
    public const int MaxEquipos = 50;
    public const decimal MaxFacturaLuz = 1_000_000m;

    [Required(ErrorMessage = "El nombre es obligatorio.")]
    [MaxLength(200)]
    public string Nombre { get; set; } = string.Empty;

    [Required(ErrorMessage = "El tipo de documento es obligatorio.")]
    public DocumentType? DocumentType { get; set; }

    [Required(ErrorMessage = "El documento es obligatorio.")]
    [MaxLength(30)]
    public string DocumentNumber { get; set; } = string.Empty;

    [Required(ErrorMessage = "El teléfono es obligatorio.")]
    [PhoneRd]
    [MaxLength(30)]
    public string Phone { get; set; } = string.Empty;

    [EmailAddress(ErrorMessage = "Correo electrónico inválido.")]
    [MaxLength(256)]
    public string? Email { get; set; }

    [MaxLength(50)]
    public string? Provincia { get; set; }

    [Required(ErrorMessage = "La ubicación es obligatoria.")]
    [MaxLength(300)]
    public string Ubicacion { get; set; } = string.Empty;

    // Opcional. El rango se valida abajo para poder dar un mensaje propio.
    public decimal? FacturaLuzMensual { get; set; }

    [Required]
    public List<SolicitudEquipoRequest> Equipos { get; set; } = new();

    [MaxLength(1000)]
    public string? Notas { get; set; }

    // HONEYPOT: el formulario lo pinta oculto, así que una persona nunca lo llena.
    // Si viene con algo, es un bot. No se valida (no queremos enseñarle nada): el
    // service decide qué hacer. MaxLength solo para que no nos manden una novela.
    [MaxLength(200)]
    public string? Website { get; set; }

    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        // Documento según su tipo: MISMA regla que Client (DTOs/Shared/DocumentRules).
        foreach (var r in DocumentRules.Validate(DocumentType, DocumentNumber))
        {
            yield return r;
        }

        if (FacturaLuzMensual.HasValue &&
            (FacturaLuzMensual.Value <= 0 || FacturaLuzMensual.Value >= MaxFacturaLuz))
        {
            yield return new ValidationResult(
                "La factura de luz debe ser mayor que 0 y menor que 1,000,000.",
                new[] { nameof(FacturaLuzMensual) });
        }

        if (Equipos.Count == 0)
        {
            yield return new ValidationResult(
                "Selecciona al menos un equipo.", new[] { nameof(Equipos) });
        }
        else if (Equipos.Count > MaxEquipos)
        {
            yield return new ValidationResult(
                $"No puedes enviar más de {MaxEquipos} equipos.", new[] { nameof(Equipos) });
        }
        else if (Equipos.Select(e => e.ElectrodomesticoId).Distinct().Count() != Equipos.Count)
        {
            // Sin esto, el mismo equipo repetido inflaría el estimado con una sola línea real.
            yield return new ValidationResult(
                "Hay equipos repetidos en la solicitud.", new[] { nameof(Equipos) });
        }
    }
}
