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

        // ----- Catálogo de productos (con campos de equipo) -----
        var panel = new Product
        {
            Name = "Panel solar 550W",
            Code = "PNL-550",
            Description = "Panel monocristalino 550W",
            Price = 12500.00m,
            WarrantyMonths = 120,
            IsSerialized = true,
            Categoria = EquipmentCategory.PanelSolar,
            Marca = "Canadian Solar",
            Modelo = "CS7L-550MS",
            Especificacion = "Monocristalino PERC 550W",
            IsActive = true,
            CreatedAt = now
        };
        var inversor = new Product
        {
            Name = "Inversor híbrido 5kW",
            Code = "INV-5K",
            Description = "Inversor híbrido 5kW 48V",
            Price = 42000.00m,
            WarrantyMonths = 60,
            IsSerialized = true,
            Categoria = EquipmentCategory.Inversor,
            Marca = "Growatt",
            Modelo = "SPF 5000 ES",
            Especificacion = "Híbrido 5kW 48V MPPT",
            IsActive = true,
            CreatedAt = now
        };
        var bateria = new Product
        {
            Name = "Batería de litio 5kWh",
            Code = "BAT-5K",
            Description = "Batería LiFePO4 5kWh",
            Price = 65000.00m,
            WarrantyMonths = 60,
            IsSerialized = true,
            Categoria = EquipmentCategory.Bateria,
            Marca = "Pylontech",
            Modelo = "US5000",
            Especificacion = "LiFePO4 5kWh 48V",
            IsActive = true,
            CreatedAt = now
        };
        db.Products.AddRange(panel, inversor, bateria);

        // ----- Cliente demo -----
        var clienteDemo = new Client
        {
            Name = "Cliente Demo Solar",
            DocumentType = DocumentType.Rnc,
            DocumentNumber = "130000001",
            Phone = "809-555-0100",
            Email = "demo@cliente.local",
            InstallationAddress = "Av. Demo 123, Santo Domingo",
            IsActive = true,
            CreatedAt = now
        };
        db.Clients.Add(clienteDemo);

        // ----- Proyecto demo (responsable = admin) con equipos instalados -----
        var proyectoDemo = new Project
        {
            Client = clienteDemo,
            Nombre = "Instalación Residencial Demo",
            CapacidadKwp = 5.5m,
            Etapa = ProjectStage.Montaje,
            Progreso = 60,
            FechaInicio = now,
            FechaClave = null,
            Responsable = admin,
            Costo = 250000.00m,
            Presupuesto = 300000.00m,
            Notes = "Proyecto demo sembrado.",
            IsActive = true,
            CreatedAt = now
        };
        db.Projects.Add(proyectoDemo);

        // Snapshots de Marca/Modelo/WarrantyMonths tomados del producto.
        db.EquiposInstalados.AddRange(
            NuevoEquipo(panel, proyectoDemo, clienteDemo, "PNL-DEMO-0001", now),
            NuevoEquipo(inversor, proyectoDemo, clienteDemo, "INV-DEMO-0001", now),
            NuevoEquipo(bateria, proyectoDemo, clienteDemo, "BAT-DEMO-0001", now));

        // Una sola transacción: EF ordena los inserts por las navegaciones (no se siembran
        // facturas ni garantías; esas se prueban a mano).
        await db.SaveChangesAsync();
    }

    private static EquipoInstalado NuevoEquipo(
        Product product, Project project, Client client, string serial, DateTime now) => new()
    {
        Product = product,
        Project = project,
        Client = client,
        SerialNumber = serial,
        FechaInstalacion = now,
        Marca = product.Marca,
        Modelo = product.Modelo,
        WarrantyMonths = product.WarrantyMonths,
        CreatedAt = now
    };
}
