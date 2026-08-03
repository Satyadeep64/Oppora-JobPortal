namespace Oppora.API.Models
{
    public class User
    {
        public int Id { get; set; }

        public string FullName { get; set; } = string.Empty;

        public string Email { get; set; } = string.Empty;

        public string? Password { get; set; }

        public string PasswordHash { get; set; } = string.Empty;

        public string Role { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; }

        public bool IsActive { get; set; }

        // Profile fields
        public string? ProfileImage { get; set; }
        public string? Resume { get; set; }
        public string? Skills { get; set; }

        public string? Phone { get; set; }
        public string? Location { get; set; }
        public string? Bio { get; set; }
        public string? Title { get; set; }
        public string? LinkedIn { get; set; }
        public string? GitHub { get; set; }
        public string? Education { get; set; }
        public ICollection<Application> Applications { get; set; } = new List<Application>();
        public ICollection<Resume> Resumes { get; set; } = new List<Resume>();
    }
}