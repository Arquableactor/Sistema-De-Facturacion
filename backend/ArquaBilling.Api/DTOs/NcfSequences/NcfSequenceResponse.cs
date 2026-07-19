namespace ArquaBilling.Api.DTOs.NcfSequences;

// Vista de una secuencia para la pantalla de administración. usados/restantes/diasParaVencer
// y estado son CALCULADOS (NcfStatus), no columnas.
public record NcfSequenceResponse(
    int Id,
    string Type,
    string? NumeroAutorizacion,
    int StartNumber,
    int CurrentNumber,
    int MaxNumber,
    int Usados,
    int Restantes,
    DateTime? FechaVencimiento,
    int? DiasParaVencer,
    bool IsActive,
    string Estado);
