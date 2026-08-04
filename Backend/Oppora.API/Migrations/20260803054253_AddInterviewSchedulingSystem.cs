using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Oppora.API.Migrations
{
    /// <inheritdoc />
    public partial class AddInterviewSchedulingSystem : Migration
    {
        /// <inheritdoc />
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
                    Phone = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    CreatedOn = table.Column<DateTime>(type: "datetime2", nullable: false),
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
                        principalColumn: "Id");
                });

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
                    Status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    IsSent = table.Column<bool>(type: "bit", nullable: false),
                    SentAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    RetryCount = table.Column<int>(type: "int", nullable: false),
                    MaxRetries = table.Column<int>(type: "int", nullable: false),
                    ErrorMessage = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ScheduledFor = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EmailQueues", x => x.Id);
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
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "Interviews",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ApplicationId = table.Column<int>(type: "int", nullable: true),
                    RecruiterId = table.Column<int>(type: "int", nullable: false),
                    CandidateId = table.Column<int>(type: "int", nullable: true),
                    CandidateEntityId = table.Column<int>(type: "int", nullable: true),
                    OpportunityId = table.Column<int>(type: "int", nullable: true),
                    JobRole = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    Department = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    CustomCandidateName = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    CandidateName = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    CustomCandidateEmail = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    CandidateEmail = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    CandidatePhone = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    CustomJobTitle = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    Interviewer = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    InterviewRound = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    InterviewType = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    InterviewDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    InterviewTime = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Duration = table.Column<int>(type: "int", nullable: false),
                    GoogleMeetLink = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    Location = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Notes = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: false),
                    OverallStatus = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    InterviewStatus = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    InvitationStatus = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    CreatedBy = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    OverallResult = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    RecruiterNotes = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: false),
                    CreatedOn = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedOn = table.Column<DateTime>(type: "datetime2", nullable: false),
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
                        name: "FK_Interviews_Candidates_CandidateEntityId",
                        column: x => x.CandidateEntityId,
                        principalTable: "Candidates",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Interviews_Opportunities_OpportunityId",
                        column: x => x.OpportunityId,
                        principalTable: "Opportunities",
                        principalColumn: "Id");
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
                name: "InterviewAudits",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    InterviewId = table.Column<int>(type: "int", nullable: false),
                    Action = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    PerformedByUserId = table.Column<int>(type: "int", nullable: false),
                    PerformedByName = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    OldValue = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    NewValue = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    Details = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    Changes = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    PerformedBy = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    PerformedOn = table.Column<DateTime>(type: "datetime2", nullable: false),
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
                    table.ForeignKey(
                        name: "FK_InterviewAudits_Users_PerformedByUserId",
                        column: x => x.PerformedByUserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "InterviewEmails",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    InterviewId = table.Column<int>(type: "int", nullable: false),
                    RecipientEmail = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    Subject = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: false),
                    Body = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    InvitationStatus = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    SentOn = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ErrorMessage = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedOn = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_InterviewEmails", x => x.Id);
                    table.ForeignKey(
                        name: "FK_InterviewEmails_Interviews_InterviewId",
                        column: x => x.InterviewId,
                        principalTable: "Interviews",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
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
                    Title = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    InterviewType = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Agenda = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    InterviewDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ScheduledStartTime = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ScheduledEndTime = table.Column<DateTime>(type: "datetime2", nullable: false),
                    DurationMinutes = table.Column<int>(type: "int", nullable: false),
                    TimeZone = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
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
                    table.ForeignKey(
                        name: "FK_Notifications_Users_RecipientUserId",
                        column: x => x.RecipientUserId,
                        principalTable: "Users",
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
                    InterviewerId = table.Column<int>(type: "int", nullable: true),
                    Rating = table.Column<int>(type: "int", nullable: false),
                    OverallRating = table.Column<int>(type: "int", nullable: false),
                    TechnicalScore = table.Column<int>(type: "int", nullable: false),
                    CommunicationScore = table.Column<int>(type: "int", nullable: false),
                    ProblemSolvingScore = table.Column<int>(type: "int", nullable: false),
                    Strengths = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: false),
                    AreasOfImprovement = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: false),
                    Comments = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: false),
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
                        name: "FK_InterviewFeedbacks_Interviewers_InterviewerId",
                        column: x => x.InterviewerId,
                        principalTable: "Interviewers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
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
                    ExternalCalendarEventId = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    ServiceAccountData = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    ScheduledStartTime = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ScheduledEndTime = table.Column<DateTime>(type: "datetime2", nullable: false),
                    DurationMinutes = table.Column<int>(type: "int", nullable: false),
                    TimeZone = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
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
                    ServiceAccountData = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: true),
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

            migrationBuilder.CreateIndex(
                name: "IX_Candidates_UserId",
                table: "Candidates",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_InterviewAttachments_InterviewId",
                table: "InterviewAttachments",
                column: "InterviewId");

            migrationBuilder.CreateIndex(
                name: "IX_InterviewAudits_InterviewId",
                table: "InterviewAudits",
                column: "InterviewId");

            migrationBuilder.CreateIndex(
                name: "IX_InterviewAudits_PerformedByUserId",
                table: "InterviewAudits",
                column: "PerformedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_InterviewEmails_InterviewId",
                table: "InterviewEmails",
                column: "InterviewId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Interviewers_UserId",
                table: "Interviewers",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_InterviewFeedbacks_EvaluatorId",
                table: "InterviewFeedbacks",
                column: "EvaluatorId");

            migrationBuilder.CreateIndex(
                name: "IX_InterviewFeedbacks_InterviewerId",
                table: "InterviewFeedbacks",
                column: "InterviewerId");

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
                name: "IX_InterviewPanels_InterviewerId",
                table: "InterviewPanels",
                column: "InterviewerId");

            migrationBuilder.CreateIndex(
                name: "IX_InterviewPanels_InterviewRoundId",
                table: "InterviewPanels",
                column: "InterviewRoundId");

            migrationBuilder.CreateIndex(
                name: "IX_InterviewRounds_InterviewId",
                table: "InterviewRounds",
                column: "InterviewId");

            migrationBuilder.CreateIndex(
                name: "IX_Interviews_ApplicationId",
                table: "Interviews",
                column: "ApplicationId");

            migrationBuilder.CreateIndex(
                name: "IX_Interviews_CandidateEntityId",
                table: "Interviews",
                column: "CandidateEntityId");

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
                name: "IX_InterviewScores_InterviewFeedbackId",
                table: "InterviewScores",
                column: "InterviewFeedbackId");

            migrationBuilder.CreateIndex(
                name: "IX_MeetingDetails_InterviewRoundId",
                table: "MeetingDetails",
                column: "InterviewRoundId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Meetings_InterviewRoundId",
                table: "Meetings",
                column: "InterviewRoundId");

            migrationBuilder.CreateIndex(
                name: "IX_Notifications_InterviewId",
                table: "Notifications",
                column: "InterviewId");

            migrationBuilder.CreateIndex(
                name: "IX_Notifications_RecipientUserId",
                table: "Notifications",
                column: "RecipientUserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "EmailQueues");

            migrationBuilder.DropTable(
                name: "InterviewAttachments");

            migrationBuilder.DropTable(
                name: "InterviewAudits");

            migrationBuilder.DropTable(
                name: "InterviewEmails");

            migrationBuilder.DropTable(
                name: "InterviewNotifications");

            migrationBuilder.DropTable(
                name: "InterviewPanelMembers");

            migrationBuilder.DropTable(
                name: "InterviewPanels");

            migrationBuilder.DropTable(
                name: "InterviewScores");

            migrationBuilder.DropTable(
                name: "MeetingDetails");

            migrationBuilder.DropTable(
                name: "Meetings");

            migrationBuilder.DropTable(
                name: "Notifications");

            migrationBuilder.DropTable(
                name: "InterviewFeedbacks");

            migrationBuilder.DropTable(
                name: "InterviewRounds");

            migrationBuilder.DropTable(
                name: "Interviewers");

            migrationBuilder.DropTable(
                name: "Interviews");

            migrationBuilder.DropTable(
                name: "Candidates");
        }
    }
}
