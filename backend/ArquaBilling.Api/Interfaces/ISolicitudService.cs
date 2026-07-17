using ArquaBilling.Api.Common;
using ArquaBilling.Api.DTOs.Solicitudes;
using ArquaBilling.Api.Entities;

namespace ArquaBilling.Api.Interfaces;

public interface ISolicitudService
{
    // --- Público (captación anónima) ---
    // Catálogo activo para el formulario público.
    Task<IReadOnlyList<ApplianceResponse>> GetAppliancesAsync();

    // Registra la solicitud de un prospecto y devuelve su estimado (calculado aquí,
    // nunca recibido del cliente).
    Task<ServiceResult<SolicitudCreatedResponse>> CreateAsync(SolicitudCreateRequest request);

    // --- Bandeja interna (Admin / Facturación) ---
    Task<IReadOnlyList<SolicitudListItem>> GetAllAsync(SolicitudEstado? estado, string? search);
    Task<ServiceResult<SolicitudDetailResponse>> GetByIdAsync(int id);

    // Aprobar crea el Cliente; currentUserId (del token) queda como revisor.
    Task<ServiceResult<SolicitudDetailResponse>> AprobarAsync(int id, AprobarSolicitudRequest request, int currentUserId);
    Task<ServiceResult<SolicitudDetailResponse>> RechazarAsync(int id, RechazarSolicitudRequest request, int currentUserId);
}
