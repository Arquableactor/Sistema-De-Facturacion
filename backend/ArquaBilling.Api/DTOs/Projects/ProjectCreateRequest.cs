using System.ComponentModel.DataAnnotations;
using ArquaBilling.Api.Entities;

namespace ArquaBilling.Api.DTOs.Projects;

public class ProjectCreateRequest
{
    [Range(1, int.MaxValue, ErrorMessage = "ClientId es obligatorio.")]
    public int ClientId { get; set; }

    [Required, MaxLength(200)]
    public string Nombre { get; set; } = string.Empty;

    [Range(0, double.MaxValue, ErrorMessage = "La capacidad no puede ser negativa.")]
    public decimal CapacidadKwp { get; set; }

    public ProjectStage Etapa { get; set; }

    [Range(0, 100, ErrorMessage = "El progreso debe estar entre 0 y 100.")]
    public int Progreso { get; set; }

    [Required]
    public DateTime FechaInicio { get; set; }

    public DateTime? FechaClave { get; set; }

    [Range(1, int.MaxValue, ErrorMessage = "ResponsableId es obligatorio.")]
    public int ResponsableId { get; set; }

    [Range(0, double.MaxValue, ErrorMessage = "El costo no puede ser negativo.")]
    public decimal Costo { get; set; }

    [Range(0, double.MaxValue, ErrorMessage = "El presupuesto no puede ser negativo.")]
    public decimal Presupuesto { get; set; }

    [MaxLength(1000)]
    public string? Notes { get; set; }
}
