using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace proj.Migrations
{
    /// <inheritdoc />
    public partial class routeName : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "NameRoute",
                table: "public_route",
                type: "text",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "NameRoute",
                table: "public_route");
        }
    }
}
