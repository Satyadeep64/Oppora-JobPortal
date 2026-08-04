using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Oppora.API.Migrations
{
    public partial class AddFullInterviewManagementEntities : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Candidates",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<int>(type: "int", nullable: true),
                    FullName = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    Email = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    PhoneNumber = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    College = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    ResumeUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    CurrentCompany = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    ExperienceYears = table.Column<double>(type: "float", nullable: false),
                    Source = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Candidates", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Candidates_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Interviewers",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<int>(type: "int", nullable: true),
                    FullName = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    Email = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    Department = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Designation = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    MaxInterviewsPerDay = table.Column<int>(type: "int", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Interviewers", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Interviewers_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "InterviewAudits",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    InterviewId = table.Column<int>(type: "int", nullable: false),
                    Action = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    PerformedByUserId = table.Column<int>(type: "int", nullable: false),
                    Details = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    Timestamp = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_InterviewAudits", x => x.Id);
                    table.ForeignKey(
                        name: "FK_InterviewAudits_Interviews_InterviewId",
                        column: x => x.InterviewId,
                        principalTable: "Interviews",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "InterviewAttachments",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    InterviewId = table.Column<int>(type: "int", nullable: false),
                    FileName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    FileUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    FileType = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    UploadedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_InterviewAttachments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_InterviewAttachments_Interviews_InterviewId",
                        column: x => x.InterviewId,
                        principalTable: "Interviews",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Notifications",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    InterviewId = table.Column<int>(type: "int", nullable: true),
                    RecipientUserId = table.Column<int>(type: "int", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Message = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: false),
                    NotificationType = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    IsRead = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Notifications", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Notifications_Interviews_InterviewId",
                        column: x => x.InterviewId,
                        principalTable: "Interviews",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Meetings",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    InterviewRoundId = table.Column<int>(type: "int", nullable: false),
                    Provider = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    MeetingUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    MeetingId = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Passcode = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    ExternalCalendarEventId = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: true),
                    ServiceAccountData = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DurationMinutes = table.Column<int>(type: "int", nullable: false),
                    TimeZone = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    ScheduledStartTime = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ScheduledEndTime = table.Column<DateTime>(type: "datetime2", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Meetings", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Meetings_InterviewRounds_InterviewRoundId",
                        column: x => x.InterviewRoundId,
                        principalTable: "InterviewRounds",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "InterviewPanels",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    InterviewRoundId = table.Column<int>(type: "int", nullable: false),
                    InterviewerId = table.Column<int>(type: "int", nullable: false),
                    RoleInPanel = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    IsConfirmed = table.Column<bool>(type: "bit", nullable: false),
                    AssignedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_InterviewPanels", x => x.Id);
                    table.ForeignKey(
                        name: "FK_InterviewPanels_InterviewRounds_InterviewRoundId",
                        column: x => x.InterviewRoundId,
                        principalTable: "InterviewRounds",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_InterviewPanels_Interviewers_InterviewerId",
                        column: x => x.InterviewerId,
                        principalTable: "Interviewers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "InterviewScores",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    InterviewFeedbackId = table.Column<int>(type: "int", nullable: false),
                    CriterionName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Score = table.Column<int>(type: "int", nullable: false),
                    MaxScore = table.Column<int>(type: "int", nullable: false),
                    Notes = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_InterviewScores", x => x.Id);
                    table.ForeignKey(
                        name: "FK_InterviewScores_InterviewFeedbacks_InterviewFeedbackId",
                        column: x => x.InterviewFeedbackId,
                        principalTable: "InterviewFeedbacks",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(name: "InterviewScores");
            migrationBuilder.DropTable(name: "InterviewPanels");
            migrationBuilder.DropTable(name: "Meetings");
            migrationBuilder.DropTable(name: "Notifications");
            migrationBuilder.DropTable(name: "InterviewAttachments");
            migrationBuilder.DropTable(name: "InterviewAudits");
            migrationBuilder.DropTable(name: "Interviewers");
            migrationBuilder.DropTable(name: "Candidates");
        }
    }
}
