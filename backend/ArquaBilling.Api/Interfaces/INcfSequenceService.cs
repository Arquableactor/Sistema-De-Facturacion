using ArquaBilling.Api.Common;
using ArquaBilling.Api.DTOs.NcfSequences;

namespace ArquaBilling.Api.Interfaces;

public interface INcfSequenceService
{
    Task<IReadOnlyList<NcfSequenceResponse>> GetAllAsync();
    Task<ServiceResult<NcfSequenceResponse>> CreateAsync(NcfSequenceCreateRequest request);
    Task<ServiceResult<NcfSequenceResponse>> UpdateAsync(int id, NcfSequenceUpdateRequest request);
    Task<IReadOnlyList<NcfEstadoResponse>> GetEstadoAsync();
}
