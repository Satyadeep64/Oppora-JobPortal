using System.ComponentModel.DataAnnotations;

namespace Oppora.API.Models
{
    public class Organization
    {
        public int Id { get; set; }

        [Required]
        [MaxLength(200)]
        public string Name { get; set; } = string.Empty;

        [MaxLength(500)]
        public string? LogoUrl { get; set; }

        [MaxLength(500)]
        public string? WebsiteUrl { get; set; }

        [MaxLength(200)]
        public string? ContactEmail { get; set; }

        public bool IsVerified { get; set; } = true;

        public ICollection<Competition> Competitions { get; set; } = new List<Competition>();
    }
}
