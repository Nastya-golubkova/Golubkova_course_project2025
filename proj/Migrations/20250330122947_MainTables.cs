using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace proj.Migrations
{
    /// <inheritdoc />
    public partial class MainTables : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Email",
                table: "user",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Password",
                table: "user",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateTable(
                name: "place",
                columns: table => new
                {
                    Id = table.Column<string>(type: "text", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: false),
                    Lat = table.Column<float>(type: "real", nullable: false),
                    Lon = table.Column<float>(type: "real", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_place", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "public_route",
                columns: table => new
                {
                    Id = table.Column<string>(type: "text", nullable: false),
                    UserId = table.Column<string>(type: "text", nullable: false),
                    PlaceIds = table.Column<string[]>(type: "text[]", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_public_route", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "photo",
                columns: table => new
                {
                    Id = table.Column<string>(type: "text", nullable: false),
                    PlaceId = table.Column<string>(type: "text", nullable: false),
                    UserId = table.Column<string>(type: "text", nullable: false),
                    Image = table.Column<byte[]>(type: "bytea", nullable: true),
                    Filename = table.Column<string>(type: "text", nullable: false),
                    Ext = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_photo", x => x.Id);
                    table.ForeignKey(
                        name: "FK_photo_place_PlaceId",
                        column: x => x.PlaceId,
                        principalTable: "place",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_photo_user_UserId",
                        column: x => x.UserId,
                        principalTable: "user",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "userplace",
                columns: table => new
                {
                    Id = table.Column<string>(type: "text", nullable: false),
                    UserId = table.Column<string>(type: "text", nullable: false),
                    PlaceId = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_userplace", x => x.Id);
                    table.ForeignKey(
                        name: "FK_userplace_place_PlaceId",
                        column: x => x.PlaceId,
                        principalTable: "place",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_userplace_user_UserId",
                        column: x => x.UserId,
                        principalTable: "user",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_photo_PlaceId",
                table: "photo",
                column: "PlaceId");

            migrationBuilder.CreateIndex(
                name: "IX_photo_UserId",
                table: "photo",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_userplace_PlaceId",
                table: "userplace",
                column: "PlaceId");

            migrationBuilder.CreateIndex(
                name: "IX_userplace_UserId",
                table: "userplace",
                column: "UserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "photo");

            migrationBuilder.DropTable(
                name: "public_route");

            migrationBuilder.DropTable(
                name: "userplace");

            migrationBuilder.DropTable(
                name: "place");

            migrationBuilder.DropColumn(
                name: "Email",
                table: "user");

            migrationBuilder.DropColumn(
                name: "Password",
                table: "user");
        }
    }
}
