using System.ComponentModel.DataAnnotations;
using ArquaBilling.Api.Entities;

namespace ArquaBilling.Api.DTOs.Projects;

// Actualización puntual de etapa + progreso (el progreso es manual, no derivado de la etapa).
public class ProjectStageProgressRequest
{
    public ProjectStage Etapa { get; set; }

    [Range(0, 100, ErrorMessage = "El progreso debe estar entre 0 y 100.")]
    public int Progreso { get; set; }
}
