namespace ArquaBilling.Api.Entities;

// Línea de garantía: cubre un equipo instalado concreto. Toma sus datos como snapshot
// del EquipoInstalado (serial, marca, modelo, meses) para inmutabilidad histórica.
public class WarrantyItem
{
    public int Id { get; set; }
    public int WarrantyId { get; set; }
    public int EquipoInstaladoId { get; set; }
    public string SerialNumber { get; set; } = null!;
    public string? Marca { get; set; }
    public string? Modelo { get; set; }
    public int WarrantyMonths { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public WarrantyItemStatus Status { get; set; }

    // Navegación
    public Warranty Warranty { get; set; } = null!;
    public EquipoInstalado EquipoInstalado { get; set; } = null!;
}
