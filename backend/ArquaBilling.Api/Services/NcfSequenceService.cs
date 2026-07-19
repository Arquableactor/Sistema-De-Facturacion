using ArquaBilling.Api.Common;
using ArquaBilling.Api.Data;
using ArquaBilling.Api.DTOs.NcfSequences;
using ArquaBilling.Api.Entities;
using ArquaBilling.Api.Helpers;
using ArquaBilling.Api.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace ArquaBilling.Api.Services;

// Administración de secuencias NCF (solo Admin) + el resumen para los avisos. NADA de esto
// toca la EMISIÓN: aquí no se avanza CurrentNumber. El único que lo mueve es InvoiceService,
// dentro del SELECT ... FOR UPDATE.
public class NcfSequenceService : INcfSequenceService
{
    private readonly AppDbContext _db;

    public NcfSequenceService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<IReadOnlyList<NcfSequenceResponse>> GetAllAsync()
    {
        var seqs = await _db.NcfSequences.AsNoTracking()
            .OrderBy(s => s.Type)
            .ThenBy(s => s.FechaVencimiento)
            .ThenBy(s => s.Id)
            .ToListAsync();

        var today = DateTime.UtcNow;
        return seqs.Select(s => ToResponse(s, today)).ToList();
    }

    public async Task<ServiceResult<NcfSequenceResponse>> CreateAsync(NcfSequenceCreateRequest request)
    {
        var type = request.Type.Trim().ToUpperInvariant();
        if (type.Length == 0)
        {
            return ServiceResult<NcfSequenceResponse>.Validation("El tipo de comprobante es obligatorio.");
        }
        if (request.StartNumber > request.MaxNumber)
        {
            return ServiceResult<NcfSequenceResponse>.Validation(
                "El número inicial no puede ser mayor que el final.");
        }

        var vencimiento = NormalizeToUtc(request.FechaVencimiento!.Value);
        if (vencimiento.Date <= DateTime.UtcNow.Date)
        {
            return ServiceResult<NcfSequenceResponse>.Validation("La fecha de vencimiento debe ser futura.");
        }

        // No solaparse con otra secuencia ACTIVA del mismo tipo: dos rangos [a..b] y [c..d]
        // se solapan si a <= d && c <= b. Emitir desde rangos solapados podría repetir un NCF.
        var activasDelTipo = await _db.NcfSequences.AsNoTracking()
            .Where(s => s.Type == type && s.IsActive)
            .Select(s => new { s.StartNumber, s.MaxNumber })
            .ToListAsync();
        if (activasDelTipo.Any(s => request.StartNumber <= s.MaxNumber && s.StartNumber <= request.MaxNumber))
        {
            return ServiceResult<NcfSequenceResponse>.Conflict(
                "El rango se solapa con otra secuencia activa del mismo tipo.");
        }

        var seq = new NcfSequence
        {
            Type = type,
            NumeroAutorizacion = request.NumeroAutorizacion.Trim(),
            StartNumber = request.StartNumber,
            // Último emitido = StartNumber-1 → ninguno todavía; la primera factura emite StartNumber.
            CurrentNumber = request.StartNumber - 1,
            MaxNumber = request.MaxNumber,
            FechaVencimiento = vencimiento,
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
        };

        _db.NcfSequences.Add(seq);
        await _db.SaveChangesAsync();

        return ServiceResult<NcfSequenceResponse>.Success(ToResponse(seq, DateTime.UtcNow));
    }

    public async Task<ServiceResult<NcfSequenceResponse>> UpdateAsync(int id, NcfSequenceUpdateRequest request)
    {
        var seq = await _db.NcfSequences.FirstOrDefaultAsync(s => s.Id == id);
        if (seq is null)
        {
            return ServiceResult<NcfSequenceResponse>.NotFound("Secuencia NCF no encontrada.");
        }

        // SOLO datos administrativos. CurrentNumber/StartNumber/MaxNumber/Type ni se mencionan:
        // el DTO no los trae, así que no hay forma de moverlos por aquí.
        seq.NumeroAutorizacion = string.IsNullOrWhiteSpace(request.NumeroAutorizacion)
            ? null
            : request.NumeroAutorizacion.Trim();
        seq.FechaVencimiento = request.FechaVencimiento.HasValue
            ? NormalizeToUtc(request.FechaVencimiento.Value)
            : null;
        seq.IsActive = request.IsActive;

        await _db.SaveChangesAsync();

        return ServiceResult<NcfSequenceResponse>.Success(ToResponse(seq, DateTime.UtcNow));
    }

    public async Task<IReadOnlyList<NcfEstadoResponse>> GetEstadoAsync()
    {
        var seqs = await _db.NcfSequences.AsNoTracking().ToListAsync();
        var today = DateTime.UtcNow;

        return seqs
            .GroupBy(s => s.Type)
            .OrderBy(g => g.Key)
            .Select(g =>
            {
                var usables = g.Where(s => s.IsActive && !NcfStatus.IsExpired(s, today) && !NcfStatus.IsExhausted(s)).ToList();
                var restantes = usables.Sum(NcfStatus.Restantes);
                int? dias = usables
                    .Select(s => NcfStatus.DiasParaVencer(s, today))
                    .Where(d => d.HasValue)
                    .Select(d => d!.Value)
                    .DefaultIfEmpty()
                    .Min();
                if (!usables.Any(s => NcfStatus.DiasParaVencer(s, today).HasValue)) dias = null;

                var severidad = usables.Count == 0
                    ? NcfStatus.Critico
                    : (restantes <= NcfStatus.CritRemaining || (dias is not null && dias <= NcfStatus.CritDays))
                        ? NcfStatus.Critico
                        : (restantes <= NcfStatus.WarnRemainingAbs || (dias is not null && dias <= NcfStatus.WarnDays))
                            ? NcfStatus.Advertencia
                            : NcfStatus.Ok;

                return new NcfEstadoResponse(g.Key, restantes, dias, severidad);
            })
            .ToList();
    }

    private static NcfSequenceResponse ToResponse(NcfSequence s, DateTime today) => new(
        s.Id, s.Type, s.NumeroAutorizacion, s.StartNumber, s.CurrentNumber, s.MaxNumber,
        NcfStatus.Usados(s), NcfStatus.Restantes(s), s.FechaVencimiento,
        NcfStatus.DiasParaVencer(s, today), s.IsActive, NcfStatus.Estado(s, today));

    // Postgres timestamptz exige Kind=Utc; un DateTime sin zona (del JSON) se marca como UTC.
    private static DateTime NormalizeToUtc(DateTime value) => value.Kind switch
    {
        DateTimeKind.Utc => value,
        DateTimeKind.Local => value.ToUniversalTime(),
        _ => DateTime.SpecifyKind(value, DateTimeKind.Utc),
    };
}
