using ArquaBilling.Api.Common;
using ArquaBilling.Api.Data;
using ArquaBilling.Api.DTOs.Payments;
using ArquaBilling.Api.Entities;
using ArquaBilling.Api.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace ArquaBilling.Api.Services;

public class PaymentService : IPaymentService
{
    private readonly AppDbContext _db;

    public PaymentService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<ServiceResult<PaymentResult>> AddPaymentAsync(
        int invoiceId, PaymentCreateRequest request, int currentUserId)
    {
        await using var tx = await _db.Database.BeginTransactionAsync();

        // Bloqueo de fila de la factura (FOR UPDATE): serializa pagos/anulaciones de la MISMA factura.
        var invoice = await LockInvoiceAsync(invoiceId);
        if (invoice is null)
        {
            return ServiceResult<PaymentResult>.NotFound("Factura no encontrada.");
        }
        if (invoice.Status is not (InvoiceStatus.Issued or InvoiceStatus.PartiallyPaid))
        {
            return ServiceResult<PaymentResult>.Conflict(
                "Solo se puede pagar una factura emitida o parcialmente pagada.");
        }

        // No-sobrepago. invoice.Balance es autoritativo bajo el lock: un pago concurrente
        // que recalculó el balance ya hizo commit antes de que este SELECT FOR UPDATE devolviera.
        if (request.Amount > invoice.Balance)
        {
            return ServiceResult<PaymentResult>.Conflict("El pago excede el balance pendiente.");
        }

        var payment = new Payment
        {
            InvoiceId = invoice.Id,
            Amount = request.Amount,
            PaymentMethod = request.PaymentMethod,
            Reference = string.IsNullOrWhiteSpace(request.Reference) ? null : request.Reference.Trim(),
            PaidAt = NormalizeToUtc(request.PaidAt) ?? DateTime.UtcNow,
            Notes = string.IsNullOrWhiteSpace(request.Notes) ? null : request.Notes.Trim(),
            CreatedAt = DateTime.UtcNow,
            IsVoided = false
        };

        _db.Payments.Add(payment);
        await _db.SaveChangesAsync(); // persiste el pago para que el recálculo lo sume

        await RecalculateInvoiceAsync(invoice);
        await _db.SaveChangesAsync();
        await tx.CommitAsync();

        return ServiceResult<PaymentResult>.Success(BuildResult(payment, invoice));
    }

    public async Task<ServiceResult<PaymentResult>> VoidPaymentAsync(
        int paymentId, string? reason, int currentUserId)
    {
        await using var tx = await _db.Database.BeginTransactionAsync();

        var payment = await _db.Payments.FirstOrDefaultAsync(p => p.Id == paymentId);
        if (payment is null)
        {
            return ServiceResult<PaymentResult>.NotFound("Pago no encontrado.");
        }
        if (payment.IsVoided)
        {
            return ServiceResult<PaymentResult>.Conflict("El pago ya está anulado.");
        }

        // Mismo lock que al registrar: impide que un pago/anulación concurrente descuadre el balance.
        var invoice = await LockInvoiceAsync(payment.InvoiceId);
        if (invoice is null)
        {
            return ServiceResult<PaymentResult>.NotFound("Factura no encontrada.");
        }

        payment.IsVoided = true;
        payment.VoidedAt = DateTime.UtcNow;
        payment.VoidReason = string.IsNullOrWhiteSpace(reason) ? null : reason.Trim();
        await _db.SaveChangesAsync(); // persiste la anulación para que el recálculo la excluya

        await RecalculateInvoiceAsync(invoice);
        await _db.SaveChangesAsync();
        await tx.CommitAsync();

        return ServiceResult<PaymentResult>.Success(BuildResult(payment, invoice));
    }

    public async Task<ServiceResult<IReadOnlyList<PaymentResponse>>> GetPaymentsByInvoiceAsync(int invoiceId)
    {
        if (!await _db.Invoices.AnyAsync(i => i.Id == invoiceId))
        {
            return ServiceResult<IReadOnlyList<PaymentResponse>>.NotFound("Factura no encontrada.");
        }

        var payments = await _db.Payments.AsNoTracking()
            .Where(p => p.InvoiceId == invoiceId)
            .OrderBy(p => p.Id)
            .ToListAsync();

        IReadOnlyList<PaymentResponse> response = payments.Select(ToResponse).ToList();
        return ServiceResult<IReadOnlyList<PaymentResponse>>.Success(response);
    }

    // Fuente de verdad ÚNICA del estado de cobro. Deriva PaidAmount/Balance/Status de los
    // pagos NO anulados realmente persistidos. La invocan registrar y anular por igual.
    private async Task RecalculateInvoiceAsync(Invoice invoice)
    {
        var paid = await _db.Payments
            .Where(p => p.InvoiceId == invoice.Id && !p.IsVoided)
            .SumAsync(p => (decimal?)p.Amount) ?? 0m;

        invoice.PaidAmount = paid;
        invoice.Balance = invoice.Total - paid;
        invoice.Status =
            paid == 0m ? InvoiceStatus.Issued :
            paid < invoice.Total ? InvoiceStatus.PartiallyPaid :
            InvoiceStatus.Paid; // paid >= Total (no hay sobrepago, así que paid == Total)
    }

    // Bloqueo de fila vía SELECT ... FOR UPDATE (mismo patrón que InvoiceService.IssueAsync).
    // ToListAsync ejecuta el SQL crudo tal cual para respetar el FOR UPDATE; la entidad queda trackeada.
    private async Task<Invoice?> LockInvoiceAsync(int invoiceId)
        => (await _db.Invoices
            .FromSqlRaw("SELECT * FROM \"Invoices\" WHERE \"Id\" = {0} FOR UPDATE", invoiceId)
            .ToListAsync()).FirstOrDefault();

    private static PaymentResult BuildResult(Payment payment, Invoice invoice) => new(
        ToResponse(payment),
        new InvoicePaymentState(invoice.Id, invoice.Status, invoice.Total, invoice.PaidAmount, invoice.Balance));

    private static PaymentResponse ToResponse(Payment p) => new(
        p.Id, p.InvoiceId, p.Amount, p.PaymentMethod, p.Reference, p.PaidAt, p.Notes,
        p.IsVoided, p.VoidedAt, p.VoidReason, p.CreatedAt);

    private static DateTime? NormalizeToUtc(DateTime? value)
    {
        if (!value.HasValue)
        {
            return null;
        }
        var d = value.Value;
        return d.Kind switch
        {
            DateTimeKind.Utc => d,
            DateTimeKind.Local => d.ToUniversalTime(),
            _ => DateTime.SpecifyKind(d, DateTimeKind.Utc)
        };
    }
}
