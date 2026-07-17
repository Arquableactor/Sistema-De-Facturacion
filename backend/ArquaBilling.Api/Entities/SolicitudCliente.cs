namespace ArquaBilling.Api.Entities;

// Solicitud PÚBLICA de evaluación solar: la llena un prospecto desde el link que APE
// comparte por WhatsApp, sin cuenta ni login. Es la antesala de Client: al aprobarse
// (bandeja interna, sesión 2) se convertirá en uno. Por eso sus datos personales
// cumplen EXACTAMENTE las mismas reglas que Client — si aceptáramos aquí lo que Client
// rechaza, la aprobación reventaría.
public class SolicitudCliente
{
    public int Id { get; set; }

    // Folio visible para el prospecto (ej. "APE-SOL-2026-000148"). Derivado del Id,
    // como InvoiceNumber: la DB garantiza la unicidad.
    public string NumeroSolicitud { get; set; } = null!;

    // ----- Datos personales (mismas reglas que Client) -----
    public string Nombre { get; set; } = null!;
    public DocumentType DocumentType { get; set; }
    public string DocumentNumber { get; set; } = null!;
    public string Phone { get; set; } = null!;
    public string? Email { get; set; }

    // Provincia aparte de la dirección: sirve para rutear al técnico de la zona.
    public string? Provincia { get; set; }
    public string Ubicacion { get; set; } = null!;

    // Lo que el prospecto paga de luz al mes (RD$). OPCIONAL y es el dato REAL: no
    // entra en el estimado, pero le sirve a APE para la propuesta.
    public decimal? FacturaLuzMensual { get; set; }

    // Calculado y congelado por el SERVER con los watts del catálogo.
    public decimal ConsumoEstimadoKwhDia { get; set; }

    public SolicitudEstado Estado { get; set; }

    // ----- Campos de la revisión (sesión 2): nacen nulos -----
    public int? ClienteCreadoId { get; set; }
    public int? RevisadoPorUserId { get; set; }
    public DateTime? RevisadoAt { get; set; }
    public string? MotivoRechazo { get; set; }

    public string? Notas { get; set; }
    public DateTime CreatedAt { get; set; }

    // Navegación
    public Client? ClienteCreado { get; set; }
    public User? RevisadoPor { get; set; }
    public ICollection<SolicitudEquipo> Equipos { get; set; } = new List<SolicitudEquipo>();
}
