using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Oppora.API.Migrations
{
    /// <inheritdoc />
    public partial class AddInterviewDatabaseSchema : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "EmailQueues",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ToEmail = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    ToName = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    Subject = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: false),
                    BodyHtml = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IcsCalendarContent = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsSent = table.Column<bool>(type: "bit", nullable: false),
                    SentAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    RetryCount = table.Column<int>(type: "int", nullable: false),
                    ErrorMessage = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ScheduledFor = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EmailQueues", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Interviews",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ApplicationId = table.Column<int>(type: "int", nullable: false),
                    RecruiterId = table.Column<int>(type: "int", nullable: false),
                    CandidateId = table.Column<int>(type: "int", nullable: false),
                    OpportunityId = table.Column<int>(type: "int", nullable: false),
                    OverallStatus = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    OverallResult = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    RecruiterNotes = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Interviews", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Interviews_Applications_ApplicationId",
                        column: x => x.ApplicationId,
                        principalTable: "Applications",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Interviews_Opportunities_OpportunityId",
                        column: x => x.OpportunityId,
                        principalTable: "Opportunities",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Interviews_Users_CandidateId",
                        column: x => x.CandidateId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Interviews_Users_RecruiterId",
                        column: x => x.RecruiterId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "InterviewNotifications",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    InterviewId = table.Column<int>(type: "int", nullable: false),
                    RecipientUserId = table.Column<int>(type: "int", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Message = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: false),
                    NotificationType = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    IsRead = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_InterviewNotifications", x => x.Id);
                    table.ForeignKey(
                        name: "FK_InterviewNotifications_Interviews_InterviewId",
                        column: x => x.InterviewId,
                        principalTable: "Interviews",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_InterviewNotifications_Users_RecipientUserId",
                        column: x => x.RecipientUserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "InterviewRounds",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    InterviewId = table.Column<int>(type: "int", nullable: false),
                    RoundNumber = table.Column<int>(type: "int", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    InterviewType = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Agenda = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    InterviewDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ScheduledStartTime = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ScheduledEndTime = table.Column<DateTime>(type: "datetime2", nullable: false),
                    DurationMinutes = table.Column<int>(type: "int", nullable: false),
                    TimeZone = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    IsEmailSent = table.Column<bool>(type: "bit", nullable: false),
                    EmailSentAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsReminderSent = table.Column<bool>(type: "bit", nullable: false),
                    ReminderSentAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_InterviewRounds", x => x.Id);
                    table.ForeignKey(
                        name: "FK_InterviewRounds_Interviews_InterviewId",
                        column: x => x.InterviewId,
                        principalTable: "Interviews",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "InterviewFeedbacks",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    InterviewRoundId = table.Column<int>(type: "int", nullable: false),
                    EvaluatorId = table.Column<int>(type: "int", nullable: false),
                    OverallRating = table.Column<int>(type: "int", nullable: false),
                    TechnicalScore = table.Column<int>(type: "int", nullable: false),
                    CommunicationScore = table.Column<int>(type: "int", nullable: false),
                    ProblemSolvingScore = table.Column<int>(type: "int", nullable: false),
                    Strengths = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: false),
                    AreasOfImprovement = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: false),
                    Comments = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: false),
                    Recommendation = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    SubmittedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_InterviewFeedbacks", x => x.Id);
                    table.ForeignKey(
                        name: "FK_InterviewFeedbacks_InterviewRounds_InterviewRoundId",
                        column: x => x.InterviewRoundId,
                        principalTable: "InterviewRounds",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_InterviewFeedbacks_Users_EvaluatorId",
                        column: x => x.EvaluatorId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "InterviewPanelMembers",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    InterviewRoundId = table.Column<int>(type: "int", nullable: false),
                    PanelMemberUserId = table.Column<int>(type: "int", nullable: false),
                    RoleInInterview = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    AssignedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_InterviewPanelMembers", x => x.Id);
                    table.ForeignKey(
                        name: "FK_InterviewPanelMembers_InterviewRounds_InterviewRoundId",
                        column: x => x.InterviewRoundId,
                        principalTable: "InterviewRounds",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_InterviewPanelMembers_Users_PanelMemberUserId",
                        column: x => x.PanelMemberUserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "MeetingDetails",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    InterviewRoundId = table.Column<int>(type: "int", nullable: false),
                    Provider = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    MeetingUrl = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    MeetingId = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    Passcode = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    ScheduledStartTime = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ScheduledEndTime = table.Column<DateTime>(type: "datetime2", nullable: false),
                    TimeZone = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MeetingDetails", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MeetingDetails_InterviewRounds_InterviewRoundId",
                        column: x => x.InterviewRoundId,
                        principalTable: "InterviewRounds",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_InterviewFeedbacks_EvaluatorId",
                table: "InterviewFeedbacks",
                column: "EvaluatorId");

            migrationBuilder.CreateIndex(
                name: "IX_InterviewFeedbacks_InterviewRoundId",
                table: "InterviewFeedbacks",
                column: "InterviewRoundId");

            migrationBuilder.CreateIndex(
                name: "IX_InterviewNotifications_InterviewId",
                table: "InterviewNotifications",
                column: "InterviewId");

            migrationBuilder.CreateIndex(
                name: "IX_InterviewNotifications_RecipientUserId",
                table: "InterviewNotifications",
                column: "RecipientUserId");

            migrationBuilder.CreateIndex(
                name: "IX_InterviewPanelMembers_InterviewRoundId",
                table: "InterviewPanelMembers",
                column: "InterviewRoundId");

            migrationBuilder.CreateIndex(
                name: "IX_InterviewPanelMembers_PanelMemberUserId",
                table: "InterviewPanelMembers",
                column: "PanelMemberUserId");

            migrationBuilder.CreateIndex(
                name: "IX_InterviewRounds_InterviewId",
                table: "InterviewRounds",
                column: "InterviewId");

            migrationBuilder.CreateIndex(
                name: "IX_Interviews_ApplicationId",
                table: "Interviews",
                column: "ApplicationId");

            migrationBuilder.CreateIndex(
                name: "IX_Interviews_CandidateId",
                table: "Interviews",
                column: "CandidateId");

            migrationBuilder.CreateIndex(
                name: "IX_Interviews_OpportunityId",
                table: "Interviews",
                column: "OpportunityId");

            migrationBuilder.CreateIndex(
                name: "IX_Interviews_RecruiterId",
                table: "Interviews",
                column: "RecruiterId");

            migrationBuilder.CreateIndex(
                name: "IX_MeetingDetails_InterviewRoundId",
                table: "MeetingDetails",
                column: "InterviewRoundId",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(name: "EmailQueues");
            migrationBuilder.DropTable(name: "InterviewFeedbacks");
            migrationBuilder.DropTable(name: "InterviewNotifications");
            migrationBuilder.DropTable(name: "InterviewPanelMembers");
            migrationBuilder.DropTable(name: "MeetingDetails");
            migrationBuilder.DropTable(name: "InterviewRounds");
            migrationBuilder.DropTable(name: "Interviews");
        }
    }
}
