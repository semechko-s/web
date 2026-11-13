using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ValeraApi.Migrations
{
    public partial class AddUsersAndValeraOwnership : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // 1. Сначала создаём таблицу пользователей.
            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),

                    Email = table.Column<string>(
                        type: "TEXT",
                        maxLength: 254,
                        nullable: false),

                    Username = table.Column<string>(
                        type: "TEXT",
                        maxLength: 80,
                        nullable: false),

                    PasswordHash = table.Column<string>(
                        type: "TEXT",
                        nullable: false),

                    Role = table.Column<string>(
                        type: "TEXT",
                        maxLength: 20,
                        nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                });

            // 2. Создаём технического пользователя
            // для сохранения старых записей Валер.
            migrationBuilder.InsertData(
                table: "Users",
                columns: new[]
                {
                    "Id",
                    "Email",
                    "Username",
                    "PasswordHash",
                    "Role"
                },
                values: new object[]
                {
                    1,
                    "legacy-owner@local.invalid",
                    "LegacyOwner",
                    "!",
                    "User"
                });

            // 3. Добавляем UserId.
            // Все старые Валеры автоматически получают UserId = 1.
            migrationBuilder.AddColumn<int>(
                name: "UserId",
                table: "Valeras",
                type: "INTEGER",
                nullable: false,
                defaultValue: 1);

            // 4. Создаём индексы.
            migrationBuilder.CreateIndex(
                name: "IX_Valeras_UserId",
                table: "Valeras",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Users_Email",
                table: "Users",
                column: "Email",
                unique: true);

            // 5. Добавляем внешний ключ.
            migrationBuilder.AddForeignKey(
                name: "FK_Valeras_Users_UserId",
                table: "Valeras",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Valeras_Users_UserId",
                table: "Valeras");

            migrationBuilder.DropIndex(
                name: "IX_Valeras_UserId",
                table: "Valeras");

            migrationBuilder.DropColumn(
                name: "UserId",
                table: "Valeras");

            migrationBuilder.DropTable(
                name: "Users");
        }
    }
}