using ArquaBilling.Api.DTOs.Clients;
using ArquaBilling.Api.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ArquaBilling.Api.Controllers;

// El controller solo habla HTTP: recibe, llama al service y traduce el resultado.
// Nada de lógica de negocio ni acceso directo a la base de datos.
[Route("api/[controller]")]
[Authorize]
public class ClientsController : ApiControllerBase
{
    private readonly IClientService _service;

    public ClientsController(IClientService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] bool includeInactive = false)
        => Ok(await _service.GetAllAsync(includeInactive));

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var result = await _service.GetByIdAsync(id);
        return result.IsSuccess ? Ok(result.Value) : MapError(result);
    }

    [HttpPost]
    [Authorize(Roles = "Admin,Sales")] // Técnico: solo lectura
    public async Task<IActionResult> Create(ClientCreateRequest request)
    {
        var result = await _service.CreateAsync(request);
        return result.IsSuccess
            ? CreatedAtAction(nameof(GetById), new { id = result.Value!.Id }, result.Value)
            : MapError(result);
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = "Admin,Sales")]
    public async Task<IActionResult> Update(int id, ClientUpdateRequest request)
    {
        var result = await _service.UpdateAsync(id, request);
        return result.IsSuccess ? Ok(result.Value) : MapError(result);
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Admin,Sales")]
    public async Task<IActionResult> Delete(int id)
    {
        var result = await _service.DeleteAsync(id);
        return result.IsSuccess ? NoContent() : MapError(result);
    }
}
