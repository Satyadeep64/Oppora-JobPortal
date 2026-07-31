namespace Oppora.API.DTOs
{
    public class ExperienceItemDto
    {
        public string JobTitle { get; set; } = string.Empty;
        public string Company { get; set; } = string.Empty;
        public string StartDate { get; set; } = string.Empty;
        public string EndDate { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
    }

    public class EducationItemDto
    {
        public string Degree { get; set; } = string.Empty;
        public string Institution { get; set; } = string.Empty;
        public string StartDate { get; set; } = string.Empty;
        public string EndDate { get; set; } = string.Empty;
        public string Grade { get; set; } = string.Empty;
    }

    public class ProjectItemDto
    {
        public string Name { get; set; } = string.Empty;
        public string Technologies { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Link { get; set; } = string.Empty;
    }

    public class CertificationItemDto
    {
        public string Name { get; set; } = string.Empty;
        public string Issuer { get; set; } = string.Empty;
        public string Date { get; set; } = string.Empty;
    }

    public class ResumeDto
    {
        public int? Id { get; set; }
        public int UserId { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string Location { get; set; } = string.Empty;
        public string LinkedIn { get; set; } = string.Empty;
        public string Portfolio { get; set; } = string.Empty;
        public string Summary { get; set; } = string.Empty;
        public string Skills { get; set; } = string.Empty;
        public List<ExperienceItemDto> Experience { get; set; } = new();
        public List<EducationItemDto> Education { get; set; } = new();
        public List<ProjectItemDto> Projects { get; set; } = new();
        public List<CertificationItemDto> Certifications { get; set; } = new();
        public string TemplateStyle { get; set; } = "professional";
    }
}
