using System.Text.Json.Serialization;

namespace ArquaBilling.Api.Common;

// Envelope de error consistente para 400/404/409. "details" se omite si es null.
public record ErrorResponse(
    string Message,
    [property: JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)] object? Details = null);
