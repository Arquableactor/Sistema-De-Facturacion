using System.ComponentModel.DataAnnotations;

namespace ArquaBilling.Api.DTOs.NcfSequences;

// Edición de datos ADMINISTRATIVOS de una secuencia. Solo lo que la DGII puede corregir o
// lo que APE decide (activar/desactivar).
//
// A PROPÓSITO no lleva CurrentNumber, StartNumber, MaxNumber ni Type: son los números del
// comprobante fiscal y NO son editables. Si alguien los mete en el JSON, el binder los
// descarta porque esta clase no los tiene — misma red que AprobarSolicitudRequest con el
// documento. Retroceder CurrentNumber reemitiría un NCF ya usado (dos facturas, un mismo
// comprobante ante la DGII): por eso no existe el campo, no basta con "no validarlo".
public class NcfSequenceUpdateRequest
{
    // Opcionales (no [Required]): así "desactivar" (PUT con isActive=false que conserva los
    // valores actuales) funciona incluso en la fila sembrada, que nació sin estos datos. El
    // modal de edición SÍ los exige en la UI para un alta/edición real.
    [MaxLength(50)]
    public string? NumeroAutorizacion { get; set; }

    public DateTime? FechaVencimiento { get; set; }

    public bool IsActive { get; set; }
}
