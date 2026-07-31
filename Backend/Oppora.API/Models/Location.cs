using System.ComponentModel.DataAnnotations;

namespace Oppora.API.Models
{
    public class Location
    {
        public int Id { get; set; }

        [Required]
        [MaxLength(200)]
        public string Name { get; set; } = string.Empty;

        public bool IsOnline { get; set; } = false;

        public ICollection<Competition> Competitions { get; set; } = new List<Competition>();
    }
}
