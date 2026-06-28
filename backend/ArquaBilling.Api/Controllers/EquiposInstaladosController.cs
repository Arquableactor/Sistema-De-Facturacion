using ArquaBilling.Api.DTOs.EquiposInstalados;
using ArquaBilling.Api.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ArquaBilling.Api.Controllers;

// Equipos instalados: cuelgan de un proyecto. Rutas absolutas (anidadas bajo proyecto/cliente).
[Authorize]
public class EquiposInstaladosController : ApiControllerBase
{
    private readonly IEquipoInstaladoService _service;

    public EquiposInstaladosController(IEquipoInstaladoService service)
    {
        _service = service;
    }

    [HttpPost("api/projects/{projectId:int}/equipos")]
    public async Task<IActionResult> Create(int projectId, EquipoInstaladoCreateRequest request)
    {
        var result = await _service.CreateAsync(projectId, request);
        return result.IsSuccess
            ? CreatedAtAction(nameof(GetByProject), new { projectId }, result.Value)
            : MapError(result);
    }

    [HttpGet("api/projects/{projectId:int}/equipos")]
    public async Task<IActionResult> GetByProject(int projectId)
    {
        var result = await _service.GetByProjectAsync(projectId);
        return result.IsSuccess ? Ok(result.Value) : MapError(result);
    }

    [HttpGet("api/clients/{clientId:int}/equipos")]
    public async Task<IActionResult> GetByClient(int clientId)
        => Ok(await _service.GetByClientAsync(clientId));
}
