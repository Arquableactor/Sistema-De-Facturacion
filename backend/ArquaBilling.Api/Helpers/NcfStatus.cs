using ArquaBilling.Api.Entities;

namespace ArquaBilling.Api.Helpers;

// Todo lo DERIVADO de una NcfSequence (usados/restantes/días/estado/severidad) vive aquí,
// y los UMBRALES están en un solo sitio para cambiarlos fácil. Ni la entidad ni la emisión
// dependen de esto: es solo cálculo de presentación y de los avisos.
//
// Convención de números (Opción A, la del sistema): CurrentNumber = ÚLTIMO emitido
// (StartNumber-1 = ninguno). Por eso restantes = MaxNumber - CurrentNumber y una secuencia
// está agotada cuando CurrentNumber == MaxNumber (restantes == 0).
public static class NcfStatus
{
    // ---- Umbrales (un solo lugar) ----
    public const double WarnRemainingPct = 0.20; // advertencia: restantes <= 20% del rango…
    public const int WarnRemainingAbs = 50;      // …o <= 50, lo que ocurra primero (el mayor).
    public const int WarnDays = 30;              // advertencia: faltan <= 30 días.
    public const int CritRemaining = 10;         // crítico: restantes <= 10…
    public const int CritDays = 7;               // …o faltan <= 7 días.

    // Severidades como cadenas estables para el frontend.
    public const string Ok = "ok";
    public const string Advertencia = "advertencia";
    public const string Critico = "critico";

    public static int Usados(NcfSequence s) => Math.Max(0, s.CurrentNumber - s.StartNumber + 1);
    public static int Restantes(NcfSequence s) => Math.Max(0, s.MaxNumber - s.CurrentNumber);
    public static int Total(NcfSequence s) => Math.Max(0, s.MaxNumber - s.StartNumber + 1);

    // Días para vencer (calendario). null si la secuencia no tiene vencimiento.
    public static int? DiasParaVencer(NcfSequence s, DateTime today)
        => s.FechaVencimiento is null
            ? null
            : (int)Math.Floor((s.FechaVencimiento.Value.Date - today.Date).TotalDays);

    public static bool IsExpired(NcfSequence s, DateTime today)
        => s.FechaVencimiento is not null && s.FechaVencimiento.Value.Date < today.Date;

    public static bool IsExhausted(NcfSequence s) => Restantes(s) <= 0;

    // Umbral de advertencia por cantidad: el MAYOR entre 50 y el 20% del rango (así, al
    // agotarse, la alerta salta en el que ocurra primero).
    private static int WarnRemainingThreshold(NcfSequence s)
        => Math.Max(WarnRemainingAbs, (int)Math.Ceiling(WarnRemainingPct * Total(s)));

    // ok / advertencia / critico — la bandera que consumen los avisos.
    public static string Severidad(NcfSequence s, DateTime today)
    {
        var restantes = Restantes(s);
        var dias = DiasParaVencer(s, today);

        var critByRem = restantes <= CritRemaining;
        var critByDays = dias is not null && dias <= CritDays;
        if (critByRem || critByDays) return Critico;

        var warnByRem = restantes <= WarnRemainingThreshold(s);
        var warnByDays = dias is not null && dias <= WarnDays;
        if (warnByRem || warnByDays) return Advertencia;

        return Ok;
    }

    // Estado derivado (una etiqueta), por precedencia:
    // Inactiva > Vencida > Agotada > PorVencer/PorAgotarse (por severidad) > Activa.
    public static string Estado(NcfSequence s, DateTime today)
    {
        if (!s.IsActive) return "Inactiva";
        if (IsExpired(s, today)) return "Vencida";
        if (IsExhausted(s)) return "Agotada";

        var restantes = Restantes(s);
        var dias = DiasParaVencer(s, today);

        var rankRem = restantes <= CritRemaining ? 2 : restantes <= WarnRemainingThreshold(s) ? 1 : 0;
        var rankDays = dias is null ? 0 : dias <= CritDays ? 2 : dias <= WarnDays ? 1 : 0;

        if (rankRem == 0 && rankDays == 0) return "Activa";
        // Empate o cantidad más urgente → "PorAgotarse" (quedarse sin números apremia más).
        return rankRem >= rankDays ? "PorAgotarse" : "PorVencer";
    }
}
