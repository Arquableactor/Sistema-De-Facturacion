using ArquaBilling.Api.Data;
using ArquaBilling.Api.DTOs.Users;
using ArquaBilling.Api.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace ArquaBilling.Api.Services;

public class UserService : IUserService
{
    private readonly AppDbContext _db;

    public UserService(AppDbContext db)
    {
        _db = db;
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
}
