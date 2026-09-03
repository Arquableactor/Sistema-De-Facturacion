using System.ComponentModel.DataAnnotations;

namespace ArquaBilling.Api.DTOs.Users;

// Restablecer contraseña (solo Admin). Acción sensible, separada de la edición.
public class ResetPasswordRequest
{
    // La fortaleza la valida PasswordPolicy en el servicio (misma fuente que al crear).
    [Required]
    [MaxLength(128)]
    public string NewPassword { get; set; } = null!;
}
