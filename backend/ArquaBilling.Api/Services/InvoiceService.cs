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

    public InvoiceService(AppDbContext db)
    {
        _db = db;
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
        var now = DateTime.UtcNow;
        return invoices.Select(i => new InvoiceListItem(
            i.Id, i.InvoiceNumber, i.NCF, i.ProjectId, i.ClientId, i.Client.Name,
            i.Date, i.DueDate, i.Total, i.Balance, i.Status, IsOverdue(i, now), i.CreatedAt)).ToList();
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
        if (request.Items.Count == 0)
        {
            return ServiceResult<InvoiceResponse>.Validation("La factura debe tener al menos una línea.");
        }

        // Todo-o-nada: factura + líneas en una sola transacción.
        await using var tx = await _db.Database.BeginTransactionAsync();

        // 1) Resolver el proyecto (obligatorio). El cliente de la factura se deriva del proyecto.
        var project = await _db.Projects.AsNoTracking().FirstOrDefaultAsync(p => p.Id == request.ProjectId);
        if (project is null)
        {
            return ServiceResult<InvoiceResponse>.NotFound("Proyecto no encontrado.");
        }
        if (!project.IsActive)
        {
            return ServiceResult<InvoiceResponse>.Validation("El proyecto está inactivo.");
        }
        var clientId = project.ClientId;

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

            // Precio unitario: override del cliente si viene (sujeto al mercado), si no el del
            // catálogo. En ningún caso se modifica Product.Price.
            var unitPrice = line.UnitPrice.HasValue ? Round(line.UnitPrice.Value) : product.Price;
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
                // Descripción personalizada si viene; si no, la del catálogo (o el nombre).
                Description = string.IsNullOrWhiteSpace(line.Description)
                    ? (string.IsNullOrWhiteSpace(product.Description) ? product.Name : product.Description)
                    : line.Description.Trim(),
                Quantity = line.Quantity,
                UnitPrice = unitPrice,
                Discount = discount,
                Itbis = itbis,
                LineTotal = lineTotal
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
            ProjectId = project.Id,
            ClientId = clientId,
            UserId = currentUserId,
            Date = NormalizeToUtc(request.Date) ?? DateTime.UtcNow,
            DueDate = NormalizeToUtc(request.DueDate)!.Value,
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
        i.Id, i.InvoiceNumber, i.NCF, i.ProjectId, i.ClientId, i.Client.Name, i.Client.DocumentNumber,
        i.UserId, i.Date, i.DueDate, i.Subtotal, i.Itbis, i.Discount, i.Total, i.PaidAmount, i.Balance,
        i.Status, IsOverdue(i, DateTime.UtcNow), i.Notes, i.CreatedAt,
        i.Items.OrderBy(it => it.Id).Select(it => new InvoiceItemResponse(
            it.Id, it.ProductId, it.Description, it.Quantity, it.UnitPrice,
            it.Discount, it.Itbis, it.LineTotal)).ToList());

    // "Vencida" no es estado del enum: se deriva. Una factura con saldo (Issued/PartiallyPaid)
    // cuya fecha de vencimiento ya pasó está vencida.
    private static bool IsOverdue(Invoice i, DateTime now)
        => i.Status is InvoiceStatus.Issued or InvoiceStatus.PartiallyPaid && i.DueDate < now;

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
