using ArquaBilling.Api.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ArquaBilling.Api.Controllers;

// ÚNICO controller anónimo del sistema. Verificación pública de autenticidad de una
// garantía (lo que abre el QR). Devuelve info MÍNIMA, sin datos personales del cliente.
[Route("api/public")]
[AllowAnonymous]
public class PublicVerificationController : ApiControllerBase
{
    private readonly IWarrantyService _service;

    public PublicVerificationController(IWarrantyService service)
    {
        _service = service;
    }

    [HttpGet("verify/{verificationCode}")]
    public async Task<IActionResult> Verify(string verificationCode)
    {
        var result = await _service.VerifyByCodeAsync(verificationCode);
        // 404 genérico si no existe (no revela "casi-coincidencias").
        return result.IsSuccess ? Ok(result.Value) : MapError(result);
    }
}
