namespace ArquaBilling.Api.Helpers;

// Folio visible de una solicitud de captación. Derivado del Id (único garantizado por
// la DB) + el año, igual que InvoiceNumberGenerator. Ej.: Format(148, 2026) => "APE-SOL-2026-000148".
public static class SolicitudNumberGenerator
{
    public static string Format(int solicitudId, int year) => $"APE-SOL-{year}-{solicitudId:D6}";
}
