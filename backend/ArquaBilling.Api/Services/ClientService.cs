using ArquaBilling.Api.Common;
using ArquaBilling.Api.Data;
using ArquaBilling.Api.DTOs.Clients;
using ArquaBilling.Api.Entities;
using ArquaBilling.Api.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace ArquaBilling.Api.Services;

public class ClientService : IClientService
{
    private readonly AppDbContext _db;

    public ClientService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<IReadOnlyList<ClientResponse>> GetAllAsync(bool includeInactive = false)
    {
        var query = _db.Clients.AsNoTracking();
        if (!includeInactive)
        {
            query = query.Where(c => c.IsActive);
        }

        var clients = await query.OrderBy(c => c.Name).ToListAsync();
        return clients.Select(ToResponse).ToList();
    }

    public async Task<ServiceResult<ClientResponse>> GetByIdAsync(int id)
    {
        // Busca por Id sin importar IsActive: tras un borrado lógico el recurso sigue
        // siendo consultable (devuelve IsActive=false).
        var client = await _db.Clients.AsNoTracking().FirstOrDefaultAsync(c => c.Id == id);
        return client is null
            ? ServiceResult<ClientResponse>.NotFound("Cliente no encontrado.")
            : ServiceResult<ClientResponse>.Success(ToResponse(client));
    }

    public async Task<ServiceResult<ClientResponse>> CreateAsync(ClientCreateRequest request)
    {
        var documentNumber = request.DocumentNumber.Trim();
        if (await DocumentInUseAsync(documentNumber))
        {
            return ServiceResult<ClientResponse>.Conflict("Ya existe un cliente activo con ese documento.");
        }

        var client = new Client
        {
            Name = request.Name.Trim(),
            DocumentType = request.DocumentType!.Value,
            DocumentNumber = documentNumber,
            Phone = request.Phone.Trim(),
            Email = NormalizeEmail(request.Email),
            InstallationAddress = request.InstallationAddress.Trim(),
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        _db.Clients.Add(client);
        await _db.SaveChangesAsync();
        return ServiceResult<ClientResponse>.Success(ToResponse(client));
    }

    public async Task<ServiceResult<ClientResponse>> UpdateAsync(int id, ClientUpdateRequest request)
    {
        var client = await _db.Clients.FirstOrDefaultAsync(c => c.Id == id);
        if (client is null)
        {
            return ServiceResult<ClientResponse>.NotFound("Cliente no encontrado.");
        }

        var documentNumber = request.DocumentNumber.Trim();
        if (await DocumentInUseAsync(documentNumber, exceptId: id))
        {
            return ServiceResult<ClientResponse>.Conflict("Ya existe un cliente activo con ese documento.");
        }

        client.Name = request.Name.Trim();
        client.DocumentType = request.DocumentType!.Value;
        client.DocumentNumber = documentNumber;
        client.Phone = request.Phone.Trim();
        client.Email = NormalizeEmail(request.Email);
        client.InstallationAddress = request.InstallationAddress.Trim();
        client.IsActive = request.IsActive;

        await _db.SaveChangesAsync();
        return ServiceResult<ClientResponse>.Success(ToResponse(client));
    }

    public async Task<ServiceResult> DeleteAsync(int id)
    {
        var client = await _db.Clients.FirstOrDefaultAsync(c => c.Id == id);
        if (client is null)
        {
            return ServiceResult.NotFound("Cliente no encontrado.");
        }

        // Borrado lógico: Client→Invoice es Restrict, no se puede borrar físicamente
        // un cliente con facturas asociadas. Lo desactivamos.
        client.IsActive = false;
        await _db.SaveChangesAsync();
        return ServiceResult.Success();
    }

    // Documento único entre clientes ACTIVOS (unicidad filtrada, a nivel de service).
    private Task<bool> DocumentInUseAsync(string documentNumber, int? exceptId = null) =>
        _db.Clients.AnyAsync(c =>
            c.IsActive &&
            c.DocumentNumber == documentNumber &&
            (exceptId == null || c.Id != exceptId));

    private static string? NormalizeEmail(string? email) =>
        string.IsNullOrWhiteSpace(email) ? null : email.Trim();

    private static ClientResponse ToResponse(Client c) => new(
        c.Id, c.Name, c.DocumentType, c.DocumentNumber, c.Phone, c.Email,
        c.InstallationAddress, c.IsActive, c.CreatedAt);
}
