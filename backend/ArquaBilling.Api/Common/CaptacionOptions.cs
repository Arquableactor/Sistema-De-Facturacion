namespace ArquaBilling.Api.Common;

// Ajustes de la captación pública. Van en appsettings porque cambian por negocio/tiempo
// y no deben requerir un despliegue de código: la tarifa eléctrica en RD sube, y los
// límites anti-abuso hay que poder apretarlos o aflojarlos en caliente.
public class CaptacionOptions
{
    public const string SectionName = "Captacion";

    // Anti-abuso: el POST es el primer endpoint anónimo que ESCRIBE.
    public int SolicitudesPorHora { get; set; } = 5;
    public int ConsultasPorMinuto { get; set; } = 60;
}
