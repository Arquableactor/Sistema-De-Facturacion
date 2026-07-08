using System.ComponentModel.DataAnnotations;
using ArquaBilling.Api.Entities;

namespace ArquaBilling.Api.DTOs.Users;

// Alta de usuario (solo Admin). La contraseña se hashea con el mismo PasswordHasher
// del login; nunca se guarda en claro. Role es nullable + [Required] a propósito: si
// se omite en el JSON no queremos que caiga al default del enum (Admin = 0).
public class UserCreateRequest
{
    [Required]
    [MaxLength(200)]
    public string FullName { get; set; } = null!;

    [Required]
    [EmailAddress]
    [MaxLength(256)]
    public string Email { get; set; } = null!;

    // Regla de contraseña: mínimo 8 caracteres (solo longitud).
    [Required]
    [MinLength(8, ErrorMessage = "La contraseña debe tener al menos 8 caracteres.")]
    [MaxLength(128)]
    public string Password { get; set; } = null!;

    [Required(ErrorMessage = "El rol es obligatorio.")]
    [EnumDataType(typeof(UserRole), ErrorMessage = "Rol inválido.")]
    public UserRole? Role { get; set; }
}
