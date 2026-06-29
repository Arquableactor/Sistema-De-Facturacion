using ArquaBilling.Api.DTOs.Users;

namespace ArquaBilling.Api.Interfaces;

public interface IUserService
{
    // Lista de usuarios para poblar selects (ej. responsable de un proyecto).
    // Por defecto solo activos: un responsable inactivo no debería asignarse.
    Task<IReadOnlyList<UserResponse>> GetAllAsync(bool onlyActive = true);
}
