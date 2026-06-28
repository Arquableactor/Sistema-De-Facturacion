using System.ComponentModel.DataAnnotations;

namespace ArquaBilling.Api.DTOs.Warranties;

public class GenerateWarrantyRequest
{
    // La garantía se genera desde un proyecto y sus equipos instalados.
    [Range(1, int.MaxValue, ErrorMessage = "ProjectId es obligatorio.")]
    public int ProjectId { get; set; }

    [MaxLength(1000)]
    public string? Notes { get; set; }
}
