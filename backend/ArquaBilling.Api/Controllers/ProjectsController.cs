using ArquaBilling.Api.DTOs.Projects;
using ArquaBilling.Api.Entities;
using ArquaBilling.Api.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ArquaBilling.Api.Controllers;

// Solo traduce HTTP <-> ServiceResult. La lógica vive en ProjectService.
[Route("api/[controller]")]
[Authorize]
public class ProjectsController : ApiControllerBase
{
    private readonly IProjectService _service;

    public ProjectsController(IProjectService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] int? clientId = null,
        [FromQuery] ProjectStage? etapa = null,
        [FromQuery] bool includeInactive = false)
        => Ok(await _service.GetAllAsync(clientId, etapa, includeInactive));

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var result = await _service.GetByIdAsync(id);
        return result.IsSuccess ? Ok(result.Value) : MapError(result);
    }

    [HttpPost]
    public async Task<IActionResult> Create(ProjectCreateRequest request)
    {
        var result = await _service.CreateAsync(request);
        return result.IsSuccess
            ? CreatedAtAction(nameof(GetById), new { id = result.Value!.Id }, result.Value)
            : MapError(result);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, ProjectUpdateRequest request)
    {
        var result = await _service.UpdateAsync(id, request);
        return result.IsSuccess ? Ok(result.Value) : MapError(result);
    }

    // Actualización puntual de etapa + progreso (progreso manual).
    [HttpPatch("{id:int}/stage-progress")]
    public async Task<IActionResult> UpdateStageProgress(int id, ProjectStageProgressRequest request)
    {
        var result = await _service.UpdateStageProgressAsync(id, request);
        return result.IsSuccess ? Ok(result.Value) : MapError(result);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var result = await _service.DeleteAsync(id);
        return result.IsSuccess ? NoContent() : MapError(result);
    }
}
