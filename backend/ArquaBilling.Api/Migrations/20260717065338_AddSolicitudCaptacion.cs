using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace ArquaBilling.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddSolicitudCaptacion : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ElectrodomesticosCatalogo",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Nombre = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    WattsTipicos = table.Column<int>(type: "integer", nullable: false),
                    HorasPorDiaSugeridas = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    Categoria = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ElectrodomesticosCatalogo", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "SolicitudesClientes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    NumeroSolicitud = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    Nombre = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    DocumentType = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    DocumentNumber = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    Phone = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    Email = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    Provincia = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    Ubicacion = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: false),
                    FacturaLuzMensual = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: true),
                    ConsumoEstimadoKwhDia = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    Estado = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    ClienteCreadoId = table.Column<int>(type: "integer", nullable: true),
                    RevisadoPorUserId = table.Column<int>(type: "integer", nullable: true),
                    RevisadoAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    MotivoRechazo = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    Notas = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SolicitudesClientes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SolicitudesClientes_Clients_ClienteCreadoId",
                        column: x => x.ClienteCreadoId,
                        principalTable: "Clients",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_SolicitudesClientes_Users_RevisadoPorUserId",
                        column: x => x.RevisadoPorUserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "SolicitudEquipos",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    SolicitudId = table.Column<int>(type: "integer", nullable: false),
                    ElectrodomesticoId = table.Column<int>(type: "integer", nullable: false),
                    NombreEquipo = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Watts = table.Column<int>(type: "integer", nullable: false),
                    Cantidad = table.Column<int>(type: "integer", nullable: false),
                    HorasPorDia = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SolicitudEquipos", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SolicitudEquipos_ElectrodomesticosCatalogo_Electrodomestico~",
                        column: x => x.ElectrodomesticoId,
                        principalTable: "ElectrodomesticosCatalogo",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_SolicitudEquipos_SolicitudesClientes_SolicitudId",
                        column: x => x.SolicitudId,
                        principalTable: "SolicitudesClientes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ElectrodomesticosCatalogo_Nombre",
                table: "ElectrodomesticosCatalogo",
                column: "Nombre",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_SolicitudEquipos_ElectrodomesticoId",
                table: "SolicitudEquipos",
                column: "ElectrodomesticoId");

            migrationBuilder.CreateIndex(
                name: "IX_SolicitudEquipos_SolicitudId",
                table: "SolicitudEquipos",
                column: "SolicitudId");

            migrationBuilder.CreateIndex(
                name: "IX_SolicitudesClientes_ClienteCreadoId",
                table: "SolicitudesClientes",
                column: "ClienteCreadoId");

            migrationBuilder.CreateIndex(
                name: "IX_SolicitudesClientes_Estado_CreatedAt",
                table: "SolicitudesClientes",
                columns: new[] { "Estado", "CreatedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_SolicitudesClientes_NumeroSolicitud",
                table: "SolicitudesClientes",
                column: "NumeroSolicitud",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_SolicitudesClientes_RevisadoPorUserId",
                table: "SolicitudesClientes",
                column: "RevisadoPorUserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "SolicitudEquipos");

            migrationBuilder.DropTable(
                name: "ElectrodomesticosCatalogo");

            migrationBuilder.DropTable(
                name: "SolicitudesClientes");
        }
    }
}
