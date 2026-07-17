using System.Security.Claims;
using ArquaBilling.Api.DTOs.Solicitudes;
using ArquaBilling.Api.Entities;
using ArquaBilling.Api.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ArquaBilling.Api.Controllers;

// Bandeja INTERNA de solicitudes (Admin y Facturación). Es captación de clientes, una
// función comercial: el Técnico no entra. Distinto del controller PÚBLICO (anónimo, en
// api/public) que solo recibe solicitudes; este las gestiona.
[Route("api/solicitudes")]
[Authorize(Roles = "Admin,Sales")]
public class SolicitudesController : ApiControllerBase
{
    private readonly ISolicitudService _service;

    public SolicitudesController(ISolicitudService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] SolicitudEstado? estado = null, [FromQuery] string? search = null)
        => Ok(await _service.GetAllAsync(estado, search));

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var result = await _service.GetByIdAsync(id);
        return result.IsSuccess ? Ok(result.Value) : MapError(result);
    }

    [HttpPost("{id:int}/aprobar")]
    public async Task<IActionResult> Aprobar(int id, AprobarSolicitudRequest request)
    {
        var userId = GetUserId();
        if (userId is null)
        {
            return Unauthorized();
        }

        var result = await _service.AprobarAsync(id, request, userId.Value);
        return result.IsSuccess ? Ok(result.Value) : MapError(result);
    }

    [HttpPost("{id:int}/rechazar")]
    public async Task<IActionResult> Rechazar(int id, RechazarSolicitudRequest request)
    {
        var userId = GetUserId();
        if (userId is null)
        {
            return Unauthorized();
        }

        var result = await _service.RechazarAsync(id, request, userId.Value);
        return result.IsSuccess ? Ok(result.Value) : MapError(result);
    }

    // El id del revisor sale del token (claim sub/NameIdentifier), nunca del request.
    private int? GetUserId()
        => int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var id) ? id : null;
}
