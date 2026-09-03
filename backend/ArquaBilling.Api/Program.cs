using System.Text;
using System.Text.Json.Serialization;
using ArquaBilling.Api.Common;
using ArquaBilling.Api.Data;
using ArquaBilling.Api.Entities;
using ArquaBilling.Api.Helpers;
using ArquaBilling.Api.Interfaces;
using ArquaBilling.Api.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization; // IAuthorizationMiddlewareResultHandler
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

// Railway (y otros PaaS) inyectan el puerto por la env var PORT y esperan que la app escuche
// en 0.0.0.0:$PORT. En DEV no existe PORT -> no se toca el binding (sigue con launchSettings /
// ASPNETCORE_URLS como hoy).
var port = Environment.GetEnvironmentVariable("PORT");
if (!string.IsNullOrEmpty(port))
{
    builder.WebHost.UseUrls($"http://0.0.0.0:{port}");
}

// ---------------------------------------------------------------------------
// Services (DI container)
// ---------------------------------------------------------------------------

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        // Enums como texto en el JSON (ej. DocumentType "Cedula"), consistente con la DB.
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
    });

// El 400 de validación de [ApiController] usa el mismo envelope { message, details } que 404/409.
builder.Services.Configure<ApiBehaviorOptions>(options =>
{
    options.InvalidModelStateResponseFactory = context =>
    {
        var details = context.ModelState
            .Where(kvp => kvp.Value is { Errors.Count: > 0 })
            .ToDictionary(
                kvp => kvp.Key,
                kvp => kvp.Value!.Errors.Select(e => e.ErrorMessage).ToArray());
        return new BadRequestObjectResult(new ErrorResponse("Validación fallida.", details));
    };
});

// Swagger / OpenAPI con soporte para Bearer JWT (botón Authorize en la UI).
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    var scheme = new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Pega el token JWT (sin el prefijo 'Bearer ')."
    };
    options.AddSecurityDefinition("Bearer", scheme);
    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

// Database context (PostgreSQL via Npgsql).
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// Servicios de autenticación.
builder.Services.AddSingleton<PasswordHasher<User>>();
builder.Services.AddScoped<JwtHelper>();
builder.Services.AddScoped<IAuthService, AuthService>();

// Servicios de negocio.
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IClientService, ClientService>();
builder.Services.AddScoped<IProductService, ProductService>();
builder.Services.AddScoped<IProjectService, ProjectService>();
builder.Services.AddScoped<IEquipoInstaladoService, EquipoInstaladoService>();
builder.Services.AddScoped<IInvoiceService, InvoiceService>();
builder.Services.AddScoped<IPaymentService, PaymentService>();
builder.Services.AddScoped<IWarrantyService, WarrantyService>();
builder.Services.AddScoped<IPdfService, PdfService>();
builder.Services.AddScoped<ISolicitudService, SolicitudService>();
builder.Services.AddScoped<IApplianceService, ApplianceService>();
builder.Services.AddScoped<INcfSequenceService, NcfSequenceService>();

// Captación pública: tarifa del estimado y límites anti-abuso (appsettings).
builder.Services.Configure<CaptacionOptions>(
    builder.Configuration.GetSection(CaptacionOptions.SectionName));
builder.Services.AddPublicRateLimiting();

// QuestPDF: licencia Community (gratuita, válida para este caso). Debe fijarse al inicio.
QuestPDF.Settings.License = QuestPDF.Infrastructure.LicenseType.Community;

// JWT Bearer. La clave (Jwt:Key) viene de user-secrets en Development.
var jwtKey = builder.Configuration["Jwt:Key"]
    ?? throw new InvalidOperationException("Falta Jwt:Key (configúrala en user-secrets).");

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
            ClockSkew = TimeSpan.FromMinutes(1)
        };
    });

builder.Services.AddAuthorization();

// 403 con envelope { message }: sin esto, un rol insuficiente devuelve un 403 vacío.
builder.Services.AddSingleton<IAuthorizationMiddlewareResultHandler, ForbiddenResultHandler>();

// CORS: en PROD (front y back en dominios separados) los orígenes permitidos vienen por env
// var Cors__AllowedOrigins (coma-separados). En DEV queda vacío y no molesta: el proxy de Vite
// hace mismo-origen, así que el navegador nunca dispara una petición cross-origin.
builder.Services.AddCors(options =>
    options.AddDefaultPolicy(policy => policy
        .WithOrigins(
            builder.Configuration["Cors:AllowedOrigins"]
                ?.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
            ?? Array.Empty<string>())
        .AllowAnyHeader()
        .AllowAnyMethod()));

var app = builder.Build();

// Seed inicial. La migración se aplica APARTE (manual con `dotnet ef database update`); aquí
// solo se insertan datos, de forma idempotente.
//  - DEV: esencial (admin con contraseña por defecto local) + TODOS los datos demo.
//  - PROD: SOLO lo esencial y SOLO si SEED_ESSENTIAL=true; el admin se protege con
//    ADMIN_INITIAL_PASSWORD (sin ella no se crea).
{
    var isDev = app.Environment.IsDevelopment();
    var seedEssentialProd = !isDev && Environment.GetEnvironmentVariable("SEED_ESSENTIAL") == "true";
    if (isDev || seedEssentialProd)
    {
        using var scope = app.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var hasher = scope.ServiceProvider.GetRequiredService<PasswordHasher<User>>();
        var seedLogger = scope.ServiceProvider.GetRequiredService<ILoggerFactory>().CreateLogger("Seed");
        var adminPassword = Environment.GetEnvironmentVariable("ADMIN_INITIAL_PASSWORD");

        if (isDev)
        {
            // Dev: admin con ADMIN_INITIAL_PASSWORD si está, si no Admin123* (comodidad local),
            // más todos los datos demo (clientes, proyectos, equipos…).
            await SeedData.SeedEssentialAsync(db, hasher, adminPassword ?? "Admin123*", seedLogger);
            await SeedData.SeedDemoAsync(db, hasher);
        }
        else
        {
            // Prod: solo lo esencial (catálogo de electrodomésticos + secuencia NCF + admin).
            // El admin se crea únicamente si ADMIN_INITIAL_PASSWORD está definida.
            await SeedData.SeedEssentialAsync(db, hasher, adminPassword, seedLogger);
        }
    }
}

// ---------------------------------------------------------------------------
// HTTP request pipeline
// ---------------------------------------------------------------------------

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Railway termina TLS en el borde y pasa HTTP al contenedor: la redirección a HTTPS solo
// tiene sentido en DEV (en prod haría un warning por no saber el puerto HTTPS, o un loop).
if (app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

// Antes de autenticar: al ser endpoints anónimos, el límite debe frenar al abusador
// lo más temprano posible (y así un 400 de validación también consume su cuota).
app.UseRateLimiter();

// CORS antes de autenticar. En dev la política sale vacía (el proxy hace mismo-origen y no se
// dispara CORS); en prod permite el dominio del frontend (Cors__AllowedOrigins).
app.UseCors();

// El orden importa: autenticar primero, autorizar después.
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// Health-check: verifica la conexión a la base de datos.
app.MapGet("/health", async (AppDbContext db) =>
{
    try
    {
        return await db.Database.CanConnectAsync()
            ? Results.Ok(new { status = "ok", database = "connected" })
            : Results.Json(new { status = "error", database = "disconnected" }, statusCode: 503);
    }
    catch
    {
        return Results.Json(new { status = "error", database = "disconnected" }, statusCode: 503);
    }
});

app.Run();
