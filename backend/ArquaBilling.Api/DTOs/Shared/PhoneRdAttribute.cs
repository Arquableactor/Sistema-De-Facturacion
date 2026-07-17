using System.ComponentModel.DataAnnotations;

namespace ArquaBilling.Api.DTOs.Shared;

// Teléfono RD sin código de país: exactamente 10 dígitos, sin guiones ni espacios.
// Antes era un [RegularExpression] copiado en cada DTO; ahora la regla y su mensaje
// viven en UN solo sitio, compartidos por Client y por la captación pública.
// No valida requerido: eso lo decide cada DTO con [Required].
[AttributeUsage(AttributeTargets.Property, AllowMultiple = false)]
public sealed class PhoneRdAttribute : ValidationAttribute
{
    public const int Digits = 10;

    public PhoneRdAttribute()
        : base($"El teléfono debe tener exactamente {Digits} dígitos.")
    {
    }

    public override bool IsValid(object? value)
    {
        // null/vacío pasa: si es obligatorio, [Required] lo reporta (sin duplicar mensajes).
        if (value is null)
        {
            return true;
        }
        if (value is not string s || s.Length == 0)
        {
            return value is string;
        }
        return s.Length == Digits && s.All(char.IsAsciiDigit);
    }
}
