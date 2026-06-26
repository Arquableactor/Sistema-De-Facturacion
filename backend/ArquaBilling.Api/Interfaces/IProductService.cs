using ArquaBilling.Api.Common;
using ArquaBilling.Api.DTOs.Products;

namespace ArquaBilling.Api.Interfaces;

public interface IProductService
{
    Task<IReadOnlyList<ProductResponse>> GetAllAsync(bool includeInactive = false);
    Task<ServiceResult<ProductResponse>> GetByIdAsync(int id);
    Task<ServiceResult<ProductResponse>> CreateAsync(ProductCreateRequest request);
    Task<ServiceResult<ProductResponse>> UpdateAsync(int id, ProductUpdateRequest request);
    Task<ServiceResult> DeleteAsync(int id);
}
