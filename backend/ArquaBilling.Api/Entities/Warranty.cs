namespace ArquaBilling.Api.Entities;

// Garantía de un proyecto (no de una factura): cubre los equipos instalados del proyecto.
public class Warranty
{
    public int Id { get; set; }
    public int ProjectId { get; set; }
    public int ClientId { get; set; } // del proyecto
    public string WarrantyNumber { get; set; } = null!;
    // Código público único para verificación externa (el futuro QR del certificado lo codificará).
    public string VerificationCode { get; set; } = null!;
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public WarrantyStatus Status { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; }

    // Navegación
    public Project Project { get; set; } = null!;
    public Client Client { get; set; } = null!;
    public ICollection<WarrantyItem> Items { get; set; } = new List<WarrantyItem>();
}
