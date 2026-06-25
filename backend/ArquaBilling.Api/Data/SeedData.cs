using ArquaBilling.Api.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace ArquaBilling.Api.Data;

public static class SeedData
{
    // Datos iniciales. Idempotente: si ya hay usuarios, no hace nada.
    // El PasswordHasher viene de DI (mismo que usa AuthService para verificar).
    public static async Task SeedAsync(AppDbContext db, PasswordHasher<User> hasher)
    {
        if (await db.Users.AnyAsync())
        {
            return;
        }

        var now = DateTime.UtcNow;

        var admin = new User
        {
            FullName = "Administrador",
            Email = "admin@arqua.local",
            Role = UserRole.Admin,
            IsActive = true,
            CreatedAt = now
        };
        admin.PasswordHash = hasher.HashPassword(admin, "Admin123*");
        db.Users.Add(admin);

        db.NcfSequences.Add(new NcfSequence
        {
            Type = "B01",
            CurrentNumber = 0,
            MaxNumber = 100000,
            IsActive = true,
            CreatedAt = now
        });

        db.Products.AddRange(
            new Product
            {
                Name = "Panel solar 550W",
                Code = "PNL-550",
                Description = "Panel monocristalino 550W",
                Price = 12500.00m,
                WarrantyMonths = 120,
                IsSerialized = true,
                IsActive = true,
                CreatedAt = now
            },
            new Product
            {
                Name = "Inversor híbrido 5kW",
                Code = "INV-5K",
                Description = "Inversor híbrido 5kW 48V",
                Price = 42000.00m,
                WarrantyMonths = 60,
                IsSerialized = true,
                IsActive = true,
                CreatedAt = now
            },
            new Product
            {
                Name = "Batería de litio 5kWh",
                Code = "BAT-5K",
                Description = "Batería LiFePO4 5kWh",
                Price = 65000.00m,
                WarrantyMonths = 60,
                IsSerialized = true,
                IsActive = true,
                CreatedAt = now
            }
        );

        await db.SaveChangesAsync();
    }
}
