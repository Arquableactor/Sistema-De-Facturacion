using System.ComponentModel.DataAnnotations;
using ArquaBilling.Api.DTOs.Shared;

namespace ArquaBilling.Api.DTOs.Solicitudes;

// Datos CORREGIDOS con los que se crea el Cliente al aprobar. El prospecto los tecleó
// en el móvil y suelen venir imperfectos, así que el revisor los puede ajustar.
//
// NO lleva documento a propósito: el tipo y número NO son editables (son el ancla de
// identidad y la base del bloqueo por duplicado). El service usa SIEMPRE el documento
// de la solicitud original; si alguien mete documentType/documentNumber en el JSON, el
// binder los descarta porque esta clase no los tiene. Esa es la primera de las dos redes.
//
// Mismos atributos que ClientCreateRequest (incluido el [PhoneRd] compartido): [ApiController]
// los valida y devuelve 400 con details, sin duplicar reglas.
public class AprobarSolicitudRequest
{
    [Required(ErrorMessage = "El nombre es obligatorio.")]
    [MaxLength(200)]
    public string Nombre { get; set; } = string.Empty;

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
}
