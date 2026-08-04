using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Oppora.API.Models
{
    public class Interviewer
    {
        [Key]
        public int Id { get; set; }

        public int? UserId { get; set; }

        [ForeignKey(nameof(UserId))]
        public User? User { get; set; }

        [Required]
        [MaxLength(150)]
        public string FullName { get; set; } = string.Empty;

        [Required]
        [MaxLength(150)]
        public string Email { get; set; } = string.Empty;

        [MaxLength(100)]
        public string Department { get; set; } = "Engineering";

        [MaxLength(100)]
        public string Designation { get; set; } = "Senior Engineer";

        public int MaxInterviewsPerDay { get; set; } = 3;

        public bool IsActive { get; set; } = true;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public ICollection<InterviewPanel> PanelMemberships { get; set; } = new List<InterviewPanel>();
        public ICollection<InterviewFeedback> Feedbacks { get; set; } = new List<InterviewFeedback>();
    }
}
