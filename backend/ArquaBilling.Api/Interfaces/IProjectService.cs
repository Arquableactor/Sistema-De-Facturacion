using ArquaBilling.Api.Common;
using ArquaBilling.Api.DTOs.Projects;
using ArquaBilling.Api.Entities;

namespace ArquaBilling.Api.Interfaces;

public interface IProjectService
{
    Task<IReadOnlyList<ProjectListItem>> GetAllAsync(
        int? clientId = null, ProjectStage? etapa = null, bool includeInactive = false);
    Task<ServiceResult<ProjectResponse>> GetByIdAsync(int id);
    Task<ServiceResult<ProjectResponse>> CreateAsync(ProjectCreateRequest request);
    Task<ServiceResult<ProjectResponse>> UpdateAsync(int id, ProjectUpdateRequest request);
    Task<ServiceResult<ProjectResponse>> UpdateStageProgressAsync(int id, ProjectStageProgressRequest request);
    Task<ServiceResult> DeleteAsync(int id);
}
