using System.Security.Claims;
using ArquaBilling.Api.DTOs.Warranties;
using ArquaBilling.Api.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ArquaBilling.Api.Controllers;

// Solo traduce HTTP <-> ServiceResult. La lógica vive en WarrantyService.
[Route("api/[controller]")]
[Authorize]
public class WarrantiesController : ApiControllerBase
{
    private readonly IWarrantyService _service;
    private readonly IPdfService _pdf;

    public WarrantiesController(IWarrantyService service, IPdfService pdf)
    {
        _service = service;
        _pdf = pdf;
    }

    [HttpPost]
    [Authorize(Roles = "Admin,Technician")] // Generar garantía: Admin y Técnico (no Facturación)
    public async Task<IActionResult> Generate(GenerateWarrantyRequest request)
    {
        var userId = GetUserId();
        if (userId is null)
        {
            return Unauthorized();
        }

        var result = await _service.GenerateFromProjectAsync(request, userId.Value);
        return result.IsSuccess
            ? CreatedAtAction(nameof(GetById), new { id = result.Value!.Id }, result.Value)
            : MapError(result);
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] int? clientId = null, [FromQuery] int? projectId = null)
        => Ok(await _service.GetAllAsync(clientId, projectId));

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var result = await _service.GetByIdAsync(id);
        return result.IsSuccess ? Ok(result.Value) : MapError(result);
    }

    [HttpGet("by-serial/{serialNumber}")]
    public async Task<IActionResult> SearchBySerial(string serialNumber)
    {
        var result = await _service.SearchBySerialAsync(serialNumber);
        return result.IsSuccess ? Ok(result.Value) : MapError(result);
    }

    // Certificado de garantía en PDF (descarga). Requiere login (hereda [Authorize] de clase).
    [HttpGet("{id:int}/pdf")]
    public async Task<IActionResult> GetPdf(int id)
    {
        var result = await _pdf.GenerateWarrantyCertificateAsync(id);
        return result.IsSuccess
            ? File(result.Value!, "application/pdf", $"Certificado-Garantia-{id}.pdf")
            : MapError(result);
    }

    // El UserId sale del token (claim sub/NameIdentifier), nunca del request.
    private int? GetUserId()
        => int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var id) ? id : null;
}
