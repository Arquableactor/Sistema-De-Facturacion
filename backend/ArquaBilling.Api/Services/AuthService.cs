using ArquaBilling.Api.Data;
using ArquaBilling.Api.DTOs.Auth;
using ArquaBilling.Api.Entities;
using ArquaBilling.Api.Helpers;
using ArquaBilling.Api.Interfaces;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace ArquaBilling.Api.Services;

public class AuthService : IAuthService
{
    private readonly AppDbContext _db;
    private readonly PasswordHasher<User> _hasher;
    private readonly JwtHelper _jwt;

    public AuthService(AppDbContext db, PasswordHasher<User> hasher, JwtHelper jwt)
    {
        _db = db;
        _hasher = hasher;
        _jwt = jwt;
    }

    public async Task<LoginResponse?> LoginAsync(LoginRequest request)
    {
        var email = request.Email.Trim().ToLower();
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == email);

        // null en cualquier fallo (no existe / inactivo / contraseña mala).
        // El controller responde 401 genérico para evitar enumeración de usuarios.
        if (user is null || !user.IsActive)
        {
            return null;
        }

        var result = _hasher.VerifyHashedPassword(user, user.PasswordHash, request.Password);
        if (result == PasswordVerificationResult.Failed)
        {
            return null;
        }

        var (token, expiresAt) = _jwt.GenerateToken(user);
        return new LoginResponse(token, user.Email, user.Role.ToString(), expiresAt);
    }
}
