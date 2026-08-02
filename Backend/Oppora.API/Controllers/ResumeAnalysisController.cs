using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Oppora.API.Data;
using Oppora.API.DTOs;
using Oppora.API.Models;
using Oppora.API.Services;
using System.Linq;
using System.Text.Json;
using Microsoft.AspNetCore.Hosting;
using System.IO;

namespace Oppora.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [AllowAnonymous]
    public class ResumeAnalysisController : ControllerBase
    {
        private readonly ResumeTextExtractor _textExtractor;
        private readonly ATSAnalysisService _atsService;
        private readonly AppDbContext _context;
        private readonly IWebHostEnvironment _environment;

        public ResumeAnalysisController(
     ResumeTextExtractor textExtractor,
     ATSAnalysisService atsService,
     AppDbContext context,
     IWebHostEnvironment environment)
        {
            _textExtractor = textExtractor;
            _atsService = atsService;
            _context = context;
            _environment = environment;
        }

        [HttpPost("analyze")]
        public async Task<IActionResult> AnalyzeResume([FromForm] ResumeAnalysisRequest request)
        {
            try
            {
                if (request.Resume == null)
                    return BadRequest("Resume file is required.");
                // Save uploaded resume
                var uploadsFolder = Path.Combine(_environment.WebRootPath, "resumes");

                if (!Directory.Exists(uploadsFolder))
                {
                    Directory.CreateDirectory(uploadsFolder);
                }

                var uniqueFileName =
                    $"{Guid.NewGuid()}{Path.GetExtension(request.Resume.FileName)}";

                var filePath = Path.Combine(uploadsFolder, uniqueFileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await request.Resume.CopyToAsync(stream);
                }

                var fileUrl = $"/resumes/{uniqueFileName}";

                // Step 1: Extract text
                var resumeText = await _textExtractor.ExtractTextAsync(request.Resume);

                if (string.IsNullOrWhiteSpace(resumeText))
                    return BadRequest("Could not extract text from resume.");

                // Step 2: Send to AI
                var result = await _atsService.AnalyzeResumeAsync(resumeText);

                var history = new ResumeAnalysisHistory
                {
                    UserId = 1, // Temporary. We'll replace this with the logged-in user's ID later.

                    FileName = request.Resume.FileName,

                    FileUrl = fileUrl,

                    UploadedAt = DateTime.UtcNow,

                    ATSScore = result.ATSScore,

                    Status = result.ATSScore >= 85
                                ? "Excellent"
                                : result.ATSScore >= 70
                                    ? "Good"
                                    : "Needs Improvement",

                    OverallFeedback = result.OverallFeedback,
                    Strengths = System.Text.Json.JsonSerializer.Serialize(result.Strengths),

                    MissingSkills = System.Text.Json.JsonSerializer.Serialize(result.MissingSkills),

                    Suggestions = System.Text.Json.JsonSerializer.Serialize(result.Suggestions),
                };

                _context.ResumeAnalysisHistories.Add(history);

                await _context.SaveChangesAsync();

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }
        [HttpGet("history/{userId}")]
        /* public async Task<IActionResult> GetHistory(int userId)
         {
             var history = await _context.ResumeAnalysisHistories
                 .Where(x => x.UserId == userId)
                 .OrderByDescending(x => x.UploadedAt)
                 .Take(3)
                 .Select(x => new
                 {
                     x.Id,
                     x.FileName,
                     x.UploadedAt,
                     x.ATSScore,
                     x.Status
                 })
                 .ToListAsync();

             return Ok(history);
         }*/
        public async Task<IActionResult> GetHistory(int userId, bool all = false)
        {
            IQueryable<ResumeAnalysisHistory> query = _context.ResumeAnalysisHistories
                .Where(x => x.UserId == userId)
                .OrderByDescending(x => x.UploadedAt);

            if (!all)
            {
                query = query.Take(3);
            }

            var history = await query
                .Select(x => new
                {
                    x.Id,
                    x.FileName,
                    x.FileUrl,
                    x.UploadedAt,
                    x.ATSScore,
                    x.Status
                })
                .ToListAsync();

            return Ok(history);
        }
        [HttpGet("report/{id}")]
        public async Task<IActionResult> GetReport(int id)
        {
            var history = await _context.ResumeAnalysisHistories
                .FirstOrDefaultAsync(x => x.Id == id);

            if (history == null)
                return NotFound();

            return Ok(new
            {
                score = history.ATSScore,

                feedback = history.OverallFeedback,

                skills = string.IsNullOrWhiteSpace(history.Strengths)
         ? new List<string>()
         : JsonSerializer.Deserialize<List<string>>(history.Strengths),

                missing = string.IsNullOrWhiteSpace(history.MissingSkills)
         ? new List<string>()
         : JsonSerializer.Deserialize<List<string>>(history.MissingSkills),

                suggestions = string.IsNullOrWhiteSpace(history.Suggestions)
         ? new List<string>()
         : JsonSerializer.Deserialize<List<string>>(history.Suggestions)
            });
        }
    }
}