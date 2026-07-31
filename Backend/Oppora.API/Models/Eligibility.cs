using System.ComponentModel.DataAnnotations;

namespace Oppora.API.Models
{
    public class Eligibility
    {
        public int Id { get; set; }

        public int CompetitionId { get; set; }

        [MaxLength(300)]
        public string? DegreeRequirement { get; set; }

        [MaxLength(200)]
        public string? BatchRequirement { get; set; }

        [MaxLength(200)]
        public string? DomainSpecialization { get; set; }

        public int? MinAge { get; set; }

        public int? MaxAge { get; set; }

        public Competition? Competition { get; set; }
    }
}
