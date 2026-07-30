using Microsoft.EntityFrameworkCore;
using Oppora.API.Data;
using Oppora.API.Models;
using Oppora.API.Services.Import.Models;

namespace Oppora.API.Services.Import
{
    public class CompetitionIngestionService
    {
        private readonly AppDbContext _context;
        private readonly CompetitionImporterFactory _factory;

        public CompetitionIngestionService(AppDbContext context, CompetitionImporterFactory factory)
        {
            _context = context;
            _factory = factory;
        }

        public async Task<ImportResultDto> IngestAsync(ImportSourceType sourceType, Stream dataStream)
        {
            var result = new ImportResultDto();
            var importer = _factory.GetImporter(sourceType);

            IEnumerable<NormalizedCompetitionDto> normalizedItems;
            try
            {
                normalizedItems = await importer.ImportAsync(dataStream);
            }
            catch (Exception ex)
            {
                result.Errors.Add($"Failed to parse import stream: {ex.Message}");
                return result;
            }

            foreach (var dto in normalizedItems)
            {
                result.TotalProcessed++;

                if (string.IsNullOrWhiteSpace(dto.Title))
                {
                    result.Errors.Add($"Skipped record #{result.TotalProcessed}: Missing Title.");
                    continue;
                }

                // De-duplication check against existing OfficialRegistrationUrl
                bool exists = await _context.Competitions.AnyAsync(c =>
                    c.Title.ToLower() == dto.Title.ToLower() ||
                    (!string.IsNullOrEmpty(dto.OfficialRegistrationUrl) && c.OfficialRegistrationUrl == dto.OfficialRegistrationUrl));

                if (exists)
                {
                    result.TotalSkippedDuplicates++;
                    continue;
                }

                // Resolve or create Organization
                var orgName = string.IsNullOrWhiteSpace(dto.OrganizationName) ? "Oppora Partner" : dto.OrganizationName;
                var org = await _context.Organizations.FirstOrDefaultAsync(o => o.Name.ToLower() == orgName.ToLower());
                if (org == null)
                {
                    org = new Organization { Name = orgName, LogoUrl = dto.OrganizationLogoUrl };
                    _context.Organizations.Add(org);
                    await _context.SaveChangesAsync();
                }

                // Resolve or create Category
                var catName = string.IsNullOrWhiteSpace(dto.CategoryName) ? "Competitions" : dto.CategoryName;
                var cat = await _context.Categories.FirstOrDefaultAsync(c => c.Name.ToLower() == catName.ToLower());
                if (cat == null)
                {
                    cat = new Category { Name = catName, Slug = catName.ToLower().Replace(" ", "-") };
                    _context.Categories.Add(cat);
                    await _context.SaveChangesAsync();
                }

                // Resolve or create Location
                var locName = string.IsNullOrWhiteSpace(dto.LocationName) ? "Online / India" : dto.LocationName;
                var loc = await _context.Locations.FirstOrDefaultAsync(l => l.Name.ToLower() == locName.ToLower());
                if (loc == null)
                {
                    loc = new Location { Name = locName, IsOnline = locName.ToLower().Contains("online") };
                    _context.Locations.Add(loc);
                    await _context.SaveChangesAsync();
                }

                // Build Competition entity
                var competition = new Competition
                {
                    Title = dto.Title,
                    Description = dto.Description,
                    OrganizationId = org.Id,
                    CategoryId = cat.Id,
                    LocationId = loc.Id,
                    Mode = dto.Mode,
                    TeamSize = dto.TeamSize,
                    RegistrationFee = dto.RegistrationFee,
                    RegistrationDeadline = dto.RegistrationDeadline,
                    OfficialRegistrationUrl = string.IsNullOrWhiteSpace(dto.OfficialRegistrationUrl) ? "https://google.com" : dto.OfficialRegistrationUrl,
                    IsFeatured = dto.IsFeatured,
                    CreatedAt = DateTime.UtcNow
                };

                _context.Competitions.Add(competition);
                await _context.SaveChangesAsync();
                result.TotalImported++;
            }

            return result;
        }
    }
}
