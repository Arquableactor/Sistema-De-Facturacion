using ArquaBilling.Api.Entities;

namespace ArquaBilling.Api.DTOs.Warranties;

// Respuesta PÚBLICA (endpoint anónimo, lo que abre el QR). Información MÍNIMA para
// confirmar autenticidad y vigencia SIN exponer datos del cliente/proyecto.
// El idioma lo pone la página pública; la API solo devuelve códigos de estado en inglés.
public record PublicWarrantyVerificationResponse(
    string WarrantyNumber,
    bool IsValid,   // existe y está vigente (no anulada, no vencida)
    bool IsVoided,  // anulada
    WarrantyStatus Status, // Active / Expired / Void (código de estado en inglés)
    DateTime StartDate,
    DateTime EndDate,
    IReadOnlyList<PublicWarrantyItem> Items);

// Equipo cubierto, sin nada del cliente.
public record PublicWarrantyItem(
    string? Marca,
    string? Modelo,
    string SerialNumber,
    int WarrantyMonths,
    DateTime EndDate);
