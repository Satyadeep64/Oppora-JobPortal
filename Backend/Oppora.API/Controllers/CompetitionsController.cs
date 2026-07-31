using Microsoft.AspNetCore.Mvc;
using Oppora.API.DTOs;
using Oppora.API.Models;
using Oppora.API.Services;

namespace Oppora.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Produces("application/json")]
    public class CompetitionsController : ControllerBase
    {
        private readonly ICompetitionService _competitionService;
        private readonly IWebHostEnvironment _environment;

        public CompetitionsController(ICompetitionService competitionService, IWebHostEnvironment environment)
        {
            _competitionService = competitionService;
            _environment = environment;
        }

        /// <summary>
        /// GET: api/competitions — Fetch default paged competition feed.
        /// </summary>
        [HttpGet]
        [ProducesResponseType(typeof(IEnumerable<CompetitionListDto>), StatusCodes.Status200OK)]
        public async Task<ActionResult<IEnumerable<CompetitionListDto>>> GetCompetitions()
        {
            var paged = await _competitionService.GetCompetitionsPagedAsync(new CompetitionSearchQueryDto { PageNumber = 1, PageSize = 50 });
            return Ok(paged.Items);
        }

        /// <summary>
        /// GET: api/competitions/categories — Fetch available categories list.
        /// </summary>
        [HttpGet("categories")]
        [ProducesResponseType(typeof(IEnumerable<Category>), StatusCodes.Status200OK)]
        public async Task<ActionResult<IEnumerable<Category>>> GetCategories()
        {
            var categories = await _competitionService.GetCategoriesAsync();
            return Ok(categories);
        }

        /// <summary>
        /// GET: api/competitions/featured — Fetch sticky featured competitions.
        /// </summary>
        [HttpGet("featured")]
        [ProducesResponseType(typeof(IEnumerable<CompetitionListDto>), StatusCodes.Status200OK)]
        public async Task<ActionResult<IEnumerable<CompetitionListDto>>> GetFeatured()
        {
            var featured = await _competitionService.GetFeaturedCompetitionsAsync();
            return Ok(featured);
        }

        /// <summary>
        /// GET: api/competitions/{id} — Fetch single competition detail by ID.
        /// </summary>
        [HttpGet("{id:int}")]
        [ProducesResponseType(typeof(CompetitionDetailDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<CompetitionDetailDto>> GetCompetitionById(int id)
        {
            var dto = await _competitionService.GetCompetitionByIdAsync(id);
            if (dto == null)
            {
                return NotFound(new { message = $"Competition with ID #{id} was not found." });
            }

            return Ok(dto);
        }

        /// <summary>
        /// GET: api/competitions/advanced-search — Filter and search paginated competition feed.
        /// </summary>
        [HttpGet("advanced-search")]
        [ProducesResponseType(typeof(PagedResult<CompetitionListDto>), StatusCodes.Status200OK)]
        public async Task<ActionResult<PagedResult<CompetitionListDto>>> AdvancedSearch([FromQuery] CompetitionSearchQueryDto queryDto)
        {
            var result = await _competitionService.GetCompetitionsPagedAsync(queryDto);
            return Ok(result);
        }

        /// <summary>
        /// POST: api/competitions — Create a new competition (Admin).
        /// </summary>
        [HttpPost]
        [ProducesResponseType(typeof(CompetitionDetailDto), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<CompetitionDetailDto>> CreateCompetition([FromBody] CreateCompetitionDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var created = await _competitionService.CreateCompetitionAsync(dto);
            return CreatedAtAction(nameof(GetCompetitionById), new { id = created.Id }, created);
        }

        /// <summary>
        /// DELETE: api/competitions/{id} — Delete a competition by ID (Admin).
        /// </summary>
        [HttpDelete("{id:int}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> DeleteCompetition(int id)
        {
            var success = await _competitionService.DeleteCompetitionAsync(id);
            if (!success)
            {
                return NotFound(new { message = $"Competition with ID #{id} was not found." });
            }

            return NoContent();
        }

        /// <summary>
        /// POST: api/competitions/upload — Upload competition logo or banner image.
        /// </summary>
        [HttpPost("upload")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<object>> UploadFile(IFormFile file)
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest(new { message = "No file provided for upload." });
            }

            var allowedExtensions = new[] { ".png", ".jpg", ".jpeg", ".webp", ".svg" };
            var extension = Path.GetExtension(file.FileName).ToLowerInvariant();

            if (!allowedExtensions.Contains(extension))
            {
                return BadRequest(new { message = "Invalid image extension. Only PNG, JPG, JPEG, WEBP, and SVG files are allowed." });
            }

            string uploadsFolder = Path.Combine(_environment.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot"), "uploads");
            if (!Directory.Exists(uploadsFolder))
            {
                Directory.CreateDirectory(uploadsFolder);
            }

            string uniqueFileName = $"{Guid.NewGuid()}_{Path.GetFileName(file.FileName)}";
            string filePath = Path.Combine(uploadsFolder, uniqueFileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            string relativeUrl = $"/uploads/{uniqueFileName}";
            return Ok(new { url = relativeUrl, fileName = uniqueFileName });
        }
    }
}
