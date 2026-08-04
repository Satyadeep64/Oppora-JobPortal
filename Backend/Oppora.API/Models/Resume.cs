<<<<<<< HEAD
=======
﻿using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

>>>>>>> 9418946 (Resume feature completed (upload, history, preview))
namespace Oppora.API.Models
{
    public class Resume
    {
<<<<<<< HEAD
        public int Id { get; set; }
        public int UserId { get; set; }
        public User User { get; set; } = null!;

        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string Location { get; set; } = string.Empty;
        public string LinkedIn { get; set; } = string.Empty;
        public string Portfolio { get; set; } = string.Empty;
        public string Summary { get; set; } = string.Empty;
        public string Skills { get; set; } = string.Empty;
        public string ExperienceJson { get; set; } = "[]";
        public string EducationJson { get; set; } = "[]";
        public string ProjectsJson { get; set; } = "[]";
        public string CertificationsJson { get; set; } = "[]";
        public string TemplateStyle { get; set; } = "professional";
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
=======
        [Key]
        public int Id { get; set; }

        public int? UserId { get; set; }

        [Required]
        [MaxLength(255)]
        public string FileName { get; set; } = string.Empty;

        [Required]
        [MaxLength(500)]
        public string FilePath { get; set; } = string.Empty;

        [MaxLength(20)]
        public string FileType { get; set; } = string.Empty;

        public DateTime UploadedAt { get; set; } = DateTime.UtcNow;

        public int? ATSScore { get; set; }

        [MaxLength(50)]
        public string Status { get; set; } = "Uploaded";

        public string? ExtractedText { get; set; }

        [ForeignKey(nameof(UserId))]
        public User? User { get; set; }
    }
}
>>>>>>> 9418946 (Resume feature completed (upload, history, preview))
