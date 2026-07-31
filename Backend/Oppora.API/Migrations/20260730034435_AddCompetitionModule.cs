using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Oppora.API.Migrations
{
    /// <inheritdoc />
    public partial class AddCompetitionModule : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Applications_Opportunities_OpportunityId",
                table: "Applications");

            migrationBuilder.DropForeignKey(
                name: "FK_Applications_Users_UserId",
                table: "Applications");

            migrationBuilder.AddColumn<int>(
                name: "OpportunityId1",
                table: "Applications",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "UserId1",
                table: "Applications",
                type: "int",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "Categories",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Slug = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Categories", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Locations",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    IsOnline = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Locations", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Organizations",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    LogoUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    WebsiteUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    ContactEmail = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    IsVerified = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Organizations", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Tags",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Tags", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Competitions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Title = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    OrganizationId = table.Column<int>(type: "int", nullable: false),
                    CategoryId = table.Column<int>(type: "int", nullable: false),
                    LocationId = table.Column<int>(type: "int", nullable: false),
                    Mode = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    TeamSize = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    MinTeamMembers = table.Column<int>(type: "int", nullable: false),
                    MaxTeamMembers = table.Column<int>(type: "int", nullable: false),
                    RegistrationFee = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    RegistrationDeadline = table.Column<DateTime>(type: "datetime2", nullable: false),
                    RegistrationStartDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    OfficialRegistrationUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    IsFeatured = table.Column<bool>(type: "bit", nullable: false),
                    RegisteredCount = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Competitions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Competitions_Categories_CategoryId",
                        column: x => x.CategoryId,
                        principalTable: "Categories",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Competitions_Locations_LocationId",
                        column: x => x.LocationId,
                        principalTable: "Locations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Competitions_Organizations_OrganizationId",
                        column: x => x.OrganizationId,
                        principalTable: "Organizations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "CompetitionTags",
                columns: table => new
                {
                    CompetitionId = table.Column<int>(type: "int", nullable: false),
                    TagId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CompetitionTags", x => new { x.CompetitionId, x.TagId });
                    table.ForeignKey(
                        name: "FK_CompetitionTags_Competitions_CompetitionId",
                        column: x => x.CompetitionId,
                        principalTable: "Competitions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_CompetitionTags_Tags_TagId",
                        column: x => x.TagId,
                        principalTable: "Tags",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Eligibilities",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CompetitionId = table.Column<int>(type: "int", nullable: false),
                    DegreeRequirement = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: true),
                    BatchRequirement = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    DomainSpecialization = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    MinAge = table.Column<int>(type: "int", nullable: true),
                    MaxAge = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Eligibilities", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Eligibilities_Competitions_CompetitionId",
                        column: x => x.CompetitionId,
                        principalTable: "Competitions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Prizes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CompetitionId = table.Column<int>(type: "int", nullable: false),
                    Rank = table.Column<int>(type: "int", nullable: false),
                    PositionName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    RewardDescription = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: false),
                    Amount = table.Column<decimal>(type: "decimal(18,2)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Prizes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Prizes_Competitions_CompetitionId",
                        column: x => x.CompetitionId,
                        principalTable: "Competitions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Registrations",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CompetitionId = table.Column<int>(type: "int", nullable: false),
                    ParticipantName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    ParticipantEmail = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    CollegeName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    RegisteredAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Registrations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Registrations_Competitions_CompetitionId",
                        column: x => x.CompetitionId,
                        principalTable: "Competitions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Rules",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CompetitionId = table.Column<int>(type: "int", nullable: false),
                    RuleText = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    DisplayOrder = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Rules", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Rules_Competitions_CompetitionId",
                        column: x => x.CompetitionId,
                        principalTable: "Competitions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "TimelineRounds",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CompetitionId = table.Column<int>(type: "int", nullable: false),
                    RoundNumber = table.Column<int>(type: "int", nullable: false),
                    RoundTitle = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    RoundDate = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TimelineRounds", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TimelineRounds_Competitions_CompetitionId",
                        column: x => x.CompetitionId,
                        principalTable: "Competitions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Opportunities_RecruiterId",
                table: "Opportunities",
                column: "RecruiterId");

            migrationBuilder.CreateIndex(
                name: "IX_Applications_OpportunityId1",
                table: "Applications",
                column: "OpportunityId1");

            migrationBuilder.CreateIndex(
                name: "IX_Applications_UserId1",
                table: "Applications",
                column: "UserId1");

            migrationBuilder.CreateIndex(
                name: "IX_Categories_Name",
                table: "Categories",
                column: "Name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Competitions_CategoryId",
                table: "Competitions",
                column: "CategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_Competitions_LocationId",
                table: "Competitions",
                column: "LocationId");

            migrationBuilder.CreateIndex(
                name: "IX_Competitions_OrganizationId",
                table: "Competitions",
                column: "OrganizationId");

            migrationBuilder.CreateIndex(
                name: "IX_CompetitionTags_TagId",
                table: "CompetitionTags",
                column: "TagId");

            migrationBuilder.CreateIndex(
                name: "IX_Eligibilities_CompetitionId",
                table: "Eligibilities",
                column: "CompetitionId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Prizes_CompetitionId",
                table: "Prizes",
                column: "CompetitionId");

            migrationBuilder.CreateIndex(
                name: "IX_Registrations_CompetitionId",
                table: "Registrations",
                column: "CompetitionId");

            migrationBuilder.CreateIndex(
                name: "IX_Rules_CompetitionId",
                table: "Rules",
                column: "CompetitionId");

            migrationBuilder.CreateIndex(
                name: "IX_Tags_Name",
                table: "Tags",
                column: "Name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_TimelineRounds_CompetitionId",
                table: "TimelineRounds",
                column: "CompetitionId");

            migrationBuilder.AddForeignKey(
                name: "FK_Applications_Opportunities_OpportunityId",
                table: "Applications",
                column: "OpportunityId",
                principalTable: "Opportunities",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Applications_Opportunities_OpportunityId1",
                table: "Applications",
                column: "OpportunityId1",
                principalTable: "Opportunities",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Applications_Users_UserId",
                table: "Applications",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Applications_Users_UserId1",
                table: "Applications",
                column: "UserId1",
                principalTable: "Users",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Opportunities_Users_RecruiterId",
                table: "Opportunities",
                column: "RecruiterId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Applications_Opportunities_OpportunityId",
                table: "Applications");

            migrationBuilder.DropForeignKey(
                name: "FK_Applications_Opportunities_OpportunityId1",
                table: "Applications");

            migrationBuilder.DropForeignKey(
                name: "FK_Applications_Users_UserId",
                table: "Applications");

            migrationBuilder.DropForeignKey(
                name: "FK_Applications_Users_UserId1",
                table: "Applications");

            migrationBuilder.DropForeignKey(
                name: "FK_Opportunities_Users_RecruiterId",
                table: "Opportunities");

            migrationBuilder.DropTable(
                name: "CompetitionTags");

            migrationBuilder.DropTable(
                name: "Eligibilities");

            migrationBuilder.DropTable(
                name: "Prizes");

            migrationBuilder.DropTable(
                name: "Registrations");

            migrationBuilder.DropTable(
                name: "Rules");

            migrationBuilder.DropTable(
                name: "TimelineRounds");

            migrationBuilder.DropTable(
                name: "Tags");

            migrationBuilder.DropTable(
                name: "Competitions");

            migrationBuilder.DropTable(
                name: "Categories");

            migrationBuilder.DropTable(
                name: "Locations");

            migrationBuilder.DropTable(
                name: "Organizations");

            migrationBuilder.DropIndex(
                name: "IX_Opportunities_RecruiterId",
                table: "Opportunities");

            migrationBuilder.DropIndex(
                name: "IX_Applications_OpportunityId1",
                table: "Applications");

            migrationBuilder.DropIndex(
                name: "IX_Applications_UserId1",
                table: "Applications");

            migrationBuilder.DropColumn(
                name: "OpportunityId1",
                table: "Applications");

            migrationBuilder.DropColumn(
                name: "UserId1",
                table: "Applications");

            migrationBuilder.AddForeignKey(
                name: "FK_Applications_Opportunities_OpportunityId",
                table: "Applications",
                column: "OpportunityId",
                principalTable: "Opportunities",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Applications_Users_UserId",
                table: "Applications",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
