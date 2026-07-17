using System.ComponentModel.DataAnnotations;
using ArquaBilling.Api.DTOs.Shared;
using ArquaBilling.Api.Entities;

namespace ArquaBilling.Api.DTOs.Clients;

public class ClientCreateRequest : IValidatableObject
{
    [Required, MaxLength(200)]
    public string Name { get; set; } = string.Empty;

    [Required]
    public DocumentType? DocumentType { get; set; }

    // El FORMATO depende del tipo (cédula/RNC numéricos, pasaporte alfanumérico):
    // esa regla cruzada vive en Validate() más abajo.
    [Required, MaxLength(30)]
    public string DocumentNumber { get; set; } = string.Empty;

    // La regla del teléfono vive en PhoneRdAttribute (compartida con la captación pública).
    [Required]
    [PhoneRd]
    [MaxLength(30)]
    public string Phone { get; set; } = string.Empty;

    [EmailAddress, MaxLength(256)]
    public string? Email { get; set; }

    [Required, MaxLength(300)]
    public string InstallationAddress { get; set; } = string.Empty;

    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
        => DocumentRules.Validate(DocumentType, DocumentNumber);
}
