using System.Security.Claims;
using ArquaBilling.Api.DTOs.Invoices;
using ArquaBilling.Api.Entities;
using ArquaBilling.Api.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ArquaBilling.Api.Controllers;

// Solo traduce HTTP <-> ServiceResult. La lógica vive en InvoiceService.
[Route("api/[controller]")]
[Authorize]
public class InvoicesController : ApiControllerBase
{
    private readonly IInvoiceService _service;

    public InvoicesController(IInvoiceService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] InvoiceStatus? status = null, [FromQuery] int? clientId = null)
        => Ok(await _service.GetAllAsync(status, clientId));

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var result = await _service.GetByIdAsync(id);
        return result.IsSuccess ? Ok(result.Value) : MapError(result);
    }

    [HttpPost]
    public async Task<IActionResult> Create(InvoiceCreateRequest request)
    {
        var userId = GetUserId();
        if (userId is null)
        {
            return Unauthorized();
        }

        var result = await _service.CreateAsync(request, userId.Value);
        return result.IsSuccess
            ? CreatedAtAction(nameof(GetById), new { id = result.Value!.Id }, result.Value)
            : MapError(result);
    }

    [HttpPost("{id:int}/issue")]
    public async Task<IActionResult> Issue(int id)
    {
        var result = await _service.IssueAsync(id);
        return result.IsSuccess ? Ok(result.Value) : MapError(result);
    }

    // El UserId sale del token (claim sub/NameIdentifier), nunca del request.
    private int? GetUserId()
        => int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var id) ? id : null;
}
