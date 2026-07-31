namespace Oppora.API.DTOs
{
    public class CompetitionSearchQueryDto
    {
        public string? SearchTerm { get; set; }
        public string? Title { get; set; }
        public string? Organization { get; set; }
        public string? Category { get; set; }
        public string? Mode { get; set; }
        public string? Location { get; set; }
        
        // Prize filters
        public decimal? MinPrizeAmount { get; set; }
        public decimal? MaxPrizeAmount { get; set; }

        // Deadline filters
        public DateTime? DeadlineFrom { get; set; }
        public DateTime? DeadlineTo { get; set; }
        public bool? ActiveOnly { get; set; }

        // Team Size filters
        public string? TeamSize { get; set; }
        public int? MinTeamSize { get; set; }
        public int? MaxTeamSize { get; set; }

        // Eligibility filters
        public string? Degree { get; set; }
        public string? Batch { get; set; }
        public string? Domain { get; set; }

        // Payment filters
        public bool? IsFree { get; set; }
        public string? Payment { get; set; }

        public bool? IsFeatured { get; set; }

        // Sorting & Pagination
        public string SortBy { get; set; } = "popularity"; // newest, deadline, popularity, prize, title
        public string SortOrder { get; set; } = "desc"; // asc, desc

        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 10;
    }
}

