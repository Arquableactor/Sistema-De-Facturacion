using ArquaBilling.Api.Entities;

namespace ArquaBilling.Api.DTOs.Solicitudes;

// Fila de la bandeja interna. Incluye los campos de revisión (nulos hasta que alguien
// la aprueba/rechaza) para que la tabla muestre quién y cuándo sin un segundo fetch.
public record SolicitudListItem(
    int Id,
    string NumeroSolicitud,
    string Nombre,
    DocumentType DocumentType,
    string DocumentNumber,
    string Phone,
    string? Email,
    string? Provincia,
    string Ubicacion,
    decimal? FacturaLuzMensual,
    decimal ConsumoEstimadoKwhDia,
    SolicitudEstado Estado,
    DateTime CreatedAt,
    DateTime? RevisadoAt,
    string? RevisadoPorNombre,
    string? MotivoRechazo,
    int? ClienteCreadoId);
