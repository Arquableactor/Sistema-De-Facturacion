namespace ArquaBilling.Api.Entities;

public class NcfSequence
{
    public int Id { get; set; }
    public string Type { get; set; } = null!; // Prefijo NCF, ej. "B01"

    // Rango autorizado por la DGII: [StartNumber .. MaxNumber].
    public int StartNumber { get; set; }

    // Último número EMITIDO. StartNumber-1 = ninguno emitido todavía (la primera factura
    // emite StartNumber). NUNCA editable por API/Admin: solo avanza en la emisión, dentro
    // del SELECT ... FOR UPDATE. Si retrocediera, se reemitiría un NCF ya usado.
    public int CurrentNumber { get; set; }

    public int MaxNumber { get; set; }

    // Datos de la autorización de la DGII.
    public string? NumeroAutorizacion { get; set; } // el que asigna la DGII (informativo)
    public DateTime? FechaVencimiento { get; set; }  // caducidad de la autorización

    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
}
