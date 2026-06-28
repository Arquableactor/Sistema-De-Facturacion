namespace ArquaBilling.Api.Entities;

// Centro del sistema: una instalación solar de un cliente. Las facturas, los equipos
// instalados y la garantía cuelgan del proyecto.
public class Project
{
    public int Id { get; set; }
    public int ClientId { get; set; }
    public string Nombre { get; set; } = null!;
    public decimal CapacidadKwp { get; set; }
    public ProjectStage Etapa { get; set; }
    // Progreso manual (0-100): lo fija el usuario, NO se deriva de la etapa.
    public int Progreso { get; set; }
    public DateTime FechaInicio { get; set; }
    public DateTime? FechaClave { get; set; }
    public int ResponsableId { get; set; } // técnico responsable (User)
    public decimal Costo { get; set; }
    public decimal Presupuesto { get; set; }
    public string? Notes { get; set; }
    public bool IsActive { get; set; } // borrado lógico
    public DateTime CreatedAt { get; set; }

    // Navegación
    public Client Client { get; set; } = null!;
    public User Responsable { get; set; } = null!;
    public ICollection<Invoice> Invoices { get; set; } = new List<Invoice>();
    public ICollection<EquipoInstalado> EquiposInstalados { get; set; } = new List<EquipoInstalado>();
    public ICollection<Warranty> Warranties { get; set; } = new List<Warranty>();

    // TODO: documentos del proyecto (subida de archivos) — fuera de alcance por ahora.
}
