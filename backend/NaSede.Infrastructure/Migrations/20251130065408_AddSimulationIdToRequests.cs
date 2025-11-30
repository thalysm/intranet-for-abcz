using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NaSede.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddSimulationIdToRequests : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "LoanSimulationId",
                table: "Requests",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "SimulationId",
                table: "Requests",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Requests_LoanSimulationId",
                table: "Requests",
                column: "LoanSimulationId");

            migrationBuilder.AddForeignKey(
                name: "FK_Requests_LoanSimulations_LoanSimulationId",
                table: "Requests",
                column: "LoanSimulationId",
                principalTable: "LoanSimulations",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Requests_LoanSimulations_LoanSimulationId",
                table: "Requests");

            migrationBuilder.DropIndex(
                name: "IX_Requests_LoanSimulationId",
                table: "Requests");

            migrationBuilder.DropColumn(
                name: "LoanSimulationId",
                table: "Requests");

            migrationBuilder.DropColumn(
                name: "SimulationId",
                table: "Requests");
        }
    }
}
