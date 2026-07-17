using System.ComponentModel.DataAnnotations;

namespace ArquaBilling.Api.DTOs.Appliances;

// Edición de un electrodoméstico. PUT = reemplazo completo (incluye el estado activo).
// Editar los watts NO cambia solicitudes ya enviadas: guardaron su snapshot.
public class ApplianceUpdateRequest
{
    [Required(ErrorMessage = "El nombre es obligatorio.")]
    [MaxLength(100)]
    public string Nombre { get; set; } = string.Empty;

    [Range(1, 100000, ErrorMessage = "Los watts deben ser mayores que 0.")]
    public int WattsTipicos { get; set; }

    [Range(0.5, 24, ErrorMessage = "Las horas sugeridas deben estar entre 0.5 y 24.")]
    public decimal HorasPorDiaSugeridas { get; set; }

    [MaxLength(50)]
    public string? Categoria { get; set; }

    public bool IsActive { get; set; }
}
