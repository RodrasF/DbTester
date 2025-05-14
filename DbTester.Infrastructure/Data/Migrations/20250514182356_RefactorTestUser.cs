using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DbTester.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class RefactorTestUser : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AssignedRole",
                table: "TestUsers");

            migrationBuilder.DropColumn(
                name: "Name",
                table: "TestUsers");

            migrationBuilder.AddColumn<Guid>(
                name: "ConnectionId",
                table: "TestUsers",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<string>(
                name: "Description",
                table: "TestUsers",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsValid",
                table: "TestUsers",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "LastValidationDate",
                table: "TestUsers",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_TestUsers_ConnectionId",
                table: "TestUsers",
                column: "ConnectionId");

            migrationBuilder.AddForeignKey(
                name: "FK_TestUsers_DatabaseConnections_ConnectionId",
                table: "TestUsers",
                column: "ConnectionId",
                principalTable: "DatabaseConnections",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_TestUsers_DatabaseConnections_ConnectionId",
                table: "TestUsers");

            migrationBuilder.DropIndex(
                name: "IX_TestUsers_ConnectionId",
                table: "TestUsers");

            migrationBuilder.DropColumn(
                name: "ConnectionId",
                table: "TestUsers");

            migrationBuilder.DropColumn(
                name: "Description",
                table: "TestUsers");

            migrationBuilder.DropColumn(
                name: "IsValid",
                table: "TestUsers");

            migrationBuilder.DropColumn(
                name: "LastValidationDate",
                table: "TestUsers");

            migrationBuilder.AddColumn<string>(
                name: "AssignedRole",
                table: "TestUsers",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Name",
                table: "TestUsers",
                type: "character varying(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "");
        }
    }
}
