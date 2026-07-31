namespace Oppora.API.Services.Import.Models
{
    public class ImportResultDto
    {
        public int TotalProcessed { get; set; }
        public int TotalImported { get; set; }
        public int TotalSkippedDuplicates { get; set; }
        public List<string> Errors { get; set; } = new();
    }
}
