using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace Oppora.API.Models
{
    public class Application
    {
        [Key]
        public int Id { get; set; }

        public int UserId { get; set; }

        [JsonIgnore]
        public User? User { get; set; }

        public int OpportunityId { get; set; }

        [JsonIgnore]
        public Opportunity? Opportunity { get; set; }

        public string Status { get; set; } = "Applied";

        public DateTime AppliedAt { get; set; } = DateTime.UtcNow;
    }
}