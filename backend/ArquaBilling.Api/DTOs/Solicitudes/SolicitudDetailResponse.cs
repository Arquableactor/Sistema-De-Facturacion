using ArquaBilling.Api.Entities;

namespace ArquaBilling.Api.DTOs.Solicitudes;

// Detalle para el revisor: todo lo de la fila + los equipos que marcó el prospecto,
// cada uno con su consumo (el snapshot de watts, no el catálogo actual), para que se
// vea de dónde sale el estimado total.
public record SolicitudDetailResponse(
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
    string? Notas,
    DateTime CreatedAt,
    DateTime? RevisadoAt,
    string? RevisadoPorNombre,
    string? MotivoRechazo,
    int? ClienteCreadoId,
    IReadOnlyList<SolicitudEquipoLine> Equipos);

// Una línea del detalle. KwhDia = watts × cantidad × horas / 1000 (con el snapshot).
public record SolicitudEquipoLine(
    string NombreEquipo,
    int Watts,
    int Cantidad,
    decimal HorasPorDia,
    decimal KwhDia);
