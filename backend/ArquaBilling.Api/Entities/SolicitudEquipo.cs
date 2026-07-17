namespace ArquaBilling.Api.Entities;

// Un equipo que el prospecto declaró tener, con su cantidad y horas de uso.
// NombreEquipo y Watts son SNAPSHOTS tomados del catálogo al enviar: si mañana APE
// corrige los vatios típicos de una nevera, esta solicitud debe seguir explicando
// el estimado con el que se calculó. Misma razón que InvoiceItem congela el precio.
public class SolicitudEquipo
{
    public int Id { get; set; }

    public int SolicitudId { get; set; }
    public int ElectrodomesticoId { get; set; }

    // Snapshots (ver arriba).
    public string NombreEquipo { get; set; } = null!;
    public int Watts { get; set; }

    public int Cantidad { get; set; }
    public decimal HorasPorDia { get; set; }

    // Navegación
    public SolicitudCliente Solicitud { get; set; } = null!;
    public ElectrodomesticoCatalogo Electrodomestico { get; set; } = null!;
}
