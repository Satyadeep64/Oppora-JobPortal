using System.ComponentModel.DataAnnotations;

namespace Oppora.API.Models
{
    public class Category
    {
        public int Id { get; set; }

        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        [MaxLength(100)]
        public string? Slug { get; set; }

        public ICollection<Competition> Competitions { get; set; } = new List<Competition>();
    }
}
