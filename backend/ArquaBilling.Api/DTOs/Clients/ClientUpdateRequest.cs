using System.ComponentModel.DataAnnotations;
using ArquaBilling.Api.Entities;

namespace ArquaBilling.Api.DTOs.Clients;

public class ClientUpdateRequest
{
    [Required, MaxLength(200)]
    public string Name { get; set; } = string.Empty;

    [Required]
    public DocumentType? DocumentType { get; set; }

    [Required, MaxLength(30)]
    public string DocumentNumber { get; set; } = string.Empty;

    [Required, MaxLength(30)]
    public string Phone { get; set; } = string.Empty;

    [EmailAddress, MaxLength(256)]
    public string? Email { get; set; }

    [Required, MaxLength(300)]
    public string InstallationAddress { get; set; } = string.Empty;

    // PUT = reemplazo completo del recurso (incluye el estado activo/inactivo).
    public bool IsActive { get; set; }
}
