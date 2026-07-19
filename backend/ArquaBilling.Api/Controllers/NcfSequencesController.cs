using ArquaBilling.Api.DTOs.NcfSequences;
using ArquaBilling.Api.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ArquaBilling.Api.Controllers;

// Administración de secuencias NCF. Ruta explícita en kebab-case (no [controller], que daría
// "NcfSequences"). Todo requiere sesión; administrar es solo Admin, pero el resumen de estado
// lo ve también Facturación (Sales) para sus avisos, aunque no administre.
[Route("api/ncf-sequences")]
[Authorize]
public class NcfSequencesController : ApiControllerBase
{
    private readonly INcfSequenceService _service;

    public NcfSequencesController(INcfSequenceService service)
    {
        _service = service;
    }

    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetAll()
        => Ok(await _service.GetAllAsync());

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Create(NcfSequenceCreateRequest request)
    {
        var result = await _service.CreateAsync(request);
        return result.IsSuccess
            ? CreatedAtAction(nameof(GetAll), new { id = result.Value!.Id }, result.Value)
            : MapError(result);
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(int id, NcfSequenceUpdateRequest request)
    {
        var result = await _service.UpdateAsync(id, request);
        return result.IsSuccess ? Ok(result.Value) : MapError(result);
    }

    // Resumen ligero para los avisos del dashboard y el banner de facturación.
    [HttpGet("estado")]
    [Authorize(Roles = "Admin,Sales")]
    public async Task<IActionResult> GetEstado()
        => Ok(await _service.GetEstadoAsync());
}
