using ArquaBilling.Api.Common;

namespace ArquaBilling.Api.Interfaces;

public interface IPdfService
{
    // Genera el certificado de garantía (PDF) de una garantía. NotFound si no existe.
    Task<ServiceResult<byte[]>> GenerateWarrantyCertificateAsync(int warrantyId);

    // Genera el PDF de una factura. NotFound si no existe. Un Draft se marca como
    // borrador sin validez fiscal y no muestra NCF.
    Task<ServiceResult<byte[]>> GenerateInvoiceAsync(int invoiceId);
}
