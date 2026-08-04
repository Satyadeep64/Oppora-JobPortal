using Microsoft.AspNetCore.Mvc;
using Oppora.API.Interfaces;
using Oppora.API.Models;

namespace Oppora.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class InterviewerController : ControllerBase
    {
        private readonly IInterviewerRepository _interviewerRepository;

        public InterviewerController(IInterviewerRepository interviewerRepository)
        {
            _interviewerRepository = interviewerRepository;
        }

        [HttpGet]
        public async Task<IActionResult> GetInterviewers([FromQuery] string? department)
        {
            var interviewers = await _interviewerRepository.GetActiveInterviewersAsync(department);
            return Ok(interviewers);
        }

        [HttpPost]
        public async Task<IActionResult> CreateInterviewer([FromBody] Interviewer interviewer)
        {
            if (string.IsNullOrWhiteSpace(interviewer.FullName) || string.IsNullOrWhiteSpace(interviewer.Email))
            {
                return BadRequest(new { message = "Full name and email are required." });
            }

            interviewer.IsActive = true;
            interviewer.CreatedAt = DateTime.UtcNow;
            await _interviewerRepository.AddAsync(interviewer);
            await _interviewerRepository.SaveChangesAsync();

            return CreatedAtAction(nameof(GetInterviewers), new { id = interviewer.Id }, interviewer);
        }
    }
}
