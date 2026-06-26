using ArquaBilling.Api.Common;
using ArquaBilling.Api.DTOs.Invoices;
using ArquaBilling.Api.Entities;

namespace ArquaBilling.Api.Interfaces;

public interface IInvoiceService
{
    Task<IReadOnlyList<InvoiceListItem>> GetAllAsync(InvoiceStatus? status = null, int? clientId = null);
    Task<ServiceResult<InvoiceResponse>> GetByIdAsync(int id);
    Task<ServiceResult<InvoiceResponse>> CreateAsync(InvoiceCreateRequest request, int currentUserId);
    Task<ServiceResult<InvoiceResponse>> IssueAsync(int id);
}
