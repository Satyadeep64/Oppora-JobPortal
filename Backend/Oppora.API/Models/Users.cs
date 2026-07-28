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
        public ICollection<Application> Applications { get; set; }
    }
}