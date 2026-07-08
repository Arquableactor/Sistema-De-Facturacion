using System.ComponentModel.DataAnnotations;
using ArquaBilling.Api.Entities;

namespace ArquaBilling.Api.DTOs.Users;

// Edición de usuario (solo Admin). NO incluye contraseña: eso es reset-password aparte.
// Role e IsActive son nullable + [Required] para no caer al default del enum/bool si
// se omiten (un rol omitido no debe volverse Admin, ni un estado omitido desactivar).
public class UserUpdateRequest
{
    [Required]
    [MaxLength(200)]
    public string FullName { get; set; } = null!;

    [Required]
    [EmailAddress]
    [MaxLength(256)]
    public string Email { get; set; } = null!;

    [Required(ErrorMessage = "El rol es obligatorio.")]
    [EnumDataType(typeof(UserRole), ErrorMessage = "Rol inválido.")]
    public UserRole? Role { get; set; }

    [Required(ErrorMessage = "El estado es obligatorio.")]
    public bool? IsActive { get; set; }
}
