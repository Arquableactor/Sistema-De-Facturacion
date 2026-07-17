using System.ComponentModel.DataAnnotations;

namespace ArquaBilling.Api.DTOs.Solicitudes;

// Rechazo de una solicitud. El motivo es obligatorio: queda como registro de por qué
// no se convirtió en cliente (lo verá quien consulte la solicitud después).
public class RechazarSolicitudRequest
{
    [Required(ErrorMessage = "El motivo del rechazo es obligatorio.")]
    [MaxLength(500)]
    public string MotivoRechazo { get; set; } = string.Empty;
}
