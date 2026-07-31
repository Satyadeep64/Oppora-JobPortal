using Oppora.API.Interfaces;
using Oppora.API.Models;
using Oppora.API.Services.Import.Models;

namespace Oppora.API.Services.Import
{
    public class CompetitionIngestionService : ICompetitionIngestionService
    {
        private readonly ICompetitionRepository _repository;
        private readonly CompetitionImporterFactory _factory;

        public CompetitionIngestionService(ICompetitionRepository repository, CompetitionImporterFactory factory)
        {
            _repository = repository;
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

                var orgName = string.IsNullOrWhiteSpace(dto.OrganizationName) ? "Oppora Partner" : dto.OrganizationName;
                var org = await _repository.GetOrCreateOrganizationAsync(orgName, dto.OrganizationLogoUrl);

                var catName = string.IsNullOrWhiteSpace(dto.CategoryName) ? "Competitions" : dto.CategoryName;
                var cat = await _repository.GetOrCreateCategoryAsync(catName);

                var locName = string.IsNullOrWhiteSpace(dto.LocationName) ? "Online / India" : dto.LocationName;
                var loc = await _repository.GetOrCreateLocationAsync(locName);

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

                await _repository.AddAsync(competition);
                result.TotalImported++;
            }

            return result;
        }
    }
}
