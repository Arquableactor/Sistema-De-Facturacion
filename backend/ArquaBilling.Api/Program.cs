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
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

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

// TODO: Configure CORS (allow the React web app and the Flutter mobile app).
// builder.Services.AddCors(options =>
//     options.AddDefaultPolicy(policy => policy.AllowAnyHeader().AllowAnyMethod()));

var app = builder.Build();

// Seed inicial (solo en Development). La migración se aplica aparte con dotnet ef;
// aquí solo se insertan datos. Es idempotente: no duplica si ya hay datos.
if (app.Environment.IsDevelopment())
{
    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    var hasher = scope.ServiceProvider.GetRequiredService<PasswordHasher<User>>();
    await SeedData.SeedAsync(db, hasher);
}

// ---------------------------------------------------------------------------
// HTTP request pipeline
// ---------------------------------------------------------------------------

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// Antes de autenticar: al ser endpoints anónimos, el límite debe frenar al abusador
// lo más temprano posible (y así un 400 de validación también consume su cuota).
app.UseRateLimiter();

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
