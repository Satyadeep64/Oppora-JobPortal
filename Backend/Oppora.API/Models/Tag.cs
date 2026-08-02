using System.ComponentModel.DataAnnotations;

namespace Oppora.API.Models
{
    public class Tag
    {
        public int Id { get; set; }

        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        public ICollection<CompetitionTag> CompetitionTags { get; set; } = new List<CompetitionTag>();
    }
}
