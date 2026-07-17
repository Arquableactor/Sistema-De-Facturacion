using ArquaBilling.Api.Common;
using ArquaBilling.Api.DTOs.Appliances;

namespace ArquaBilling.Api.Interfaces;

// CRUD del catálogo de electrodomésticos (Admin). Separado del flujo de solicitudes:
// es configuración del sistema, como el catálogo de productos.
public interface IApplianceService
{
    Task<IReadOnlyList<ApplianceAdminResponse>> GetAllAsync(bool includeInactive = false);
    Task<ServiceResult<ApplianceAdminResponse>> CreateAsync(ApplianceCreateRequest request);
    Task<ServiceResult<ApplianceAdminResponse>> UpdateAsync(int id, ApplianceUpdateRequest request);
    Task<ServiceResult> DeleteAsync(int id);
}
