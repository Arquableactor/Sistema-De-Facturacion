using ArquaBilling.Api.Entities;

namespace ArquaBilling.Api.DTOs.Users;

// DTO de GESTIÓN (solo Admin). Incluye Email/IsActive/CreatedAt para administrar
// usuarios. El PasswordHash NUNCA se expone.
public record UserManageResponse(
    int Id,
    string FullName,
    string Email,
    UserRole Role,
    bool IsActive,
    DateTime CreatedAt);
