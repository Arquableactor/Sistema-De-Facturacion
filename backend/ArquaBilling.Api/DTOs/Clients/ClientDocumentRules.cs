using System.ComponentModel.DataAnnotations;
using System.Text.RegularExpressions;
using ArquaBilling.Api.Entities;

namespace ArquaBilling.Api.DTOs.Clients;

// Formato del documento SEGÚN EL TIPO (RD). Compartido por create y update para no
// duplicar la regla: cédula y RNC son numéricos puros; el pasaporte es alfanumérico.
// El error se reporta sobre DocumentNumber para que el front lo pinte en ese campo.
public static class ClientDocumentRules
{
    public const int CedulaDigits = 11;
    public const int RncDigits = 9;

    private static readonly string[] DocumentNumberMember = { nameof(ClientCreateRequest.DocumentNumber) };

    private static readonly Regex PassportPattern =
        new("^[A-Za-z0-9]{6,15}$", RegexOptions.Compiled);

    public static IEnumerable<ValidationResult> Validate(DocumentType? type, string? documentNumber)
    {
        // Si falta el tipo o el número, los [Required] ya lo reportan: no duplicamos.
        if (type is null || string.IsNullOrWhiteSpace(documentNumber))
        {
            yield break;
        }

        var value = documentNumber.Trim();

        switch (type.Value)
        {
            case DocumentType.Cedula:
                if (!IsDigits(value) || value.Length != CedulaDigits)
                {
                    yield return new ValidationResult(
                        $"La cédula debe tener exactamente {CedulaDigits} dígitos, sin letras ni guiones.",
                        DocumentNumberMember);
                }
                break;

            case DocumentType.Rnc:
                if (!IsDigits(value) || value.Length != RncDigits)
                {
                    yield return new ValidationResult(
                        $"El RNC debe tener exactamente {RncDigits} dígitos, sin letras ni guiones.",
                        DocumentNumberMember);
                }
                break;

            case DocumentType.Passport:
                if (!PassportPattern.IsMatch(value))
                {
                    yield return new ValidationResult(
                        "El pasaporte debe ser alfanumérico de 6 a 15 caracteres.",
                        DocumentNumberMember);
                }
                break;
        }
    }

    private static bool IsDigits(string value) => value.All(char.IsAsciiDigit);
}
