using ArquaBilling.Api.Common;
using ArquaBilling.Api.Data;
using ArquaBilling.Api.DTOs.Users;
using ArquaBilling.Api.Entities;
using ArquaBilling.Api.Interfaces;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace ArquaBilling.Api.Services;

public class UserService : IUserService
{
    private readonly AppDbContext _db;
    private readonly PasswordHasher<User> _hasher; // el MISMO hasher que usa el login

    public UserService(AppDbContext db, PasswordHasher<User> hasher)
    {
        _db = db;
        _hasher = hasher;
    }

    public async Task<IReadOnlyList<UserResponse>> GetAllAsync(bool onlyActive = true)
    {
        var query = _db.Users.AsNoTracking();
        if (onlyActive)
        {
            query = query.Where(u => u.IsActive);
        }

        // Proyectamos directo al DTO mínimo: el PasswordHash y el Email nunca salen.
        return await query
            .OrderBy(u => u.FullName)
            .Select(u => new UserResponse(u.Id, u.FullName, u.Role))
            .ToListAsync();
    }

    public async Task<IReadOnlyList<UserManageResponse>> GetAllForManageAsync(bool includeInactive = true)
    {
        var query = _db.Users.AsNoTracking();
        if (!includeInactive)
        {
            query = query.Where(u => u.IsActive);
        }

        // Proyección explícita: el PasswordHash NUNCA se incluye.
        return await query
            .OrderBy(u => u.FullName)
            .Select(u => new UserManageResponse(
                u.Id, u.FullName, u.Email, u.Role, u.IsActive, u.CreatedAt))
            .ToListAsync();
    }

    public async Task<ServiceResult<UserManageResponse>> CreateAsync(UserCreateRequest request)
    {
        var email = request.Email.Trim().ToLower();
        if (await _db.Users.AnyAsync(u => u.Email.ToLower() == email))
        {
            return ServiceResult<UserManageResponse>.Conflict("Ya existe un usuario con ese correo.");
        }

        var user = new User
        {
            FullName = request.FullName.Trim(),
            Email = email,
            Role = request.Role!.Value, // [Required] garantiza que no es null aquí
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };
        user.PasswordHash = _hasher.HashPassword(user, request.Password);

        _db.Users.Add(user);
        await _db.SaveChangesAsync();

        return ServiceResult<UserManageResponse>.Success(ToManageResponse(user));
    }

    public async Task<ServiceResult<UserManageResponse>> UpdateAsync(
        int id, UserUpdateRequest request, int currentUserId)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == id);
        if (user is null)
        {
            return ServiceResult<UserManageResponse>.NotFound("Usuario no encontrado.");
        }

        var email = request.Email.Trim().ToLower();
        if (await _db.Users.AnyAsync(u => u.Id != id && u.Email.ToLower() == email))
        {
            return ServiceResult<UserManageResponse>.Conflict("Ya existe un usuario con ese correo.");
        }

        var newRole = request.Role!.Value;     // [Required] en el DTO
        var newActive = request.IsActive!.Value; // [Required] en el DTO

        // --- Protecciones (defensa REAL en el server, no solo en la UI) ---
        // Orden intencional: primero "último admin" (así al tocar al ÚNICO Admin sale ese
        // mensaje), luego las auto-protecciones (que aplican cuando SÍ hay más de un Admin).

        // 1) Debe quedar al menos un administrador activo. Si este usuario ES un Admin
        //    activo y el cambio lo deja de serlo (desactivado o degradado), contamos los
        //    Admin activos y bloqueamos si es el último.
        var wasActiveAdmin = user.IsActive && user.Role == UserRole.Admin;
        var willBeActiveAdmin = newActive && newRole == UserRole.Admin;
        if (wasActiveAdmin && !willBeActiveAdmin)
        {
            var activeAdmins = await _db.Users.CountAsync(u => u.IsActive && u.Role == UserRole.Admin);
            if (activeAdmins <= 1)
            {
                return ServiceResult<UserManageResponse>.Conflict(
                    "Debe existir al menos un administrador activo.");
            }
        }

        // 2) No puedes desactivar tu propia cuenta (aplica cuando NO eres el último admin).
        if (id == currentUserId && !newActive)
        {
            return ServiceResult<UserManageResponse>.Conflict("No puedes desactivar tu propia cuenta.");
        }

        // 3) No puedes quitarte a ti mismo el rol de administrador.
        if (id == currentUserId && user.Role == UserRole.Admin && newRole != UserRole.Admin)
        {
            return ServiceResult<UserManageResponse>.Conflict(
                "No puedes quitarte a ti mismo el rol de administrador.");
        }

        user.FullName = request.FullName.Trim();
        user.Email = email;
        user.Role = newRole;
        user.IsActive = newActive;

        // NOTA (JWT stateless): desactivar/degradar aquí NO invalida un token ya emitido;
        // el cambio surte efecto al expirar (máx 8h) o en el próximo login. El login sí
        // rechaza a los inactivos (AuthService).
        // TODO: revocación de tokens (lista negra / versión de credenciales) si algún día
        // se requiere efecto inmediato.

        await _db.SaveChangesAsync();
        return ServiceResult<UserManageResponse>.Success(ToManageResponse(user));
    }

    public async Task<ServiceResult> ResetPasswordAsync(int id, string newPassword)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == id);
        if (user is null)
        {
            return ServiceResult.NotFound("Usuario no encontrado.");
        }

        user.PasswordHash = _hasher.HashPassword(user, newPassword);
        await _db.SaveChangesAsync();
        return ServiceResult.Success();
    }

    private static UserManageResponse ToManageResponse(User u)
        => new(u.Id, u.FullName, u.Email, u.Role, u.IsActive, u.CreatedAt);
}
