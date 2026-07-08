using System.ComponentModel.DataAnnotations;

namespace ArquaBilling.Api.DTOs.Users;

// Restablecer contraseña (solo Admin). Acción sensible, separada de la edición.
public class ResetPasswordRequest
{
    [Required]
    [MinLength(8, ErrorMessage = "La contraseña debe tener al menos 8 caracteres.")]
    [MaxLength(128)]
    public string NewPassword { get; set; } = null!;
}
