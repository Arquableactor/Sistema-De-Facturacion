namespace ArquaBilling.Api.DTOs.NcfSequences;

// Resumen ligero por tipo para los avisos (dashboard/banner). Lo ve Admin y Facturación,
// aunque Facturación no administre las secuencias.
//   restantes      = runway total: suma de restantes de las secuencias USABLES del tipo.
//   diasParaVencer = de la usable que vence antes (la que se consume primero). null = ninguna vence.
//   severidad      = ok | advertencia | critico (critico también si NO hay ninguna usable).
public record NcfEstadoResponse(
    string Type,
    int Restantes,
    int? DiasParaVencer,
    string Severidad);
