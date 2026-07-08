using ArquaBilling.Api.Common;
using ArquaBilling.Api.DTOs.Users;

namespace ArquaBilling.Api.Interfaces;

public interface IUserService
{
    // Lista mínima para poblar selects (ej. responsable de un proyecto). Cualquier
    // autenticado. Por defecto solo activos: un responsable inactivo no debe asignarse.
    Task<IReadOnlyList<UserResponse>> GetAllAsync(bool onlyActive = true);

    // --- Gestión de usuarios (solo Admin) ---

    // Lista completa (con email/estado/fecha) para administrar. Incluye inactivos por defecto.
    Task<IReadOnlyList<UserManageResponse>> GetAllForManageAsync(bool includeInactive = true);

    Task<ServiceResult<UserManageResponse>> CreateAsync(UserCreateRequest request);

    // currentUserId (del token) permite las protecciones de auto-desactivación/degradación.
    Task<ServiceResult<UserManageResponse>> UpdateAsync(int id, UserUpdateRequest request, int currentUserId);

    Task<ServiceResult> ResetPasswordAsync(int id, string newPassword);
}
