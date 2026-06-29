using ArquaBilling.Api.Common;
using ArquaBilling.Api.DTOs.Warranties;

namespace ArquaBilling.Api.Interfaces;

public interface IWarrantyService
{
    // Genera la garantía de un proyecto a partir de sus equipos instalados.
    Task<ServiceResult<WarrantyResponse>> GenerateFromProjectAsync(
        GenerateWarrantyRequest request, int currentUserId);

    Task<ServiceResult<WarrantyResponse>> GetByIdAsync(int id);

    Task<IReadOnlyList<WarrantyListItem>> GetAllAsync(int? clientId = null, int? projectId = null);

    // Búsqueda por número de serie: ¿este equipo tiene garantía? (técnico en campo).
    Task<ServiceResult<IReadOnlyList<WarrantyResponse>>> SearchBySerialAsync(string serialNumber);

    // Verificación PÚBLICA por VerificationCode (anónima). Devuelve info mínima sin datos del cliente.
    Task<ServiceResult<PublicWarrantyVerificationResponse>> VerifyByCodeAsync(string verificationCode);
}
