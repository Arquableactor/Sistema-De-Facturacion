using ArquaBilling.Api.Common;
using ArquaBilling.Api.DTOs.Solicitudes;

namespace ArquaBilling.Api.Interfaces;

public interface ISolicitudService
{
    // Catálogo activo para el formulario público.
    Task<IReadOnlyList<ApplianceResponse>> GetAppliancesAsync();

    // Registra la solicitud de un prospecto y devuelve su estimado (calculado aquí,
    // nunca recibido del cliente).
    Task<ServiceResult<SolicitudCreatedResponse>> CreateAsync(SolicitudCreateRequest request);
}
