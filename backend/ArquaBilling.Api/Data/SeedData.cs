using ArquaBilling.Api.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace ArquaBilling.Api.Data;

public static class SeedData
{
    // Datos iniciales. Cada bloque comprueba SU propia precondición, no una global:
    // el catálogo de electrodomésticos llegó después que los usuarios, así que un
    // guard único ("si ya hay usuarios, no hagas nada") lo habría dejado sin sembrar
    // para siempre en cualquier base existente.
    // El PasswordHasher viene de DI (mismo que usa AuthService para verificar).
    public static async Task SeedAsync(AppDbContext db, PasswordHasher<User> hasher)
    {
        await SeedElectrodomesticosAsync(db);
        await SeedNegocioAsync(db, hasher);
    }

    // ----- Bloque 1: catálogo de electrodomésticos (captación pública) -----
    private static async Task SeedElectrodomesticosAsync(AppDbContext db)
    {
        if (await db.ElectrodomesticosCatalogo.AnyAsync())
        {
            return;
        }

        var now = DateTime.UtcNow;
        // Vatios y horas típicas de un hogar dominicano. VARIANTES GRUESAS a propósito
        // (12k/18k/24k BTU, nevera grande/pequeña): esto capta, no dimensiona.
        // Las horas son el valor SUGERIDO que precarga el formulario.
        var items = new (string Nombre, int Watts, decimal Horas, string Categoria)[]
        {
            // Climatización
            ("Aire acondicionado 12k BTU", 1100, 8m, "Climatización"),
            ("Aire acondicionado 18k BTU", 1600, 8m, "Climatización"),
            ("Aire acondicionado 24k BTU", 2200, 8m, "Climatización"),
            ("Abanico de techo", 60, 10m, "Climatización"),
            ("Abanico de pie", 55, 8m, "Climatización"),
            // Cocina
            ("Nevera grande", 120, 24m, "Cocina"),
            ("Nevera pequeña", 80, 24m, "Cocina"),
            ("Microondas", 1200, 0.5m, "Cocina"),
            ("Estufa eléctrica", 2000, 1m, "Cocina"),
            ("Freidora de aire", 1500, 0.5m, "Cocina"),
            ("Licuadora", 400, 0.5m, "Cocina"),
            // Agua
            ("Bomba de agua", 750, 1.5m, "Agua"),
            ("Calentador de agua", 1500, 1m, "Agua"),
            ("Dispensador / enfriador", 100, 10m, "Agua"),
            // Entretenimiento
            ("Televisor", 100, 6m, "Entretenimiento"),
            ("Consola de videojuegos", 150, 2m, "Entretenimiento"),
            ("Equipo de sonido", 80, 2m, "Entretenimiento"),
            ("Computadora / laptop", 100, 4m, "Entretenimiento"),
            ("Router / internet", 12, 24m, "Entretenimiento"),
            // Lavado
            ("Lavadora", 500, 1m, "Lavado"),
            ("Secadora de ropa", 3000, 0.5m, "Lavado"),
            ("Plancha", 1200, 0.5m, "Lavado"),
            // Iluminación
            ("Bombillos LED", 10, 5m, "Iluminación"),
            ("Bombillos incandescentes", 60, 5m, "Iluminación"),
        };

        db.ElectrodomesticosCatalogo.AddRange(items.Select(i => new ElectrodomesticoCatalogo
        {
            Nombre = i.Nombre,
            WattsTipicos = i.Watts,
            HorasPorDiaSugeridas = i.Horas,
            Categoria = i.Categoria,
            IsActive = true,
            CreatedAt = now
        }));

        await db.SaveChangesAsync();
    }

    // ----- Bloque 2: usuarios, catálogo de productos, clientes y proyectos demo -----
    private static async Task SeedNegocioAsync(AppDbContext db, PasswordHasher<User> hasher)
    {
        if (await db.Users.AnyAsync())
        {
            return;
        }

        var now = DateTime.UtcNow;
        // Las fechas de proyecto se guardan a medianoche (el front manda 'YYYY-MM-DD');
        // sembramos igual para que los datos demo se comparen como los reales.
        var hoy = now.Date;

        // ----- Usuarios: uno por rol, para poder probar la matriz de permisos -----
        var admin = NuevoUsuario(hasher, "Administrador", "admin@arqua.local", UserRole.Admin, "Admin123*", now);
        var ventas = NuevoUsuario(hasher, "Laura Ventas", "ventas@arqua.local", UserRole.Sales, "Ventas123*", now);
        var tecnico = NuevoUsuario(hasher, "Pedro Técnico", "tecnico@arqua.local", UserRole.Technician, "Tecnico123*", now);
        db.Users.AddRange(admin, ventas, tecnico);

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

        // ----- Clientes: uno por tipo de documento, todos cumpliendo las reglas
        // (cédula 11 dígitos, RNC 9 dígitos, pasaporte alfanumérico; teléfono 10 dígitos
        // pelados, sin guiones). Ver ClientDocumentRules. -----
        var clienteDemo = NuevoCliente("Cliente Demo Solar", DocumentType.Rnc, "130000001",
            "8095550100", "demo@cliente.local", "Av. Demo 123, Santo Domingo", now);
        var clienteCedula = NuevoCliente("María Fernández", DocumentType.Cedula, "00112345678",
            "8295551234", "maria.fernandez@correo.local", "Calle Duarte 45, Santiago", now);
        var clienteEmpresa = NuevoCliente("Inversiones del Caribe SRL", DocumentType.Rnc, "131222333",
            "8495559876", "contacto@invcaribe.local", "Av. Winston Churchill 1099, Santo Domingo", now);
        var clientePasaporte = NuevoCliente("John Miller", DocumentType.Passport, "AB1234567",
            "8095557788", null, "Bávaro, Punta Cana, La Altagracia", now);
        db.Clients.AddRange(clienteDemo, clienteCedula, clienteEmpresa, clientePasaporte);

        // ----- Proyectos: la fecha clave nunca es anterior al inicio (regla del
        // ProjectService); uno la deja en null porque es opcional. -----
        var proyectoDemo = NuevoProyecto(clienteDemo, admin, "Instalación Residencial Demo",
            5.5m, ProjectStage.Montaje, 60, hoy.AddDays(-30), hoy.AddDays(30),
            250000.00m, 300000.00m, "Proyecto demo sembrado.", now);
        var proyectoComercial = NuevoProyecto(clienteEmpresa, tecnico, "Instalación Comercial Caribe",
            25.0m, ProjectStage.Diseno, 25, hoy.AddDays(-10), hoy.AddDays(60),
            980000.00m, 1100000.00m, "Nave industrial, 2 inversores.", now);
        var proyectoSantiago = NuevoProyecto(clienteCedula, ventas, "Instalación Residencial Santiago",
            3.3m, ProjectStage.Visita, 10, hoy, null, // sin fecha clave: es opcional
            120000.00m, 150000.00m, null, now);
        db.Projects.AddRange(proyectoDemo, proyectoComercial, proyectoSantiago);

        // Snapshots de Marca/Modelo/WarrantyMonths tomados del producto.
        db.EquiposInstalados.AddRange(
            NuevoEquipo(panel, proyectoDemo, clienteDemo, "PNL-DEMO-0001", now),
            NuevoEquipo(inversor, proyectoDemo, clienteDemo, "INV-DEMO-0001", now),
            NuevoEquipo(bateria, proyectoDemo, clienteDemo, "BAT-DEMO-0001", now),
            NuevoEquipo(panel, proyectoComercial, clienteEmpresa, "PNL-CARIBE-0001", now),
            NuevoEquipo(inversor, proyectoComercial, clienteEmpresa, "INV-CARIBE-0001", now));

        // Una sola transacción: EF ordena los inserts por las navegaciones (no se siembran
        // facturas ni garantías; esas se prueban a mano).
        await db.SaveChangesAsync();
    }

    private static User NuevoUsuario(
        PasswordHasher<User> hasher, string fullName, string email, UserRole role,
        string password, DateTime now)
    {
        var user = new User
        {
            FullName = fullName,
            Email = email,
            Role = role,
            IsActive = true,
            CreatedAt = now
        };
        user.PasswordHash = hasher.HashPassword(user, password);
        return user;
    }

    private static Client NuevoCliente(
        string name, DocumentType documentType, string documentNumber, string phone,
        string? email, string address, DateTime now) => new()
    {
        Name = name,
        DocumentType = documentType,
        DocumentNumber = documentNumber,
        Phone = phone,
        Email = email,
        InstallationAddress = address,
        IsActive = true,
        CreatedAt = now
    };

    private static Project NuevoProyecto(
        Client client, User responsable, string nombre, decimal capacidadKwp, ProjectStage etapa,
        int progreso, DateTime fechaInicio, DateTime? fechaClave, decimal costo, decimal presupuesto,
        string? notes, DateTime now) => new()
    {
        Client = client,
        Nombre = nombre,
        CapacidadKwp = capacidadKwp,
        Etapa = etapa,
        Progreso = progreso,
        FechaInicio = fechaInicio,
        FechaClave = fechaClave,
        Responsable = responsable,
        Costo = costo,
        Presupuesto = presupuesto,
        Notes = notes,
        IsActive = true,
        CreatedAt = now
    };

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
