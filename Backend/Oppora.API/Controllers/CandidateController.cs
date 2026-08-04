using Microsoft.AspNetCore.Mvc;
using Oppora.API.Interfaces;
using Oppora.API.Models;

namespace Oppora.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CandidateController : ControllerBase
    {
        private readonly ICandidateRepository _candidateRepository;

        public CandidateController(ICandidateRepository candidateRepository)
        {
            _candidateRepository = candidateRepository;
        }

        [HttpGet]
        public async Task<IActionResult> GetCandidates([FromQuery] string? query)
        {
            var candidates = await _candidateRepository.SearchCandidatesAsync(query ?? string.Empty);
            return Ok(candidates);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetCandidateById(int id)
        {
            var candidate = await _candidateRepository.GetByIdAsync(id);
            if (candidate == null) return NotFound(new { message = "Candidate not found." });
            return Ok(candidate);
        }

        [HttpPost]
        public async Task<IActionResult> CreateCandidate([FromBody] Candidate candidate)
        {
            if (string.IsNullOrWhiteSpace(candidate.FullName) || string.IsNullOrWhiteSpace(candidate.Email))
            {
                return BadRequest(new { message = "Full name and email are required." });
            }

            var existing = await _candidateRepository.GetByEmailAsync(candidate.Email);
            if (existing != null)
            {
                return Ok(existing);
            }

            candidate.CreatedAt = DateTime.UtcNow;
            candidate.UpdatedAt = DateTime.UtcNow;
            await _candidateRepository.AddAsync(candidate);
            await _candidateRepository.SaveChangesAsync();

            return CreatedAtAction(nameof(GetCandidateById), new { id = candidate.Id }, candidate);
        }
    }
}
