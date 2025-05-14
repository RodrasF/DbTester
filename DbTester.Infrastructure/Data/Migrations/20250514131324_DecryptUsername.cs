using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DbTester.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class DecryptUsername : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "EncryptedUsername",
                table: "DatabaseConnections",
                newName: "Username");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Username",
                table: "DatabaseConnections",
                newName: "EncryptedUsername");
        }
    }
}
