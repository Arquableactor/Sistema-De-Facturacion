namespace ArquaBilling.Api.Entities;

// Catálogo de electrodomésticos para el estimado de consumo de la captación pública.
// OJO: NO es el catálogo de Products (lo que APE vende); esto es lo que el PROSPECTO
// ya tiene en su casa, y solo sirve para estimar cuánto consume.
//
// Las variantes son GRUESAS a propósito (Aire 12k / 18k / 24k, nevera grande/pequeña):
// esto capta, no dimensiona; el cálculo real lo hace APE en la visita técnica.
public class ElectrodomesticoCatalogo
{
    public int Id { get; set; }
    public string Nombre { get; set; } = null!;

    // Consumo típico en vatios. Es la ÚNICA fuente del estimado: el request nunca
    // manda watts (si no, cualquiera podría inflar su propio consumo).
    public int WattsTipicos { get; set; }

    // Horas al día sugeridas: precarga el formulario con un valor sensato (la nevera
    // 24h, el microondas 0.5h) para que el prospecto ajuste en vez de adivinar.
    public decimal HorasPorDiaSugeridas { get; set; }

    public string? Categoria { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }

    // Navegación
    public ICollection<SolicitudEquipo> SolicitudEquipos { get; set; } = new List<SolicitudEquipo>();
}
