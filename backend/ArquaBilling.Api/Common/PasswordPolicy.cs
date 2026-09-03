namespace ArquaBilling.Api.Common;

// FUENTE ÚNICA de las reglas de fortaleza de contraseña. Se usa al ESTABLECER una
// contraseña: crear usuario, restablecer contraseña y sembrar el admin de producción.
//
// NO aplica al LOGIN: un usuario con una contraseña vieja "débil" debe poder seguir
// entrando; la política solo filtra contraseñas NUEVAS.
//
// Los checks son ASCII a propósito, para que coincidan EXACTO con los del frontend
// (regex [A-Z], [a-z], [0-9], [^A-Za-z0-9]) — la doble red no debe discrepar.
public static class PasswordPolicy
{
    public const int MinLength = 8;

    // Devuelve la lista de reglas NO cumplidas (vacía = contraseña válida). Cada mensaje es
    // claro y en español, listo para mapear por campo en el envelope { message, details }.
    public static IReadOnlyList<string> Validate(string? password)
    {
        var p = password ?? string.Empty;
        var errors = new List<string>();

        if (p.Length < MinLength)
        {
            errors.Add($"Debe tener al menos {MinLength} caracteres.");
        }
        if (!p.Any(char.IsAsciiLetterUpper))
        {
            errors.Add("Debe incluir al menos una letra mayúscula.");
        }
        if (!p.Any(char.IsAsciiLetterLower))
        {
            errors.Add("Debe incluir al menos una letra minúscula.");
        }
        if (!p.Any(char.IsAsciiDigit))
        {
            errors.Add("Debe incluir al menos un número.");
        }
        if (!p.Any(c => !char.IsAsciiLetterOrDigit(c)))
        {
            errors.Add("Debe incluir al menos un carácter especial.");
        }

        return errors;
    }

    public static bool IsValid(string? password) => Validate(password).Count == 0;
}
