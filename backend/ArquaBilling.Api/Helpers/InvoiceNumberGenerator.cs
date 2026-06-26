namespace ArquaBilling.Api.Helpers;

// Número de factura INTERNO, correlativo, distinto del NCF fiscal. Derivado del Id
// (único garantizado por la DB). Ej.: Format(123) => "FAC-000123".
public static class InvoiceNumberGenerator
{
    public static string Format(int invoiceId) => $"FAC-{invoiceId:D6}";
}
