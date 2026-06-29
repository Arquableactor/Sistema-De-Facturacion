using System.Globalization;
using ArquaBilling.Api.Common;
using ArquaBilling.Api.Data;
using ArquaBilling.Api.Entities;
using ArquaBilling.Api.Interfaces;
using Microsoft.EntityFrameworkCore;
using QRCoder;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace ArquaBilling.Api.Services;

// Certificado de garantía en PDF (QuestPDF) con QR de verificación (QRCoder).
// Generación AUTENTICADA: el PDF SÍ incluye datos completos del cliente, porque lo
// descarga alguien con login y se lo entrega al cliente.
public class PdfService : IPdfService
{
    private const string DefaultBaseUrl = "http://localhost:5266";
    private static readonly CultureInfo Es = CultureInfo.GetCultureInfo("es-DO");

    private readonly AppDbContext _db;
    private readonly IConfiguration _config;

    public PdfService(AppDbContext db, IConfiguration config)
    {
        _db = db;
        _config = config;
    }

    public async Task<ServiceResult<byte[]>> GenerateWarrantyCertificateAsync(int warrantyId)
    {
        var warranty = await _db.Warranties.AsNoTracking()
            .Include(w => w.Client)
            .Include(w => w.Project)
            .Include(w => w.Items)
            .FirstOrDefaultAsync(w => w.Id == warrantyId);

        if (warranty is null)
        {
            return ServiceResult<byte[]>.NotFound("Garantía no encontrada.");
        }

        var baseUrl = (_config["PublicVerificationBaseUrl"] ?? DefaultBaseUrl).TrimEnd('/');
        var verifyUrl = $"{baseUrl}/verificar/{warranty.VerificationCode}";
        var qrPng = GenerateQrPng(verifyUrl);

        var pdf = BuildCertificate(warranty, qrPng);
        return ServiceResult<byte[]>.Success(pdf);
    }

    private static byte[] GenerateQrPng(string url)
    {
        // PngByteQRCode es 100% managed (sin System.Drawing ni libs nativas) -> seguro en Linux.
        using var generator = new QRCodeGenerator();
        using var data = generator.CreateQrCode(url, QRCodeGenerator.ECCLevel.Q);
        return new PngByteQRCode(data).GetGraphic(20);
    }

    private static byte[] BuildCertificate(Warranty w, byte[] qrPng)
    {
        var status = EffectiveStatus(w.Status, w.EndDate, DateTime.UtcNow);
        var estadoTexto = status switch
        {
            WarrantyStatus.Active => "VIGENTE",
            WarrantyStatus.Expired => "VENCIDA",
            _ => "ANULADA"
        };

        return Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(40);
                page.DefaultTextStyle(x => x.FontSize(10).FontColor(Colors.Grey.Darken4));

                // ---- Encabezado ----
                page.Header().Column(col =>
                {
                    col.Item().Row(row =>
                    {
                        row.RelativeItem().Column(c =>
                        {
                            c.Item().Text("APE Solar").Bold().FontSize(18).FontColor(Colors.Blue.Darken3);
                            c.Item().Text("Certificado de Garantía").FontSize(13).SemiBold();
                        });
                        row.ConstantItem(180).AlignRight().Column(c =>
                        {
                            c.Item().AlignRight().Text(w.WarrantyNumber).Bold().FontSize(14);
                            c.Item().AlignRight().Text($"Estado: {estadoTexto}")
                                .FontColor(status == WarrantyStatus.Active ? Colors.Green.Darken2 : Colors.Red.Darken2);
                        });
                    });
                    col.Item().PaddingTop(8).LineHorizontal(1).LineColor(Colors.Grey.Lighten1);
                });

                // ---- Contenido ----
                page.Content().PaddingVertical(12).Column(col =>
                {
                    col.Spacing(14);

                    // Cliente y proyecto
                    col.Item().Row(row =>
                    {
                        row.RelativeItem().Column(c =>
                        {
                            c.Item().Text("Cliente").Bold().FontColor(Colors.Grey.Darken2);
                            c.Item().Text(w.Client.Name);
                            c.Item().Text($"{w.Client.DocumentType}: {w.Client.DocumentNumber}");
                            if (!string.IsNullOrWhiteSpace(w.Client.Phone))
                            {
                                c.Item().Text($"Tel.: {w.Client.Phone}");
                            }
                        });
                        row.RelativeItem().Column(c =>
                        {
                            c.Item().Text("Proyecto").Bold().FontColor(Colors.Grey.Darken2);
                            c.Item().Text(w.Project.Nombre);
                            c.Item().Text($"Instalación: {w.Client.InstallationAddress}");
                        });
                    });

                    // Vigencia global
                    col.Item().Background(Colors.Grey.Lighten4).Padding(8).Row(row =>
                    {
                        row.RelativeItem().Text(t =>
                        {
                            t.Span("Vigencia: ").Bold();
                            t.Span($"{Fecha(w.StartDate)}  —  {Fecha(w.EndDate)}");
                        });
                    });

                    // Tabla de equipos cubiertos
                    col.Item().Text("Equipos cubiertos").Bold().FontColor(Colors.Grey.Darken2);
                    col.Item().Table(table =>
                    {
                        table.ColumnsDefinition(c =>
                        {
                            c.RelativeColumn(2); // Marca
                            c.RelativeColumn(2); // Modelo
                            c.RelativeColumn(2); // Serial
                            c.RelativeColumn(1); // Meses
                            c.RelativeColumn(2); // Vence
                        });

                        table.Header(h =>
                        {
                            static IContainer HeadStyle(IContainer x) =>
                                x.Background(Colors.Blue.Darken3).Padding(5);
                            h.Cell().Element(HeadStyle).Text("Marca").FontColor(Colors.White).Bold();
                            h.Cell().Element(HeadStyle).Text("Modelo").FontColor(Colors.White).Bold();
                            h.Cell().Element(HeadStyle).Text("No. de serie").FontColor(Colors.White).Bold();
                            h.Cell().Element(HeadStyle).Text("Meses").FontColor(Colors.White).Bold();
                            h.Cell().Element(HeadStyle).Text("Vence").FontColor(Colors.White).Bold();
                        });

                        var i = 0;
                        foreach (var item in w.Items.OrderBy(x => x.Id))
                        {
                            var bg = i++ % 2 == 0 ? Colors.White : Colors.Grey.Lighten4;
                            IContainer Cell(IContainer x) => x.Background(bg).Padding(5);
                            table.Cell().Element(Cell).Text(item.Marca ?? "—");
                            table.Cell().Element(Cell).Text(item.Modelo ?? "—");
                            table.Cell().Element(Cell).Text(item.SerialNumber);
                            table.Cell().Element(Cell).Text(item.WarrantyMonths.ToString(Es));
                            table.Cell().Element(Cell).Text(Fecha(item.EndDate));
                        }
                    });

                    // Coberturas / exclusiones (texto fijo). TODO: hacerlo configurable.
                    col.Item().PaddingTop(4).Column(c =>
                    {
                        c.Item().Text("Coberturas y exclusiones").Bold().FontColor(Colors.Grey.Darken2);
                        c.Item().Text(
                            "Esta garantía cubre defectos de fabricación de los equipos listados durante el " +
                            "período indicado, en condiciones normales de uso e instalación. No cubre daños por " +
                            "fenómenos naturales (rayos, inundaciones, sismos), sobretensión de la red, mal uso, " +
                            "manipulación o instalación por terceros no autorizados.")
                            .FontSize(9).FontColor(Colors.Grey.Darken1);
                    });

                    // Verificación (QR) + firma
                    col.Item().PaddingTop(10).Row(row =>
                    {
                        row.ConstantItem(120).Column(c =>
                        {
                            c.Item().Width(110).Image(qrPng);
                            c.Item().AlignCenter().Text("Verificar autenticidad").FontSize(8);
                        });
                        row.RelativeItem().PaddingLeft(15).AlignBottom().Column(c =>
                        {
                            c.Item().Text("Código de verificación:").FontSize(9).FontColor(Colors.Grey.Darken2);
                            c.Item().Text(w.VerificationCode).FontSize(9).FontFamily(Fonts.Consolas);
                        });
                        row.ConstantItem(170).AlignBottom().Column(c =>
                        {
                            c.Item().PaddingTop(25).LineHorizontal(1).LineColor(Colors.Grey.Medium);
                            c.Item().AlignCenter().Text("Firma y sello autorizado").FontSize(9);
                        });
                    });
                });

                // ---- Pie ----
                page.Footer().AlignCenter().Text(t =>
                {
                    t.Span("Documento generado el ").FontSize(8).FontColor(Colors.Grey.Medium);
                    t.Span(Fecha(DateTime.UtcNow)).FontSize(8).FontColor(Colors.Grey.Medium);
                    t.Span(" · APE Solar").FontSize(8).FontColor(Colors.Grey.Medium);
                });
            });
        }).GeneratePdf();
    }

    private static string Fecha(DateTime d) => d.ToString("dd/MM/yyyy", CultureInfo.InvariantCulture);

    private static WarrantyStatus EffectiveStatus(WarrantyStatus stored, DateTime endDate, DateTime now)
        => stored == WarrantyStatus.Void ? WarrantyStatus.Void
           : endDate < now ? WarrantyStatus.Expired
           : WarrantyStatus.Active;
}
