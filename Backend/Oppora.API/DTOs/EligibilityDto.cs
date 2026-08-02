namespace Oppora.API.DTOs
{
    public class EligibilityDto
    {
        public string? DegreeRequirement { get; set; }
        public string? BatchRequirement { get; set; }
        public string? DomainSpecialization { get; set; }
        public int? MinAge { get; set; }
        public int? MaxAge { get; set; }
    }
}
