using ArquaBilling.Api.Entities;

namespace ArquaBilling.Api.DTOs.Users;

// DTO MÍNIMO para poblar selects de "responsable". NO expone PasswordHash ni Email:
// esto es lectura para asignación, no gestión de usuarios.
public record UserResponse(
    int Id,
    string FullName,
    UserRole Role);
