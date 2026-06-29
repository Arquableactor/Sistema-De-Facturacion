using ArquaBilling.Api.Common;

namespace ArquaBilling.Api.Interfaces;

public interface IPdfService
{
    // Genera el certificado de garantía (PDF) de una garantía. NotFound si no existe.
    Task<ServiceResult<byte[]>> GenerateWarrantyCertificateAsync(int warrantyId);
}
