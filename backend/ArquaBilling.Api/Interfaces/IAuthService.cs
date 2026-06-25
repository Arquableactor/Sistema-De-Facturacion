using ArquaBilling.Api.DTOs.Auth;

namespace ArquaBilling.Api.Interfaces;

public interface IAuthService
{
    // Devuelve el LoginResponse con el token si las credenciales son válidas; null si no.
    Task<LoginResponse?> LoginAsync(LoginRequest request);
}
