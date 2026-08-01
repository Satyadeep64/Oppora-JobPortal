using System.ComponentModel.DataAnnotations;

namespace Oppora.API.Models
{
    public class Opportunity
    {
        [Key]
        public int Id { get; set; }


        public string Title { get; set; } = "";


        public string CompanyName { get; set; } = "";


        // Job / Internship
        public string Type { get; set; } = "";


        public string Location { get; set; } = "";


        public string EmploymentType { get; set; } = "";


        public string Experience { get; set; } = "";


        public string Skills { get; set; } = "";


        public string Description { get; set; } = "";


        public string Salary { get; set; } = "";


        public int Openings { get; set; }

        public int RecruiterId { get; set; }

        public User? Recruiter { get; set; }

        public DateTime Deadline { get; set; }

        public string? CompanyLogo { get; set; }

        public DateTime CreatedAt { get; set; }
            = DateTime.UtcNow;


        // Later we will connect with Recruiter table

        public ICollection<Application> Applications { get; set; }
            = new List<Application>();
    }
}