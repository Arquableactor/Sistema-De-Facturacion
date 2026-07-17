namespace ArquaBilling.Api.DTOs.Solicitudes;

// Catálogo que consume el formulario público. Expone SOLO lo necesario para pintar y
// estimar: nada de IsActive/CreatedAt ni conteos internos.
public record ApplianceResponse(
    int Id,
    string Nombre,
    int Watts,
    decimal HorasSugeridas,
    string? Categoria);

// Respuesta al enviar la solicitud. Devuelve el folio (para que el prospecto pueda
// referenciarlo) y el estimado CALCULADO POR EL SERVER, que es la verdad: el front
// muestra este número, no el suyo.
// CostoElectricoEstimadoMensual es DERIVADO (kWh/mes × tarifa) y NO se guarda: la
// tarifa cambia, así que congelarla sería guardar una mentira futura.
public record SolicitudCreatedResponse(
    string NumeroSolicitud,
    decimal ConsumoEstimadoKwhDia,
    decimal ConsumoEstimadoKwhMes,
    decimal CostoElectricoEstimadoMensual);
