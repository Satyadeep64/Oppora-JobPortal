using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Oppora.API.Data;
using Oppora.API.DTOs;
using Oppora.API.Models;

namespace Oppora.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CompetitionsController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IWebHostEnvironment _environment;

        public CompetitionsController(AppDbContext context, IWebHostEnvironment environment)
        {
            _context = context;
            _environment = environment;
        }

        // GET: api/competitions
        [HttpGet]
        public async Task<ActionResult<IEnumerable<CompetitionDetailDto>>> GetCompetitions()
        {
            var competitions = await _context.Competitions
                .Include(c => c.Organization)
                .Include(c => c.Category)
                .Include(c => c.Location)
                .Include(c => c.Eligibility)
                .Include(c => c.TimelineRounds)
                .Include(c => c.Prizes)
                .Include(c => c.Rules)
                .Include(c => c.CompetitionTags).ThenInclude(ct => ct.Tag)
                .OrderByDescending(c => c.CreatedAt)
                .AsNoTracking()
                .ToListAsync();

            return Ok(competitions.Select(MapToDetailDto));
        }

        // GET: api/competitions/{id}
        [HttpGet("{id:int}")]
        public async Task<ActionResult<CompetitionDetailDto>> GetCompetitionById(int id)
        {
            var competition = await _context.Competitions
                .Include(c => c.Organization)
                .Include(c => c.Category)
                .Include(c => c.Location)
                .Include(c => c.Eligibility)
                .Include(c => c.TimelineRounds)
                .Include(c => c.Prizes)
                .Include(c => c.Rules)
                .Include(c => c.CompetitionTags).ThenInclude(ct => ct.Tag)
                .AsNoTracking()
                .FirstOrDefaultAsync(c => c.Id == id);

            if (competition == null)
            {
                return NotFound(new { message = $"Competition with ID #{id} not found." });
            }

            return Ok(MapToDetailDto(competition));
        }

        // GET: api/competitions/advanced-search
        [HttpGet("advanced-search")]
        public async Task<ActionResult<PagedResult<CompetitionDetailDto>>> AdvancedSearch([FromQuery] CompetitionSearchQueryDto queryDto)
        {
            var query = _context.Competitions
                .Include(c => c.Organization)
                .Include(c => c.Category)
                .Include(c => c.Location)
                .Include(c => c.Eligibility)
                .Include(c => c.TimelineRounds)
                .Include(c => c.Prizes)
                .Include(c => c.Rules)
                .Include(c => c.CompetitionTags).ThenInclude(ct => ct.Tag)
                .AsNoTracking()
                .AsQueryable();

            // 1. General Keyword / Title Search Filter
            if (!string.IsNullOrWhiteSpace(queryDto.SearchTerm))
            {
                var term = queryDto.SearchTerm.Trim().ToLower();
                query = query.Where(c => c.Title.ToLower().Contains(term)
                                      || (c.Organization != null && c.Organization.Name.ToLower().Contains(term))
                                      || (c.Category != null && c.Category.Name.ToLower().Contains(term))
                                      || c.Description.ToLower().Contains(term));
            }

            // 1b. Specific Title Filter
            if (!string.IsNullOrWhiteSpace(queryDto.Title))
            {
                var titleTerm = queryDto.Title.Trim().ToLower();
                query = query.Where(c => c.Title.ToLower().Contains(titleTerm));
            }

            // 2. Organization Filter
            if (!string.IsNullOrWhiteSpace(queryDto.Organization))
            {
                var orgTerm = queryDto.Organization.Trim().ToLower();
                query = query.Where(c => c.Organization != null && c.Organization.Name.ToLower().Contains(orgTerm));
            }

            // 3. Category Filter
            if (!string.IsNullOrWhiteSpace(queryDto.Category) && 
                !string.Equals(queryDto.Category.Trim(), "All", StringComparison.OrdinalIgnoreCase) &&
                !string.Equals(queryDto.Category.Trim(), "Competitions", StringComparison.OrdinalIgnoreCase))
            {
                var categoryTerm = queryDto.Category.Trim().ToLower();
                query = query.Where(c => c.Category != null && (c.Category.Name.ToLower() == categoryTerm || c.Category.Name.ToLower().Contains(categoryTerm)));
            }

            // 4. Location Filter
            if (!string.IsNullOrWhiteSpace(queryDto.Location))
            {
                var locTerm = queryDto.Location.Trim().ToLower();
                query = query.Where(c => c.Location != null && c.Location.Name.ToLower().Contains(locTerm));
            }

            // 5. Mode Filter (Online, Offline, Hybrid)
            if (!string.IsNullOrWhiteSpace(queryDto.Mode) && !string.Equals(queryDto.Mode.Trim(), "All", StringComparison.OrdinalIgnoreCase))
            {
                var modeTerm = queryDto.Mode.Trim().ToLower();
                query = query.Where(c => c.Mode.ToLower().Contains(modeTerm));
            }

            // 6. Prize Filters (Min / Max Prize Amount)
            if (queryDto.MinPrizeAmount.HasValue && queryDto.MinPrizeAmount.Value > 0)
            {
                query = query.Where(c => c.Prizes.Any(p => p.Amount >= queryDto.MinPrizeAmount.Value));
            }
            if (queryDto.MaxPrizeAmount.HasValue && queryDto.MaxPrizeAmount.Value > 0)
            {
                query = query.Where(c => c.Prizes.Any(p => p.Amount <= queryDto.MaxPrizeAmount.Value));
            }

            // 7. Deadline Filters (Date range / Active only)
            if (queryDto.DeadlineFrom.HasValue)
            {
                query = query.Where(c => c.RegistrationDeadline >= queryDto.DeadlineFrom.Value);
            }
            if (queryDto.DeadlineTo.HasValue)
            {
                query = query.Where(c => c.RegistrationDeadline <= queryDto.DeadlineTo.Value);
            }
            if (queryDto.ActiveOnly == true)
            {
                query = query.Where(c => c.RegistrationDeadline >= DateTime.UtcNow);
            }

            // 8. Team Size Filter
            if (!string.IsNullOrWhiteSpace(queryDto.TeamSize) && !string.Equals(queryDto.TeamSize.Trim(), "All", StringComparison.OrdinalIgnoreCase))
            {
                var tsTerm = queryDto.TeamSize.Trim().ToLower();
                if (tsTerm.Contains("1") || tsTerm.Contains("solo") || tsTerm.Contains("individual"))
                {
                    query = query.Where(c => c.MinTeamMembers == 1);
                }
                else if (tsTerm.Contains("2") || tsTerm.Contains("4") || tsTerm.Contains("small"))
                {
                    query = query.Where(c => c.MaxTeamMembers <= 4);
                }
                else
                {
                    query = query.Where(c => c.TeamSize.ToLower().Contains(tsTerm));
                }
            }
            if (queryDto.MinTeamSize.HasValue)
            {
                query = query.Where(c => c.MaxTeamMembers >= queryDto.MinTeamSize.Value);
            }
            if (queryDto.MaxTeamSize.HasValue)
            {
                query = query.Where(c => c.MinTeamMembers <= queryDto.MaxTeamSize.Value);
            }

            // 9. Eligibility Filters (Degree, Batch, Domain)
            if (!string.IsNullOrWhiteSpace(queryDto.Degree))
            {
                var degreeTerm = queryDto.Degree.Trim().ToLower();
                query = query.Where(c => c.Eligibility != null && c.Eligibility.DegreeRequirement != null && c.Eligibility.DegreeRequirement.ToLower().Contains(degreeTerm));
            }
            if (!string.IsNullOrWhiteSpace(queryDto.Batch))
            {
                var batchTerm = queryDto.Batch.Trim().ToLower();
                query = query.Where(c => c.Eligibility != null && c.Eligibility.BatchRequirement != null && c.Eligibility.BatchRequirement.ToLower().Contains(batchTerm));
            }
            if (!string.IsNullOrWhiteSpace(queryDto.Domain))
            {
                var domainTerm = queryDto.Domain.Trim().ToLower();
                query = query.Where(c => c.Eligibility != null && c.Eligibility.DomainSpecialization != null && c.Eligibility.DomainSpecialization.ToLower().Contains(domainTerm));
            }

            // 10. Payment / Registration Fee Filter
            if (queryDto.IsFree.HasValue)
            {
                if (queryDto.IsFree.Value)
                    query = query.Where(c => c.RegistrationFee.ToLower() == "free" || c.RegistrationFee == "0" || c.RegistrationFee == "$0");
                else
                    query = query.Where(c => c.RegistrationFee.ToLower() != "free" && c.RegistrationFee != "0" && c.RegistrationFee != "$0");
            }
            else if (!string.IsNullOrWhiteSpace(queryDto.Payment) && !string.Equals(queryDto.Payment.Trim(), "All", StringComparison.OrdinalIgnoreCase))
            {
                var payTerm = queryDto.Payment.Trim().ToLower();
                if (payTerm == "free")
                    query = query.Where(c => c.RegistrationFee.ToLower() == "free" || c.RegistrationFee == "0" || c.RegistrationFee == "$0");
                else if (payTerm == "paid")
                    query = query.Where(c => c.RegistrationFee.ToLower() != "free" && c.RegistrationFee != "0" && c.RegistrationFee != "$0");
                else
                    query = query.Where(c => c.RegistrationFee.ToLower().Contains(payTerm));
            }

            if (queryDto.IsFeatured.HasValue)
            {
                query = query.Where(c => c.IsFeatured == queryDto.IsFeatured.Value);
            }

            // Dynamic Sorting
            bool isDesc = string.Equals(queryDto.SortOrder, "desc", StringComparison.OrdinalIgnoreCase);
            query = queryDto.SortBy?.ToLower() switch
            {
                "deadline" => isDesc ? query.OrderByDescending(c => c.RegistrationDeadline) : query.OrderBy(c => c.RegistrationDeadline),
                "popularity" => isDesc ? query.OrderByDescending(c => c.RegisteredCount) : query.OrderBy(c => c.RegisteredCount),
                "prize" => isDesc ? query.OrderByDescending(c => c.Prizes.Max(p => (decimal?)p.Amount) ?? 0) : query.OrderBy(c => c.Prizes.Max(p => (decimal?)p.Amount) ?? 0),
                "title" => isDesc ? query.OrderByDescending(c => c.Title) : query.OrderBy(c => c.Title),
                "newest" => isDesc ? query.OrderByDescending(c => c.CreatedAt) : query.OrderBy(c => c.CreatedAt),
                _ => isDesc ? query.OrderByDescending(c => c.RegisteredCount) : query.OrderBy(c => c.RegisteredCount)
            };

            // Server-Side Pagination
            int totalCount = await query.CountAsync();
            int pageNumber = Math.Max(1, queryDto.PageNumber);
            int pageSize = Math.Clamp(queryDto.PageSize, 1, 100);

            var items = await query
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var result = new PagedResult<CompetitionDetailDto>
            {
                Items = items.Select(MapToDetailDto),
                TotalCount = totalCount,
                CurrentPage = pageNumber,
                PageSize = pageSize
            };

            return Ok(result);
        }

        // POST: api/competitions (Admin Create)
        [HttpPost]
        public async Task<ActionResult<CompetitionDetailDto>> CreateCompetition([FromBody] CreateCompetitionDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            // Resolve or create Organization
            var org = await _context.Organizations.FirstOrDefaultAsync(o => o.Name.ToLower() == dto.OrganizationName.ToLower());
            if (org == null)
            {
                org = new Organization
                {
                    Name = dto.OrganizationName,
                    LogoUrl = dto.OrganizationLogoUrl
                };
                _context.Organizations.Add(org);
                await _context.SaveChangesAsync();
            }

            // Resolve or create Category
            var category = await _context.Categories.FirstOrDefaultAsync(c => c.Name.ToLower() == dto.CategoryName.ToLower());
            if (category == null)
            {
                category = new Category
                {
                    Name = dto.CategoryName,
                    Slug = dto.CategoryName.ToLower().Replace(" ", "-")
                };
                _context.Categories.Add(category);
                await _context.SaveChangesAsync();
            }

            // Resolve or create Location
            var location = await _context.Locations.FirstOrDefaultAsync(l => l.Name.ToLower() == dto.LocationName.ToLower());
            if (location == null)
            {
                location = new Location
                {
                    Name = dto.LocationName,
                    IsOnline = dto.LocationName.ToLower().Contains("online")
                };
                _context.Locations.Add(location);
                await _context.SaveChangesAsync();
            }

            // Build Competition entity
            var competition = new Competition
            {
                Title = dto.Title,
                Description = dto.Description,
                OrganizationId = org.Id,
                CategoryId = category.Id,
                LocationId = location.Id,
                Mode = dto.Mode,
                TeamSize = dto.TeamSize,
                MinTeamMembers = dto.MinTeamMembers,
                MaxTeamMembers = dto.MaxTeamMembers,
                RegistrationFee = dto.RegistrationFee,
                RegistrationDeadline = dto.RegistrationDeadline,
                OfficialRegistrationUrl = dto.OfficialRegistrationUrl,
                IsFeatured = dto.IsFeatured,
                CreatedAt = DateTime.UtcNow
            };

            // Eligibility
            if (dto.Eligibility != null)
            {
                competition.Eligibility = new Eligibility
                {
                    DegreeRequirement = dto.Eligibility.DegreeRequirement,
                    BatchRequirement = dto.Eligibility.BatchRequirement,
                    DomainSpecialization = dto.Eligibility.DomainSpecialization,
                    MinAge = dto.Eligibility.MinAge,
                    MaxAge = dto.Eligibility.MaxAge
                };
            }

            // Timeline Rounds
            foreach (var round in dto.TimelineRounds)
            {
                competition.TimelineRounds.Add(new TimelineRound
                {
                    RoundNumber = round.RoundNumber,
                    RoundTitle = round.RoundTitle,
                    Description = round.Description,
                    RoundDate = round.RoundDate
                });
            }

            // Prizes
            foreach (var prize in dto.Prizes)
            {
                competition.Prizes.Add(new Prize
                {
                    Rank = prize.Rank,
                    PositionName = prize.PositionName,
                    RewardDescription = prize.RewardDescription,
                    Amount = prize.Amount
                });
            }

            // Rules
            int ruleOrder = 1;
            foreach (var rule in dto.Rules)
            {
                competition.Rules.Add(new RuleItem
                {
                    RuleText = rule,
                    DisplayOrder = ruleOrder++
                });
            }

            // Tags
            foreach (var tagName in dto.Tags)
            {
                var tag = await _context.Tags.FirstOrDefaultAsync(t => t.Name.ToLower() == tagName.ToLower());
                if (tag == null)
                {
                    tag = new Tag { Name = tagName };
                    _context.Tags.Add(tag);
                    await _context.SaveChangesAsync();
                }
                competition.CompetitionTags.Add(new CompetitionTag { TagId = tag.Id });
            }

            _context.Competitions.Add(competition);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetCompetitionById), new { id = competition.Id }, MapToDetailDto(competition));
        }

        // DELETE: api/competitions/{id} (Admin Delete)
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> DeleteCompetition(int id)
        {
            var competition = await _context.Competitions.FindAsync(id);
            if (competition == null)
                return NotFound(new { message = $"Competition with ID #{id} not found." });

            _context.Competitions.Remove(competition);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // POST: api/competitions/upload (Logo & Banner File Upload)
        [HttpPost("upload")]
        public async Task<ActionResult<object>> UploadFile(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest(new { message = "No file provided for upload." });

            var allowedExtensions = new[] { ".png", ".jpg", ".jpeg", ".webp", ".svg" };
            var extension = Path.GetExtension(file.FileName).ToLowerInvariant();

            if (!allowedExtensions.Contains(extension))
                return BadRequest(new { message = "Invalid image extension. Only PNG, JPG, JPEG, WEBP, and SVG files are allowed." });

            string uploadsFolder = Path.Combine(_environment.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot"), "uploads");
            if (!Directory.Exists(uploadsFolder))
                Directory.CreateDirectory(uploadsFolder);

            string uniqueFileName = $"{Guid.NewGuid()}_{Path.GetFileName(file.FileName)}";
            string filePath = Path.Combine(uploadsFolder, uniqueFileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            string relativeUrl = $"/uploads/{uniqueFileName}";
            return Ok(new { url = relativeUrl, fileName = uniqueFileName });
        }

        // Mapping Helper
        private static CompetitionDetailDto MapToDetailDto(Competition c)
        {
            int daysRemaining = (c.RegistrationDeadline - DateTime.UtcNow).Days;
            string daysLeftText = daysRemaining > 0 ? $"{daysRemaining} Days Left" : "Expiring Soon";

            return new CompetitionDetailDto
            {
                Id = c.Id,
                Title = c.Title,
                Description = c.Description,
                Organization = c.Organization?.Name ?? "Oppora Host",
                Logo = c.Organization?.LogoUrl ?? "https://picsum.photos/200/200?random=1",
                Category = c.Category?.Name ?? "Competitions",
                Location = c.Location?.Name ?? "Online / India",
                Mode = c.Mode,
                TeamSize = c.TeamSize,
                RegistrationFee = c.RegistrationFee,
                RegistrationDeadline = c.RegistrationDeadline,
                Deadline = c.RegistrationDeadline.ToString("dd MMM yyyy"),
                DaysLeft = daysLeftText,
                OfficialRegistrationUrl = c.OfficialRegistrationUrl,
                IsFeatured = c.IsFeatured,
                RegisteredCount = c.RegisteredCount,
                CreatedAt = c.CreatedAt,
                Eligibility = c.Eligibility != null ? new EligibilityDto
                {
                    DegreeRequirement = c.Eligibility.DegreeRequirement,
                    BatchRequirement = c.Eligibility.BatchRequirement,
                    DomainSpecialization = c.Eligibility.DomainSpecialization,
                    MinAge = c.Eligibility.MinAge,
                    MaxAge = c.Eligibility.MaxAge
                } : null,
                Timeline = c.TimelineRounds.Select(t => new TimelineRoundDto
                {
                    RoundNumber = t.RoundNumber,
                    RoundTitle = t.RoundTitle,
                    Description = t.Description,
                    RoundDate = t.RoundDate
                }).ToList(),
                Prizes = c.Prizes.Select(p => new PrizeDto
                {
                    Rank = p.Rank,
                    PositionName = p.PositionName,
                    RewardDescription = p.RewardDescription,
                    Amount = p.Amount
                }).ToList(),
                Rules = c.Rules.OrderBy(r => r.DisplayOrder).Select(r => r.RuleText).ToList(),
                Tags = c.CompetitionTags.Select(ct => ct.Tag.Name).ToList(),
                Categories = new List<string> { c.Category?.Name ?? "Competitions" }
            };
        }
    }
}
