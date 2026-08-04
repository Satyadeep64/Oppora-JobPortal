using System.ComponentModel.DataAnnotations;

namespace Oppora.API.DTOs
{
    public class CheckConflictDto
    {
        public int? InterviewerId { get; set; }
        public int? CandidateId { get; set; }
        public string? CandidateEmail { get; set; }
        [Required]
        public DateTime ScheduledStartTime { get; set; }
        public int DurationMinutes { get; set; } = 45;
    }

    public class ConflictCheckResponseDto
    {
        public bool HasConflict { get; set; }
        public string? ConflictReason { get; set; }
        public List<string> Conflicts { get; set; } = new();
    }

    public class ScheduleInterviewDto
    {
        public int? ApplicationId { get; set; }
        public int? OpportunityId { get; set; }
        public int? CandidateId { get; set; }

        public string? CandidateName { get; set; }
        public string? CandidateEmail { get; set; }
        public string? CandidatePhone { get; set; }
        public string? JobRole { get; set; }
        public string? CustomJobTitle { get; set; }
        public string Department { get; set; } = "Engineering";
        public string Interviewer { get; set; } = string.Empty;

        [Required]
        public int RecruiterId { get; set; }

        [Required]
        public string RoundTitle { get; set; } = "Technical Round 1";
        public string InterviewRound { get => RoundTitle; set => RoundTitle = value; }
        public string InterviewType { get; set; } = "Technical";

        public string Agenda { get; set; } = string.Empty;

        [Required]
        public DateTime ScheduledTime { get; set; }
        public DateTime InterviewDate { get; set; } = DateTime.UtcNow.Date;
        public string InterviewTime { get; set; } = "10:00 AM";

        [Range(15, 240)]
        public int DurationMinutes { get; set; } = 45;
        public int Duration { get => DurationMinutes; set => DurationMinutes = value; }

        public string MeetingProvider { get; set; } = "Google Meet";

        public string? CustomMeetingUrl { get; set; }
        public string GoogleMeetLink { get => CustomMeetingUrl ?? string.Empty; set => CustomMeetingUrl = value; }
        public string Location { get; set; } = "Online / Google Meet";

        public string SpecialInstructions { get; set; } = string.Empty;
        public string Notes { get => SpecialInstructions; set => SpecialInstructions = value; }
        public string InterviewStatus { get; set; } = "Scheduled";
        public string InvitationStatus { get; set; } = "Pending";
        public string CreatedBy { get; set; } = "Recruiter";
    }

    public class CandidateDirectoryDto
    {
        public int UserId { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public string RecentJobTitle { get; set; } = string.Empty;
    }

    public class ShortlistedCandidateDto
    {
        public int ApplicationId { get; set; }
        public int OpportunityId { get; set; }
        public int UserId { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string OpportunityTitle { get; set; } = string.Empty;
        public string CompanyName { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public DateTime AppliedAt { get; set; }
    }

    public class CreateInterviewRoundDto
    {
        [Required]
        public int InterviewId { get; set; }

        public int RoundNumber { get; set; } = 1;

        [Required]
        public string Title { get; set; } = string.Empty;

        public string Agenda { get; set; } = string.Empty;

        [Required]
        public DateTime ScheduledTime { get; set; }

        public int DurationMinutes { get; set; } = 45;

        public string MeetingProvider { get; set; } = "Google Meet";

        public string? CustomMeetingUrl { get; set; }
    }

    public class RescheduleInterviewDto
    {
        public int? RoundId { get; set; }

        [Required]
        public DateTime NewScheduledTime { get; set; }

        public string? InterviewTime { get; set; }
        public string? Interviewer { get; set; }
        public string? InterviewRound { get; set; }
        public int DurationMinutes { get; set; } = 45;

        public string Reason { get; set; } = string.Empty;
        public string? NewMeetingUrl { get; set; }
        public string? GoogleMeetLink { get; set; }
        public string? RecruiterName { get; set; }
    }

    public class CancelInterviewDto
    {
        public string Reason { get; set; } = string.Empty;
    }

    public class UpdateInterviewDto
    {
        public string? CandidateName { get; set; }
        public string? CandidateEmail { get; set; }
        public string? CandidatePhone { get; set; }
        public string? JobRole { get; set; }
        public string? Interviewer { get; set; }
        public string? InterviewRound { get; set; }
        public DateTime? InterviewDate { get; set; }
        public string? InterviewTime { get; set; }
        public int? Duration { get; set; }
        public string? GoogleMeetLink { get; set; }
        public string? Notes { get; set; }
        public string? Status { get; set; }
        public string? OverallStatus { get; set; }
        public string? OverallResult { get; set; }
        public string? RecruiterNotes { get; set; }
    }

    public class SubmitFeedbackDto
    {
        [Required]
        public int InterviewRoundId { get; set; }

        [Required]
        public int EvaluatorId { get; set; }

        [Range(1, 5)]
        public int Rating { get; set; } = 5;

        [Range(1, 5)]
        public int OverallRating { get; set; } = 5;

        [Range(1, 5)]
        public int TechnicalScore { get; set; } = 5;

        [Range(1, 5)]
        public int CommunicationScore { get; set; } = 5;

        [Range(1, 5)]
        public int ProblemSolvingScore { get; set; } = 5;

        public string Strengths { get; set; } = string.Empty;
        public string AreasOfImprovement { get; set; } = string.Empty;
        public string Comments { get; set; } = string.Empty;

        [Required]
        public string Recommendation { get; set; } = "Hire"; // Strong Hire, Hire, Neutral, Reject
    }

    public class InterviewResponseDto
    {
        public int Id { get; set; }
        public int? ApplicationId { get; set; }
        public int RecruiterId { get; set; }
        public string RecruiterName { get; set; } = string.Empty;
        public int? CandidateId { get; set; }
        public string CandidateName { get; set; } = string.Empty;
        public string CandidateEmail { get; set; } = string.Empty;
        public string CandidatePhone { get; set; } = string.Empty;
        public int OpportunityId { get; set; }
        public string OpportunityTitle { get; set; } = string.Empty;
        public string JobRole { get; set; } = string.Empty;
        public string Department { get; set; } = "Engineering";
        public string CompanyName { get; set; } = string.Empty;
        public string Interviewer { get; set; } = string.Empty;
        public string InterviewRound { get; set; } = "Technical Round 1";
        public string InterviewType { get; set; } = "Technical";
        public DateTime InterviewDate { get; set; }
        public string InterviewTime { get; set; } = string.Empty;
        public int Duration { get; set; } = 45;
        public string GoogleMeetLink { get; set; } = string.Empty;
        public string Location { get; set; } = "Online / Google Meet";
        public string Notes { get; set; } = string.Empty;
        public string OverallStatus { get; set; } = string.Empty;
        public string InterviewStatus { get; set; } = string.Empty;
        public string InvitationStatus { get; set; } = "Pending";
        public string CreatedBy { get; set; } = "Recruiter";
        public string? OverallResult { get; set; }
        public string SpecialInstructions { get; set; } = string.Empty;
        public string RecruiterNotes { get; set; } = string.Empty;
        public InterviewEmailDto? EmailStatus { get; set; }
        public List<InterviewAuditDto> Audits { get; set; } = new();
        public List<InterviewRoundResponseDto> Rounds { get; set; } = new();
        public List<InterviewNotificationResponseDto> Notifications { get; set; } = new();
        public DateTime CreatedOn { get; set; }
        public DateTime UpdatedOn { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class InterviewAuditDto
    {
        public int Id { get; set; }
        public int InterviewId { get; set; }
        public string Action { get; set; } = string.Empty;
        public string Changes { get; set; } = string.Empty;
        public string PerformedBy { get; set; } = string.Empty;
        public DateTime PerformedOn { get; set; }
    }

    public class InterviewEmailDto
    {
        public int Id { get; set; }
        public int InterviewId { get; set; }
        public string RecipientEmail { get; set; } = string.Empty;
        public string Subject { get; set; } = string.Empty;
        public string Body { get; set; } = string.Empty;
        public string InvitationStatus { get; set; } = string.Empty;
        public DateTime? SentOn { get; set; }
        public string? ErrorMessage { get; set; }
    }

    public class TestEmailRequestDto
    {
        public string? RecipientEmail { get; set; }
        public string? ToEmail { get => RecipientEmail; set => RecipientEmail = value; }
        public string Subject { get; set; } = "Oppora SMTP Verification Test Email";
    }

    public class InterviewRoundResponseDto
    {
        public int Id { get; set; }
        public int InterviewId { get; set; }
        public int RoundNumber { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Agenda { get; set; } = string.Empty;
        public DateTime ScheduledTime { get; set; }
        public int DurationMinutes { get; set; }
        public string Status { get; set; } = string.Empty;
        public bool IsEmailSent { get; set; }
        public bool IsReminderSent { get; set; }
        public MeetingDetailsResponseDto? MeetingDetails { get; set; }
        public List<InterviewFeedbackResponseDto> Feedbacks { get; set; } = new();
    }

    public class MeetingDetailsResponseDto
    {
        public int Id { get; set; }
        public int InterviewRoundId { get; set; }
        public string Provider { get; set; } = string.Empty;
        public string MeetingUrl { get; set; } = string.Empty;
        public string MeetingId { get; set; } = string.Empty;
        public string MeetingCode { get; set; } = string.Empty;
        public int DurationMinutes { get; set; } = 45;
        public string TimeZone { get; set; } = "UTC";
        public DateTime ScheduledStartTime { get; set; }
        public DateTime ScheduledEndTime { get; set; }
        public string? ExternalCalendarEventId { get; set; }
        public bool IsActive { get; set; } = true;
    }

    public class InterviewFeedbackResponseDto
    {
        public int Id { get; set; }
        public int InterviewRoundId { get; set; }
        public int EvaluatorId { get; set; }
        public string EvaluatorName { get; set; } = string.Empty;
        public int Rating { get; set; }
        public int OverallRating { get; set; }
        public int TechnicalScore { get; set; }
        public int CommunicationScore { get; set; }
        public int ProblemSolvingScore { get; set; }
        public string Strengths { get; set; } = string.Empty;
        public string AreasOfImprovement { get; set; } = string.Empty;
        public string Comments { get; set; } = string.Empty;
        public string Recommendation { get; set; } = string.Empty;
        public DateTime SubmittedAt { get; set; }
    }

    public class InterviewNotificationResponseDto
    {
        public int Id { get; set; }
        public string Message { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public DateTime SentAt { get; set; }
    }

    public class CalendarEventDto
    {
        public string Id { get; set; } = string.Empty;
        public int InterviewId { get; set; }
        public int RoundId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string CandidateName { get; set; } = string.Empty;
        public string OpportunityTitle { get; set; } = string.Empty;
        public string CompanyName { get; set; } = string.Empty;
        public DateTime Start { get; set; }
        public DateTime End { get; set; }
        public string Status { get; set; } = string.Empty;
        public string MeetingUrl { get; set; } = string.Empty;
        public string Color { get; set; } = string.Empty;
    }

    public class SaveMeetingDetailsDto
    {
        [Required]
        public int InterviewRoundId { get; set; }

        public string Provider { get; set; } = "Google Meet";
        public string MeetingProvider { get; set; } = "Google Meet";

        public string? MeetingUrl { get; set; }
        public string? CustomMeetingUrl { get; set; }

        public DateTime ScheduledStartTime { get; set; } = DateTime.UtcNow;
        public int DurationMinutes { get; set; } = 45;
        public string TimeZone { get; set; } = "UTC";
    }

    public class SendInvitationDto
    {
        [Required]
        public int InterviewId { get; set; }
    }

    /// <summary>Request body for POST /api/interviews/send-invitation.</summary>
    public class SendInvitationRequestDto
    {
        [Required]
        [EmailAddress]
        public string CandidateEmail { get; set; } = string.Empty;

        [Required]
        public string CandidateName { get; set; } = string.Empty;

        [Required]
        public string JobTitle { get; set; } = string.Empty;

        public string CompanyName { get; set; } = "Oppora Recruitment Hub";

        [Required]
        public DateTime InterviewDate { get; set; }

        [Required]
        public DateTime StartTime { get; set; }

        public DateTime EndTime { get; set; }

        public string TimeZone { get; set; } = "UTC";

        public string RoundTitle { get; set; } = "Technical Round";

        public string GoogleMeetUrl { get; set; } = string.Empty;

        public string RecruiterName { get; set; } = "Recruiter";

        public string Instructions { get; set; } = string.Empty;
    }

    /// <summary>Result returned by email send operations.</summary>
    public class EmailSendResult
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public string? ErrorDetail { get; set; }
        public string? ErrorMessage { get => ErrorDetail; set => ErrorDetail = value; }
        public string? StackTrace { get; set; }
        public string? SmtpHost { get; set; }
        public int SmtpPort { get; set; }
        public string? SenderEmail { get; set; }
        public string? RecipientEmail { get; set; }

        public static EmailSendResult Ok(string message = "Email sent successfully.") =>
            new() { Success = true, Message = message };

        public static EmailSendResult Fail(string message, string? detail = null, string? stackTrace = null) =>
            new() { Success = false, Message = message, ErrorDetail = detail, StackTrace = stackTrace };
    }
}
