namespace ArquaBilling.Api.Entities;

// Equipo físico instalado en un proyecto. Su SerialNumber es único (un equipo físico
// no se repite). Marca/Modelo/WarrantyMonths son snapshots del producto al instalar,
// para inmutabilidad histórica (la garantía deriva de aquí).
public class EquipoInstalado
{
    public int Id { get; set; }
    public int ProductId { get; set; }
    public int ProjectId { get; set; }
    public int ClientId { get; set; } // redundante (del proyecto) pero útil para consultas
    public string SerialNumber { get; set; } = null!;
    public DateTime FechaInstalacion { get; set; }

    // Snapshots del producto al momento de instalar.
    public string? Marca { get; set; }
    public string? Modelo { get; set; }
    public int WarrantyMonths { get; set; }

    public DateTime CreatedAt { get; set; }

    // Navegación
    public Product Product { get; set; } = null!;
    public Project Project { get; set; } = null!;
    public Client Client { get; set; } = null!;
    public ICollection<WarrantyItem> WarrantyItems { get; set; } = new List<WarrantyItem>();
}
