namespace ArquaBilling.Api.Helpers;

// Número de garantía correlativo, derivado del Id (único garantizado por la DB),
// análogo a InvoiceNumberGenerator. Ej.: Format(123) => "GAR-000123".
public static class WarrantyNumberGenerator
{
    public static string Format(int warrantyId) => $"GAR-{warrantyId:D6}";
}
