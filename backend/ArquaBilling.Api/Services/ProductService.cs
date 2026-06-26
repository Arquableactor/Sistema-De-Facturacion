using ArquaBilling.Api.Common;
using ArquaBilling.Api.Data;
using ArquaBilling.Api.DTOs.Products;
using ArquaBilling.Api.Entities;
using ArquaBilling.Api.Interfaces;
using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace ArquaBilling.Api.Services;

public class ProductService : IProductService
{
    private const string DuplicateCodeMessage = "Ya existe un producto con ese código.";

    private readonly AppDbContext _db;

    public ProductService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<IReadOnlyList<ProductResponse>> GetAllAsync(bool includeInactive = false)
    {
        var query = _db.Products.AsNoTracking();
        if (!includeInactive)
        {
            query = query.Where(p => p.IsActive);
        }

        var products = await query.OrderBy(p => p.Code).ToListAsync();
        return products.Select(ToResponse).ToList();
    }

    public async Task<ServiceResult<ProductResponse>> GetByIdAsync(int id)
    {
        var product = await _db.Products.AsNoTracking().FirstOrDefaultAsync(p => p.Id == id);
        return product is null
            ? ServiceResult<ProductResponse>.NotFound("Producto no encontrado.")
            : ServiceResult<ProductResponse>.Success(ToResponse(product));
    }

    public async Task<ServiceResult<ProductResponse>> CreateAsync(ProductCreateRequest request)
    {
        var code = request.Code.Trim();
        if (await CodeInUseAsync(code))
        {
            return ServiceResult<ProductResponse>.Conflict(DuplicateCodeMessage);
        }

        var product = new Product
        {
            Name = request.Name.Trim(),
            Code = code,
            Barcode = NormalizeOptional(request.Barcode),
            Description = NormalizeOptional(request.Description),
            Price = request.Price,
            WarrantyMonths = request.WarrantyMonths,
            IsSerialized = request.IsSerialized,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        _db.Products.Add(product);
        return await SaveAndReturnAsync(product);
    }

    public async Task<ServiceResult<ProductResponse>> UpdateAsync(int id, ProductUpdateRequest request)
    {
        var product = await _db.Products.FirstOrDefaultAsync(p => p.Id == id);
        if (product is null)
        {
            return ServiceResult<ProductResponse>.NotFound("Producto no encontrado.");
        }

        var code = request.Code.Trim();
        if (await CodeInUseAsync(code, exceptId: id))
        {
            return ServiceResult<ProductResponse>.Conflict(DuplicateCodeMessage);
        }

        product.Name = request.Name.Trim();
        product.Code = code;
        product.Barcode = NormalizeOptional(request.Barcode);
        product.Description = NormalizeOptional(request.Description);
        product.Price = request.Price;
        product.WarrantyMonths = request.WarrantyMonths;
        product.IsSerialized = request.IsSerialized;
        product.IsActive = request.IsActive;

        return await SaveAndReturnAsync(product);
    }

    public async Task<ServiceResult> DeleteAsync(int id)
    {
        var product = await _db.Products.FirstOrDefaultAsync(p => p.Id == id);
        if (product is null)
        {
            return ServiceResult.NotFound("Producto no encontrado.");
        }

        // Borrado lógico: Product→InvoiceItem/WarrantyItem es Restrict, no se borra
        // físicamente un producto referenciado. Lo desactivamos.
        product.IsActive = false;
        await _db.SaveChangesAsync();
        return ServiceResult.Success();
    }

    // Code único entre TODOS los productos (respaldado por IX_Products_Code en DB).
    private Task<bool> CodeInUseAsync(string code, int? exceptId = null) =>
        _db.Products.AnyAsync(p => p.Code == code && (exceptId == null || p.Id != exceptId));

    // Persiste; si por carrera se viola el índice único del Code, lo traduce al mismo 409.
    private async Task<ServiceResult<ProductResponse>> SaveAndReturnAsync(Product product)
    {
        try
        {
            await _db.SaveChangesAsync();
            return ServiceResult<ProductResponse>.Success(ToResponse(product));
        }
        catch (DbUpdateException ex)
            when (ex.InnerException is PostgresException { SqlState: PostgresErrorCodes.UniqueViolation })
        {
            return ServiceResult<ProductResponse>.Conflict(DuplicateCodeMessage);
        }
    }

    private static string? NormalizeOptional(string? value) =>
        string.IsNullOrWhiteSpace(value) ? null : value.Trim();

    private static ProductResponse ToResponse(Product p) => new(
        p.Id, p.Name, p.Code, p.Barcode, p.Description, p.Price, p.WarrantyMonths,
        p.IsSerialized, p.IsActive, p.CreatedAt);
}
