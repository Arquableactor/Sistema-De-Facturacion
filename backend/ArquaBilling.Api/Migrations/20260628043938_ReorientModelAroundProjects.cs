using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace ArquaBilling.Api.Migrations
{
    /// <inheritdoc />
    public partial class ReorientModelAroundProjects : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Warranties_Invoices_InvoiceId",
                table: "Warranties");

            migrationBuilder.DropForeignKey(
                name: "FK_WarrantyItems_Products_ProductId",
                table: "WarrantyItems");

            migrationBuilder.DropColumn(
                name: "ProductName",
                table: "WarrantyItems");

            migrationBuilder.DropColumn(
                name: "SerialNumber",
                table: "InvoiceItems");

            migrationBuilder.RenameColumn(
                name: "ProductId",
                table: "WarrantyItems",
                newName: "EquipoInstaladoId");

            migrationBuilder.RenameIndex(
                name: "IX_WarrantyItems_ProductId",
                table: "WarrantyItems",
                newName: "IX_WarrantyItems_EquipoInstaladoId");

            migrationBuilder.RenameColumn(
                name: "InvoiceId",
                table: "Warranties",
                newName: "ProjectId");

            migrationBuilder.RenameIndex(
                name: "IX_Warranties_InvoiceId",
                table: "Warranties",
                newName: "IX_Warranties_ProjectId");

            migrationBuilder.AlterColumn<string>(
                name: "SerialNumber",
                table: "WarrantyItems",
                type: "character varying(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "character varying(100)",
                oldMaxLength: 100,
                oldNullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Marca",
                table: "WarrantyItems",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Modelo",
                table: "WarrantyItems",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "VerificationCode",
                table: "Warranties",
                type: "character varying(64)",
                maxLength: 64,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Categoria",
                table: "Products",
                type: "character varying(20)",
                maxLength: 20,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Especificacion",
                table: "Products",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Marca",
                table: "Products",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Modelo",
                table: "Products",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "DueDate",
                table: "Invoices",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<int>(
                name: "ProjectId",
                table: "Invoices",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateTable(
                name: "Projects",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ClientId = table.Column<int>(type: "integer", nullable: false),
                    Nombre = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    CapacidadKwp = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    Etapa = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    Progreso = table.Column<int>(type: "integer", nullable: false),
                    FechaInicio = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    FechaClave = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ResponsableId = table.Column<int>(type: "integer", nullable: false),
                    Costo = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    Presupuesto = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    Notes = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Projects", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Projects_Clients_ClientId",
                        column: x => x.ClientId,
                        principalTable: "Clients",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Projects_Users_ResponsableId",
                        column: x => x.ResponsableId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "EquiposInstalados",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ProductId = table.Column<int>(type: "integer", nullable: false),
                    ProjectId = table.Column<int>(type: "integer", nullable: false),
                    ClientId = table.Column<int>(type: "integer", nullable: false),
                    SerialNumber = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    FechaInstalacion = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Marca = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    Modelo = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    WarrantyMonths = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EquiposInstalados", x => x.Id);
                    table.ForeignKey(
                        name: "FK_EquiposInstalados_Clients_ClientId",
                        column: x => x.ClientId,
                        principalTable: "Clients",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_EquiposInstalados_Products_ProductId",
                        column: x => x.ProductId,
                        principalTable: "Products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_EquiposInstalados_Projects_ProjectId",
                        column: x => x.ProjectId,
                        principalTable: "Projects",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Warranties_VerificationCode",
                table: "Warranties",
                column: "VerificationCode",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Invoices_ProjectId",
                table: "Invoices",
                column: "ProjectId");

            migrationBuilder.CreateIndex(
                name: "IX_EquiposInstalados_ClientId",
                table: "EquiposInstalados",
                column: "ClientId");

            migrationBuilder.CreateIndex(
                name: "IX_EquiposInstalados_ProductId",
                table: "EquiposInstalados",
                column: "ProductId");

            migrationBuilder.CreateIndex(
                name: "IX_EquiposInstalados_ProjectId",
                table: "EquiposInstalados",
                column: "ProjectId");

            migrationBuilder.CreateIndex(
                name: "IX_EquiposInstalados_SerialNumber",
                table: "EquiposInstalados",
                column: "SerialNumber",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Projects_ClientId",
                table: "Projects",
                column: "ClientId");

            migrationBuilder.CreateIndex(
                name: "IX_Projects_ResponsableId",
                table: "Projects",
                column: "ResponsableId");

            migrationBuilder.AddForeignKey(
                name: "FK_Invoices_Projects_ProjectId",
                table: "Invoices",
                column: "ProjectId",
                principalTable: "Projects",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Warranties_Projects_ProjectId",
                table: "Warranties",
                column: "ProjectId",
                principalTable: "Projects",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_WarrantyItems_EquiposInstalados_EquipoInstaladoId",
                table: "WarrantyItems",
                column: "EquipoInstaladoId",
                principalTable: "EquiposInstalados",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Invoices_Projects_ProjectId",
                table: "Invoices");

            migrationBuilder.DropForeignKey(
                name: "FK_Warranties_Projects_ProjectId",
                table: "Warranties");

            migrationBuilder.DropForeignKey(
                name: "FK_WarrantyItems_EquiposInstalados_EquipoInstaladoId",
                table: "WarrantyItems");

            migrationBuilder.DropTable(
                name: "EquiposInstalados");

            migrationBuilder.DropTable(
                name: "Projects");

            migrationBuilder.DropIndex(
                name: "IX_Warranties_VerificationCode",
                table: "Warranties");

            migrationBuilder.DropIndex(
                name: "IX_Invoices_ProjectId",
                table: "Invoices");

            migrationBuilder.DropColumn(
                name: "Marca",
                table: "WarrantyItems");

            migrationBuilder.DropColumn(
                name: "Modelo",
                table: "WarrantyItems");

            migrationBuilder.DropColumn(
                name: "VerificationCode",
                table: "Warranties");

            migrationBuilder.DropColumn(
                name: "Categoria",
                table: "Products");

            migrationBuilder.DropColumn(
                name: "Especificacion",
                table: "Products");

            migrationBuilder.DropColumn(
                name: "Marca",
                table: "Products");

            migrationBuilder.DropColumn(
                name: "Modelo",
                table: "Products");

            migrationBuilder.DropColumn(
                name: "DueDate",
                table: "Invoices");

            migrationBuilder.DropColumn(
                name: "ProjectId",
                table: "Invoices");

            migrationBuilder.RenameColumn(
                name: "EquipoInstaladoId",
                table: "WarrantyItems",
                newName: "ProductId");

            migrationBuilder.RenameIndex(
                name: "IX_WarrantyItems_EquipoInstaladoId",
                table: "WarrantyItems",
                newName: "IX_WarrantyItems_ProductId");

            migrationBuilder.RenameColumn(
                name: "ProjectId",
                table: "Warranties",
                newName: "InvoiceId");

            migrationBuilder.RenameIndex(
                name: "IX_Warranties_ProjectId",
                table: "Warranties",
                newName: "IX_Warranties_InvoiceId");

            migrationBuilder.AlterColumn<string>(
                name: "SerialNumber",
                table: "WarrantyItems",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(100)",
                oldMaxLength: 100);

            migrationBuilder.AddColumn<string>(
                name: "ProductName",
                table: "WarrantyItems",
                type: "character varying(200)",
                maxLength: 200,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "SerialNumber",
                table: "InvoiceItems",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Warranties_Invoices_InvoiceId",
                table: "Warranties",
                column: "InvoiceId",
                principalTable: "Invoices",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_WarrantyItems_Products_ProductId",
                table: "WarrantyItems",
                column: "ProductId",
                principalTable: "Products",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
