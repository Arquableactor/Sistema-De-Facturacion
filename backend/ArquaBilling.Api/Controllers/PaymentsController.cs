using System.Security.Claims;
using ArquaBilling.Api.DTOs.Payments;
using ArquaBilling.Api.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ArquaBilling.Api.Controllers;

// Solo traduce HTTP <-> ServiceResult. La lógica vive en PaymentService.
// Rutas absolutas: los pagos cuelgan de la factura (anidados) y la anulación de /payments.
[Authorize]
public class PaymentsController : ApiControllerBase
{
    private readonly IPaymentService _service;

    public PaymentsController(IPaymentService service)
    {
        _service = service;
    }

    [HttpPost("api/invoices/{invoiceId:int}/payments")]
    public async Task<IActionResult> Add(int invoiceId, PaymentCreateRequest request)
    {
        var userId = GetUserId();
        if (userId is null)
        {
            return Unauthorized();
        }

        var result = await _service.AddPaymentAsync(invoiceId, request, userId.Value);
        return result.IsSuccess
            ? CreatedAtAction(nameof(GetByInvoice), new { invoiceId }, result.Value)
            : MapError(result);
    }

    [HttpPost("api/payments/{paymentId:int}/void")]
    public async Task<IActionResult> Void(int paymentId, VoidPaymentRequest? request = null)
    {
        var userId = GetUserId();
        if (userId is null)
        {
            return Unauthorized();
        }

        var result = await _service.VoidPaymentAsync(paymentId, request?.VoidReason, userId.Value);
        return result.IsSuccess ? Ok(result.Value) : MapError(result);
    }

    [HttpGet("api/invoices/{invoiceId:int}/payments")]
    public async Task<IActionResult> GetByInvoice(int invoiceId)
    {
        var result = await _service.GetPaymentsByInvoiceAsync(invoiceId);
        return result.IsSuccess ? Ok(result.Value) : MapError(result);
    }

    // El UserId sale del token (claim sub/NameIdentifier), nunca del request.
    private int? GetUserId()
        => int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var id) ? id : null;
}
