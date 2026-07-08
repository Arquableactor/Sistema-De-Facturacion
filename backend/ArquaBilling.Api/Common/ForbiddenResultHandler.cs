using System.Text.Json;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Authorization.Policy;

namespace ArquaBilling.Api.Common;

// Por defecto, un 403 (rol insuficiente) sale con cuerpo VACÍO. Este handler conserva
// el comportamiento estándar del framework para todo lo demás, pero cuando la
// autorización resulta Forbidden escribe nuestro envelope consistente:
//   { "message": "No tienes permiso para esta acción." }
// El 401 (no autenticado) lo sigue manejando el challenge de JwtBearer sin tocar.
public sealed class ForbiddenResultHandler : IAuthorizationMiddlewareResultHandler
{
    private readonly AuthorizationMiddlewareResultHandler _default = new();

    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);

    public async Task HandleAsync(
        RequestDelegate next,
        HttpContext context,
        AuthorizationPolicy policy,
        PolicyAuthorizationResult authorizeResult)
    {
        // Solo interceptamos Forbidden (autenticado pero sin el rol). Challenge (401) y
        // el flujo normal quedan en manos del handler por defecto.
        if (authorizeResult.Forbidden && !context.Response.HasStarted)
        {
            context.Response.StatusCode = StatusCodes.Status403Forbidden;
            context.Response.ContentType = "application/json; charset=utf-8";
            var payload = JsonSerializer.Serialize(
                new ErrorResponse("No tienes permiso para esta acción."), JsonOptions);
            await context.Response.WriteAsync(payload);
            return;
        }

        await _default.HandleAsync(next, context, policy, authorizeResult);
    }
}
