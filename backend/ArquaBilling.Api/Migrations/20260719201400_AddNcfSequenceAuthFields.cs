using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ArquaBilling.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddNcfSequenceAuthFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "FechaVencimiento",
                table: "NcfSequences",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "NumeroAutorizacion",
                table: "NcfSequences",
                type: "character varying(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "StartNumber",
                table: "NcfSequences",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            // Backfill de filas existentes: StartNumber = 1. La única secuencia sembrada (B01)
            // tenía CurrentNumber = 0 = StartNumber-1, así que su rango empezó en 1 y este valor
            // es EXACTO para ella. Para cualquier otra fila legada, 1 es el valor documentado por
            // defecto (una autorización inicial de la DGII arranca en 1).
            migrationBuilder.Sql("UPDATE \"NcfSequences\" SET \"StartNumber\" = 1;");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "FechaVencimiento",
                table: "NcfSequences");

            migrationBuilder.DropColumn(
                name: "NumeroAutorizacion",
                table: "NcfSequences");

            migrationBuilder.DropColumn(
                name: "StartNumber",
                table: "NcfSequences");
        }
    }
}
