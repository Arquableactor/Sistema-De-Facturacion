using System.Text.Json;
using System.Threading.RateLimiting;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.Extensions.Options;

namespace ArquaBilling.Api.Common;

// Rate limit de los endpoints públicos, con el limitador NATIVO de .NET 8 (sin
// librerías). Solo se aplica donde se pide con [EnableRateLimiting]: el resto de la API
// va autenticada y no lo necesita.
public static class RateLimitPolicies
{
    public const string SolicitudesPost = "solicitudes-post";
    public const string PublicGet = "public-get";

    public static IServiceCollection AddPublicRateLimiting(this IServiceCollection services)
    {
        services.AddRateLimiter(options =>
        {
            options.AddPolicy(SolicitudesPost, ctx => FixedWindowByIp(
                ctx,
                permit: Options(ctx).SolicitudesPorHora,
                window: TimeSpan.FromHours(1)));

            options.AddPolicy(PublicGet, ctx => FixedWindowByIp(
                ctx,
                permit: Options(ctx).ConsultasPorMinuto,
                window: TimeSpan.FromMinutes(1)));

            // Sin esto el 429 sale con cuerpo vacío; mantenemos el envelope { message }.
            options.OnRejected = async (context, token) =>
            {
                context.HttpContext.Response.StatusCode = StatusCodes.Status429TooManyRequests;
                context.HttpContext.Response.ContentType = "application/json; charset=utf-8";

                // Si la ventana es conocida, decimos cuándo reintentar (cortesía y estándar).
                if (context.Lease.TryGetMetadata(MetadataName.RetryAfter, out var retryAfter))
                {
                    context.HttpContext.Response.Headers.RetryAfter =
                        ((int)retryAfter.TotalSeconds).ToString();
                }

                var payload = JsonSerializer.Serialize(
                    new ErrorResponse("Has enviado varias solicitudes. Intenta más tarde."),
                    new JsonSerializerOptions(JsonSerializerDefaults.Web));
                await context.HttpContext.Response.WriteAsync(payload, token);
            };
        });

        return services;
    }

    private static CaptacionOptions Options(HttpContext ctx)
        => ctx.RequestServices.GetRequiredService<IOptions<CaptacionOptions>>().Value;

    // Particiona por IP del cliente.
    // TODO (despliegue): detrás de un reverse proxy TODAS las peticiones llegan con la
    // IP del proxy, así que un solo abusador bloquearía a todo el mundo. Hay que
    // configurar ForwardedHeaders (X-Forwarded-For) para que RemoteIpAddress sea la real.
    private static RateLimitPartition<string> FixedWindowByIp(HttpContext ctx, int permit, TimeSpan window)
    {
        var key = ctx.Connection.RemoteIpAddress?.ToString() ?? "desconocida";
        return RateLimitPartition.GetFixedWindowLimiter(key, _ => new FixedWindowRateLimiterOptions
        {
            PermitLimit = permit,
            Window = window,
            QueueLimit = 0, // no encolamos: se rechaza de una
            QueueProcessingOrder = QueueProcessingOrder.OldestFirst
        });
    }
}
