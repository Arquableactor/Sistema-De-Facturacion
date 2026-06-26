using ArquaBilling.Api.Common;
using ArquaBilling.Api.DTOs.Clients;

namespace ArquaBilling.Api.Interfaces;

public interface IClientService
{
    Task<IReadOnlyList<ClientResponse>> GetAllAsync(bool includeInactive = false);
    Task<ServiceResult<ClientResponse>> GetByIdAsync(int id);
    Task<ServiceResult<ClientResponse>> CreateAsync(ClientCreateRequest request);
    Task<ServiceResult<ClientResponse>> UpdateAsync(int id, ClientUpdateRequest request);
    Task<ServiceResult> DeleteAsync(int id);
}
