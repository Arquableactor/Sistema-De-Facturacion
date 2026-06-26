namespace ArquaBilling.Api.Helpers;

// Formatea el NCF: prefijo (Type de la NcfSequence) + número secuencial a 8 dígitos.
// NO hardcodea "B": usa el Type, para soportar el día de mañana e-CF (prefijos tipo E31).
// Ej.: Format("B01", 522) => "B0100000522".
public static class NcfHelper
{
    public static string Format(string type, int sequentialNumber)
        => $"{type}{sequentialNumber:D8}";
}
