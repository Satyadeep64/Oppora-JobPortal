using Microsoft.AspNetCore.Mvc;
using Oppora.API.Services.Import;
using Oppora.API.Services.Import.Models;

namespace Oppora.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ImportController : ControllerBase
    {
        private readonly CompetitionIngestionService _ingestionService;

        public ImportController(CompetitionIngestionService ingestionService)
        {
            _ingestionService = ingestionService;
        }

        // POST: api/import/csv
        [HttpPost("csv")]
        public async Task<ActionResult<ImportResultDto>> ImportCsv(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest(new { message = "Please upload a valid CSV file." });

            using var stream = file.OpenReadStream();
            var result = await _ingestionService.IngestAsync(ImportSourceType.Csv, stream);
            return Ok(result);
        }

        // POST: api/import/rss
        [HttpPost("rss")]
        public async Task<ActionResult<ImportResultDto>> ImportRss([FromQuery] string feedUrl)
        {
            if (string.IsNullOrWhiteSpace(feedUrl))
                return BadRequest(new { message = "Please provide a valid RSS feed URL." });

            using var httpClient = new HttpClient();
            using var stream = await httpClient.GetStreamAsync(feedUrl);
            var result = await _ingestionService.IngestAsync(ImportSourceType.Rss, stream);
            return Ok(result);
        }

        // POST: api/import/api
        [HttpPost("api")]
        public async Task<ActionResult<ImportResultDto>> ImportFromApi(IFormFile jsonFile)
        {
            if (jsonFile == null || jsonFile.Length == 0)
                return BadRequest(new { message = "Please upload a valid JSON payload file." });

            using var stream = jsonFile.OpenReadStream();
            var result = await _ingestionService.IngestAsync(ImportSourceType.Api, stream);
            return Ok(result);
        }
    }
}
