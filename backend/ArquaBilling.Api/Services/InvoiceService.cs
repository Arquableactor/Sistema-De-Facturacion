using ArquaBilling.Api.Common;
using ArquaBilling.Api.Data;
using ArquaBilling.Api.DTOs.Invoices;
using ArquaBilling.Api.Entities;
using ArquaBilling.Api.Helpers;
using ArquaBilling.Api.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace ArquaBilling.Api.Services;

public class InvoiceService : IInvoiceService
{
    private const decimal ItbisRate = 0.18m; // ITBIS RD 18%. TODO: soportar productos exentos.

    private readonly AppDbContext _db;
    private readonly IClientService _clients;

    public InvoiceService(AppDbContext db, IClientService clients)
    {
        _db = db;
        _clients = clients;
    }

    public async Task<IReadOnlyList<InvoiceListItem>> GetAllAsync(InvoiceStatus? status = null, int? clientId = null)
    {
        var query = _db.Invoices.AsNoTracking().Include(i => i.Client).AsQueryable();
        if (status.HasValue)
        {
            query = query.Where(i => i.Status == status.Value);
        }
        if (clientId.HasValue)
        {
            query = query.Where(i => i.ClientId == clientId.Value);
        }

        var invoices = await query.OrderByDescending(i => i.Id).ToListAsync();
        return invoices.Select(i => new InvoiceListItem(
            i.Id, i.InvoiceNumber, i.NCF, i.ClientId, i.Client.Name,
            i.Date, i.Total, i.Balance, i.Status, i.CreatedAt)).ToList();
    }

    public async Task<ServiceResult<InvoiceResponse>> GetByIdAsync(int id)
    {
        var invoice = await _db.Invoices.AsNoTracking()
            .Include(i => i.Client)
            .Include(i => i.Items)
            .FirstOrDefaultAsync(i => i.Id == id);

        return invoice is null
            ? ServiceResult<InvoiceResponse>.NotFound("Factura no encontrada.")
            : ServiceResult<InvoiceResponse>.Success(ToResponse(invoice));
    }

    public async Task<ServiceResult<InvoiceResponse>> CreateAsync(InvoiceCreateRequest request, int currentUserId)
    {
        // Exactamente uno de ClientId / NewClient.
        var hasClientId = request.ClientId.HasValue;
        var hasNewClient = request.NewClient is not null;
        if (hasClientId == hasNewClient)
        {
            return ServiceResult<InvoiceResponse>.Validation(
                "Indica exactamente un cliente: ClientId existente o NewClient nuevo.");
        }
        if (request.Items.Count == 0)
        {
            return ServiceResult<InvoiceResponse>.Validation("La factura debe tener al menos una línea.");
        }

        // Todo-o-nada: cliente al vuelo + factura + líneas en una sola transacción.
        await using var tx = await _db.Database.BeginTransactionAsync();

        // 1) Resolver / crear cliente.
        int clientId;
        if (hasClientId)
        {
            var client = await _db.Clients.AsNoTracking().FirstOrDefaultAsync(c => c.Id == request.ClientId!.Value);
            if (client is null)
            {
                return ServiceResult<InvoiceResponse>.NotFound("Cliente no encontrado.");
            }
            if (!client.IsActive)
            {
                return ServiceResult<InvoiceResponse>.Validation("El cliente está inactivo.");
            }
            clientId = client.Id;
        }
        else
        {
            // TODO fiscal: validar tipo de documento del cliente vs tipo de NCF (B01 -> RNC).
            var created = await _clients.CreateAsync(request.NewClient!);
            if (!created.IsSuccess)
            {
                return created.Status == ResultStatus.Conflict
                    ? ServiceResult<InvoiceResponse>.Conflict(created.Error!)
                    : ServiceResult<InvoiceResponse>.Validation(created.Error ?? "Cliente inválido.");
            }
            clientId = created.Value!.Id;
        }

        // 2) Construir líneas con precio snapshot del producto y calcular montos.
        var items = new List<InvoiceItem>();
        decimal subtotal = 0m, itbisTotal = 0m, discountTotal = 0m;

        foreach (var line in request.Items)
        {
            var product = await _db.Products.AsNoTracking().FirstOrDefaultAsync(p => p.Id == line.ProductId);
            if (product is null || !product.IsActive)
            {
                return ServiceResult<InvoiceResponse>.Validation(
                    $"El producto {line.ProductId} no existe o está inactivo.");
            }
            if (line.Quantity <= 0)
            {
                return ServiceResult<InvoiceResponse>.Validation(
                    $"La cantidad del producto {product.Code} debe ser mayor que cero.");
            }

            var unitPrice = product.Price; // snapshot
            var gross = Round(unitPrice * line.Quantity);
            var discount = Round(line.Discount ?? 0m);
            if (discount < 0m || discount > gross)
            {
                return ServiceResult<InvoiceResponse>.Validation(
                    $"El descuento del producto {product.Code} debe estar entre 0 y {gross}.");
            }

            var taxableBase = gross - discount;
            var itbis = Round(taxableBase * ItbisRate);
            var lineTotal = taxableBase + itbis;

            items.Add(new InvoiceItem
            {
                ProductId = product.Id,
                Description = product.Name,
                Quantity = line.Quantity,
                UnitPrice = unitPrice,
                Discount = discount,
                Itbis = itbis,
                LineTotal = lineTotal,
                SerialNumber = null
            });

            subtotal += taxableBase;
            itbisTotal += itbis;
            discountTotal += discount;
        }

        var total = subtotal + itbisTotal;

        // 3) Crear la factura en Draft. InvoiceNumber se deriva del Id (placeholder temporal).
        var invoice = new Invoice
        {
            // Placeholder temporal único (<30 chars); se reemplaza por FAC-... tras obtener el Id.
            InvoiceNumber = "TMP-" + Guid.NewGuid().ToString("N")[..24],
            NCF = null,
            ClientId = clientId,
            UserId = currentUserId,
            Date = NormalizeToUtc(request.Date) ?? DateTime.UtcNow,
            Subtotal = subtotal,
            Itbis = itbisTotal,
            Discount = discountTotal,
            Total = total,
            PaidAmount = 0m,
            Balance = total,
            Status = InvoiceStatus.Draft,
            Notes = string.IsNullOrWhiteSpace(request.Notes) ? null : request.Notes.Trim(),
            CreatedAt = DateTime.UtcNow,
            Items = items
        };

        _db.Invoices.Add(invoice);
        await _db.SaveChangesAsync(); // genera el Id (y los Ids de las líneas)
        invoice.InvoiceNumber = InvoiceNumberGenerator.Format(invoice.Id);
        await _db.SaveChangesAsync();

        await tx.CommitAsync();

        return ServiceResult<InvoiceResponse>.Success(await LoadResponseAsync(invoice.Id));
    }

    public async Task<ServiceResult<InvoiceResponse>> IssueAsync(int id)
    {
        await using var tx = await _db.Database.BeginTransactionAsync();

        // 1) Bloqueo de fila de la factura (FOR UPDATE): serializa emisiones de la MISMA factura.
        //    ToListAsync ejecuta el SQL crudo tal cual (sin envolverlo) para respetar el FOR UPDATE.
        var invoice = (await _db.Invoices
            .FromSqlRaw("SELECT * FROM \"Invoices\" WHERE \"Id\" = {0} FOR UPDATE", id)
            .ToListAsync()).FirstOrDefault();

        if (invoice is null)
        {
            return ServiceResult<InvoiceResponse>.NotFound("Factura no encontrada.");
        }
        if (invoice.Status != InvoiceStatus.Draft)
        {
            return ServiceResult<InvoiceResponse>.Conflict("La factura ya fue emitida o no está en borrador.");
        }
        if (!await _db.InvoiceItems.AnyAsync(it => it.InvoiceId == id))
        {
            return ServiceResult<InvoiceResponse>.Conflict("No se puede emitir una factura sin líneas.");
        }

        // 2) Bloqueo de fila de la secuencia NCF activa (FOR UPDATE): consumo atómico del número.
        var sequence = (await _db.NcfSequences
            .FromSqlRaw("SELECT * FROM \"NcfSequences\" WHERE \"IsActive\" = true ORDER BY \"Id\" LIMIT 1 FOR UPDATE")
            .ToListAsync()).FirstOrDefault();

        if (sequence is null)
        {
            return ServiceResult<InvoiceResponse>.Conflict("No hay una secuencia NCF activa.");
        }
        if (sequence.CurrentNumber >= sequence.MaxNumber)
        {
            return ServiceResult<InvoiceResponse>.Conflict("La secuencia NCF está agotada.");
        }

        // 3) Consumir el número y emitir. Increment + NCF + estado van en la misma transacción:
        //    si algo falla, rollback revierte el incremento (sin huecos en la secuencia).
        var next = sequence.CurrentNumber + 1;
        sequence.CurrentNumber = next;
        invoice.NCF = NcfHelper.Format(sequence.Type, next);
        invoice.Status = InvoiceStatus.Issued;

        await _db.SaveChangesAsync();
        await tx.CommitAsync();

        return ServiceResult<InvoiceResponse>.Success(await LoadResponseAsync(invoice.Id));
    }

    private async Task<InvoiceResponse> LoadResponseAsync(int id)
    {
        var invoice = await _db.Invoices.AsNoTracking()
            .Include(i => i.Client)
            .Include(i => i.Items)
            .FirstAsync(i => i.Id == id);
        return ToResponse(invoice);
    }

    private static InvoiceResponse ToResponse(Invoice i) => new(
        i.Id, i.InvoiceNumber, i.NCF, i.ClientId, i.Client.Name, i.Client.DocumentNumber,
        i.UserId, i.Date, i.Subtotal, i.Itbis, i.Discount, i.Total, i.PaidAmount, i.Balance,
        i.Status, i.Notes, i.CreatedAt,
        i.Items.OrderBy(it => it.Id).Select(it => new InvoiceItemResponse(
            it.Id, it.ProductId, it.Description, it.Quantity, it.UnitPrice,
            it.Discount, it.Itbis, it.LineTotal, it.SerialNumber)).ToList());

    private static decimal Round(decimal value) => Math.Round(value, 2, MidpointRounding.AwayFromZero);

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
