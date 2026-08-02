using Microsoft.AspNetCore.Http;

namespace Oppora.API.DTOs
{
    public class ResumeAnalysisRequest
    {
        public IFormFile Resume { get; set; } = null!;
    }
}