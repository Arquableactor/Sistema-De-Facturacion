namespace ArquaBilling.Api.Entities;

public class Client
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public DocumentType DocumentType { get; set; }
    public string DocumentNumber { get; set; } = null!;
    public string Phone { get; set; } = null!;
    public string? Email { get; set; }
    public string InstallationAddress { get; set; } = null!;
    public DateTime CreatedAt { get; set; }
    public bool IsActive { get; set; }

    // Navegación
    public ICollection<Project> Projects { get; set; } = new List<Project>();
    public ICollection<Invoice> Invoices { get; set; } = new List<Invoice>();
    public ICollection<EquipoInstalado> EquiposInstalados { get; set; } = new List<EquipoInstalado>();
    public ICollection<Warranty> Warranties { get; set; } = new List<Warranty>();
}
