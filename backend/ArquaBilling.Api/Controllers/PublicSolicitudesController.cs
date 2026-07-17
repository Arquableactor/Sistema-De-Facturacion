using ArquaBilling.Api.Common;
using ArquaBilling.Api.DTOs.Solicitudes;
using ArquaBilling.Api.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace ArquaBilling.Api.Controllers;

// Captación pública: el prospecto llena el formulario desde el link que APE comparte
// por WhatsApp. ANÓNIMO y, a diferencia de la verificación de garantías, ESCRIBE — por
// eso lleva rate limit por IP y honeypot (el honeypot lo resuelve el service).
[Route("api/public")]
[AllowAnonymous]
public class PublicSolicitudesController : ApiControllerBase
{
    private readonly ISolicitudService _service;

    public PublicSolicitudesController(ISolicitudService service)
    {
        _service = service;
    }

    // Catálogo de electrodomésticos para estimar el consumo.
    [HttpGet("appliances")]
    [EnableRateLimiting(RateLimitPolicies.PublicGet)]
    public async Task<IActionResult> GetAppliances()
        => Ok(await _service.GetAppliancesAsync());

    [HttpPost("solicitudes")]
    [EnableRateLimiting(RateLimitPolicies.SolicitudesPost)]
    public async Task<IActionResult> Create(SolicitudCreateRequest request)
    {
        var result = await _service.CreateAsync(request);
        // 201 sin Location: la solicitud no tiene endpoint público de lectura a
        // propósito (contiene datos personales; se lee desde la bandeja interna).
        return result.IsSuccess
            ? StatusCode(StatusCodes.Status201Created, result.Value)
            : MapError(result);
    }
}
