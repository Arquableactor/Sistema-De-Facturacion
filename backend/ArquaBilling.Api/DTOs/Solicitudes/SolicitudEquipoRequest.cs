using System.ComponentModel.DataAnnotations;

namespace ArquaBilling.Api.DTOs.Solicitudes;

// Una línea del formulario público. NO manda watts a propósito: los pone el server
// desde el catálogo. Si el cliente los mandara, podría inflar (o falsear) su estimado.
public class SolicitudEquipoRequest
{
    [Range(1, int.MaxValue, ErrorMessage = "Equipo inválido.")]
    public int ElectrodomesticoId { get; set; }

    // Tope 30 igual que el formulario: nadie tiene 200 neveras, y acota el abuso.
    [Range(1, 30, ErrorMessage = "La cantidad debe estar entre 1 y 30.")]
    public int Cantidad { get; set; }

    [Range(0.5, 24, ErrorMessage = "Las horas por día deben estar entre 0.5 y 24.")]
    public decimal HorasPorDia { get; set; }
}
