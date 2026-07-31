namespace Oppora.API.Models
{
    public class Resume
    {
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
