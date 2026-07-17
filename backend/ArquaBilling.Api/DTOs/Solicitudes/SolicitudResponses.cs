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
// SOLO consumo (kWh): la captación no muestra un costo en RD$. La tarifa dominicana es
// escalonada y varía por distribuidora, y prometer un número en pesos aquí sería
// inexacto; el costo real lo calcula APE en la visita técnica.
public record SolicitudCreatedResponse(
    string NumeroSolicitud,
    decimal ConsumoEstimadoKwhDia,
    decimal ConsumoEstimadoKwhMes);
