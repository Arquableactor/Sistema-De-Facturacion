using ArquaBilling.Api.Data;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// ---------------------------------------------------------------------------
// Services (DI container)
// ---------------------------------------------------------------------------

builder.Services.AddControllers();

// Swagger / OpenAPI.
// Learn more at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Database context (PostgreSQL via Npgsql).
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// TODO: Configure JWT authentication.
// builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
//     .AddJwtBearer(options => { /* ... */ });

// TODO: Register application services (scoped) and their interfaces.
// builder.Services.AddScoped<IAuthService, AuthService>();
// builder.Services.AddScoped<IInvoiceService, InvoiceService>();
// builder.Services.AddScoped<IPaymentService, PaymentService>();
// builder.Services.AddScoped<IWarrantyService, WarrantyService>();
// builder.Services.AddScoped<IPdfService, PdfService>();

// TODO: Configure CORS (allow the React web app and the Flutter mobile app).
// builder.Services.AddCors(options =>
//     options.AddDefaultPolicy(policy => policy.AllowAnyHeader().AllowAnyMethod()));

var app = builder.Build();

// ---------------------------------------------------------------------------
// HTTP request pipeline
// ---------------------------------------------------------------------------

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// TODO: Enable CORS once the policy above is configured.
// app.UseCors();

// TODO: Enable authentication once JWT is configured.
// app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
