using ArquaBilling.Api.DTOs.Appliances;
using ArquaBilling.Api.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ArquaBilling.Api.Controllers;

// CRUD del catálogo de electrodomésticos. Solo Admin: es configuración del sistema,
// como el catálogo de productos. Distinto del público api/public/appliances (anónimo,
// solo activos): este da también los inactivos y permite editar.
[Route("api/appliances")]
[Authorize(Roles = "Admin")]
public class AppliancesController : ApiControllerBase
{
    private readonly IApplianceService _service;

    public AppliancesController(IApplianceService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] bool includeInactive = false)
        => Ok(await _service.GetAllAsync(includeInactive));

    [HttpPost]
    public async Task<IActionResult> Create(ApplianceCreateRequest request)
    {
        var result = await _service.CreateAsync(request);
        return result.IsSuccess ? Ok(result.Value) : MapError(result);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, ApplianceUpdateRequest request)
    {
        var result = await _service.UpdateAsync(id, request);
        return result.IsSuccess ? Ok(result.Value) : MapError(result);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var result = await _service.DeleteAsync(id);
        return result.IsSuccess ? NoContent() : MapError(result);
    }
}
