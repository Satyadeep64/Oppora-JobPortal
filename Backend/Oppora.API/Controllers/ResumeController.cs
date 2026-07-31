using System.Text.Json;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Oppora.API.Data;
using Oppora.API.DTOs;
using Oppora.API.Models;

namespace Oppora.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ResumeController : ControllerBase
    {
        private readonly AppDbContext _context;
        private static readonly JsonSerializerOptions JsonOptions = new()
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        };

        public ResumeController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("{userId}")]
        public async Task<IActionResult> GetResume(int userId)
        {
            var resume = await _context.Resumes
                .FirstOrDefaultAsync(r => r.UserId == userId);

            if (resume == null)
            {
                var user = await _context.Users.FindAsync(userId);
                if (user == null) return NotFound(new { message = "User not found" });

                return Ok(new ResumeDto
                {
                    UserId = userId,
                    FullName = user.FullName,
                    Email = user.Email,
                    Skills = user.Skills ?? string.Empty,
                    Experience = new List<ExperienceItemDto>
                    {
                        new()
                        {
                            JobTitle = "",
                            Company = "",
                            StartDate = "",
                            EndDate = "",
                            Description = ""
                        }
                    },
                    Education = new List<EducationItemDto>
                    {
                        new()
                        {
                            Degree = "",
                            Institution = "",
                            StartDate = "",
                            EndDate = "",
                            Grade = ""
                        }
                    },
                    Projects = new List<ProjectItemDto>
                    {
                        new()
                        {
                            Name = "",
                            Technologies = "",
                            Description = "",
                            Link = ""
                        }
                    },
                    Certifications = new List<CertificationItemDto>
                    {
                        new()
                        {
                            Name = "",
                            Issuer = "",
                            Date = ""
                        }
                    }
                });
            }

            return Ok(MapToDto(resume));
        }

        [HttpPost]
        public async Task<IActionResult> SaveResume([FromBody] ResumeDto dto)
        {
            var user = await _context.Users.FindAsync(dto.UserId);
            if (user == null) return NotFound(new { message = "User not found" });

            var resume = await _context.Resumes
                .FirstOrDefaultAsync(r => r.UserId == dto.UserId);

            if (resume == null)
            {
                resume = new Resume { UserId = dto.UserId };
                _context.Resumes.Add(resume);
            }

            MapFromDto(resume, dto);
            resume.UpdatedAt = DateTime.UtcNow;

            user.FullName = dto.FullName;
            user.Email = dto.Email;
            user.Skills = dto.Skills;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Resume saved successfully",
                resume = MapToDto(resume)
            });
        }

        private static ResumeDto MapToDto(Resume resume)
        {
            return new ResumeDto
            {
                Id = resume.Id,
                UserId = resume.UserId,
                FullName = resume.FullName,
                Email = resume.Email,
                Phone = resume.Phone,
                Location = resume.Location,
                LinkedIn = resume.LinkedIn,
                Portfolio = resume.Portfolio,
                Summary = resume.Summary,
                Skills = resume.Skills,
                Experience = Deserialize<List<ExperienceItemDto>>(resume.ExperienceJson),
                Education = Deserialize<List<EducationItemDto>>(resume.EducationJson),
                Projects = Deserialize<List<ProjectItemDto>>(resume.ProjectsJson),
                Certifications = Deserialize<List<CertificationItemDto>>(resume.CertificationsJson),
                TemplateStyle = resume.TemplateStyle
            };
        }

        private static void MapFromDto(Resume resume, ResumeDto dto)
        {
            resume.FullName = dto.FullName;
            resume.Email = dto.Email;
            resume.Phone = dto.Phone;
            resume.Location = dto.Location;
            resume.LinkedIn = dto.LinkedIn;
            resume.Portfolio = dto.Portfolio;
            resume.Summary = dto.Summary;
            resume.Skills = dto.Skills;
            resume.ExperienceJson = JsonSerializer.Serialize(dto.Experience, JsonOptions);
            resume.EducationJson = JsonSerializer.Serialize(dto.Education, JsonOptions);
            resume.ProjectsJson = JsonSerializer.Serialize(dto.Projects, JsonOptions);
            resume.CertificationsJson = JsonSerializer.Serialize(dto.Certifications, JsonOptions);
            resume.TemplateStyle = dto.TemplateStyle;
        }

        private static T Deserialize<T>(string json) where T : new()
        {
            try
            {
                return JsonSerializer.Deserialize<T>(json, JsonOptions) ?? new T();
            }
            catch
            {
                return new T();
            }
        }
    }
}
