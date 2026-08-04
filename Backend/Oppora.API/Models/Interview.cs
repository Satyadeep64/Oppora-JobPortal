using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Oppora.API.Models
{
    public class Interview
    {
        [Key]
        public int Id { get; set; }

        public int? ApplicationId { get; set; }

        [ForeignKey(nameof(ApplicationId))]
        public Application? Application { get; set; }

        public int RecruiterId { get; set; }

        [ForeignKey(nameof(RecruiterId))]
        public User? Recruiter { get; set; }

        public int? CandidateId { get; set; }

        [ForeignKey(nameof(CandidateId))]
        public User? Candidate { get; set; }

        public int? CandidateEntityId { get; set; }

        [ForeignKey(nameof(CandidateEntityId))]
        public Candidate? CandidateEntity { get; set; }

        public int? OpportunityId { get; set; }

        [ForeignKey(nameof(OpportunityId))]
        public Opportunity? Opportunity { get; set; }

        [Required]
        [MaxLength(150)]
        public string CandidateName { get; set; } = string.Empty;

        [MaxLength(150)]
        public string CandidateEmail { get; set; } = string.Empty;

        [MaxLength(50)]
        public string CandidatePhone { get; set; } = string.Empty;

        [Required]
        [MaxLength(150)]
        public string JobRole { get; set; } = string.Empty;

        [MaxLength(150)]
        public string Department { get; set; } = "Engineering";

        [Required]
        [MaxLength(150)]
        public string Interviewer { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string InterviewRound { get; set; } = "Technical Round 1";

        public DateTime InterviewDate { get; set; } = DateTime.UtcNow.Date;

        [Required]
        [MaxLength(50)]
        public string InterviewTime { get; set; } = "10:00 AM";

        public int Duration { get; set; } = 45;

        [MaxLength(500)]
        public string GoogleMeetLink { get; set; } = string.Empty;

        [MaxLength(2000)]
        public string Notes { get; set; } = string.Empty;

        [Required]
        [MaxLength(50)]
        public string Status { get; set; } = "Scheduled"; // Scheduled, Completed, Cancelled, In Progress

        // Aliases for backwards compatibility
        [NotMapped]
        public string CustomCandidateName { get => CandidateName; set => CandidateName = value; }

        [NotMapped]
        public string CustomCandidateEmail { get => CandidateEmail; set => CandidateEmail = value; }

        [NotMapped]
        public string CustomJobTitle { get => JobRole; set => JobRole = value; }

        [NotMapped]
        public string RecruiterNotes { get => Notes; set => Notes = value; }

        [NotMapped]
        public string OverallStatus { get => Status; set => Status = value; }

        [NotMapped]
        public string InterviewStatus { get => Status; set => Status = value; }

        [MaxLength(50)]
        public string InvitationStatus { get; set; } = "Pending";

        [MaxLength(150)]
        public string CreatedBy { get; set; } = "Recruiter";

        [MaxLength(50)]
        public string? OverallResult { get; set; }

        [MaxLength(200)]
        public string Location { get; set; } = "Online / Google Meet";

        [MaxLength(50)]
        public string InterviewType { get; set; } = "Technical";

        public InterviewEmail? InterviewEmail { get; set; }
        public ICollection<InterviewRound> Rounds { get; set; } = new List<InterviewRound>();
        public ICollection<InterviewNotification> Notifications { get; set; } = new List<InterviewNotification>();
        public ICollection<Notification> SystemNotifications { get; set; } = new List<Notification>();
        public ICollection<InterviewAudit> Audits { get; set; } = new List<InterviewAudit>();
        public ICollection<InterviewAttachment> Attachments { get; set; } = new List<InterviewAttachment>();

        [NotMapped]
        public DateTime CreatedOn { get => CreatedAt; set => CreatedAt = value; }

        [NotMapped]
        public DateTime UpdatedOn { get => UpdatedAt; set => UpdatedAt = value; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
