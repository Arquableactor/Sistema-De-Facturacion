using System.ComponentModel.DataAnnotations;

namespace ArquaBilling.Api.DTOs.Appliances;

// Alta de un electrodoméstico del catálogo (Admin). Watts > 0 y horas 0.5–24 son las
// mismas cotas que valida la solicitud pública al usarlos.
public class ApplianceCreateRequest
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
}
