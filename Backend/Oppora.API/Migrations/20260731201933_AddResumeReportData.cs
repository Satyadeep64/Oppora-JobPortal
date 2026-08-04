using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Oppora.API.Migrations
{
    /// <inheritdoc />
    public partial class AddResumeReportData : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "MissingSkills",
                table: "ResumeAnalysisHistories",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Strengths",
                table: "ResumeAnalysisHistories",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Suggestions",
                table: "ResumeAnalysisHistories",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "MissingSkills",
                table: "ResumeAnalysisHistories");

            migrationBuilder.DropColumn(
                name: "Strengths",
                table: "ResumeAnalysisHistories");

            migrationBuilder.DropColumn(
                name: "Suggestions",
                table: "ResumeAnalysisHistories");
        }
    }
}
