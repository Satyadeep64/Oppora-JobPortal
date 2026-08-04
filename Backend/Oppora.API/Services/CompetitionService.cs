using Oppora.API.DTOs;
using Oppora.API.Interfaces;
using Oppora.API.Models;

namespace Oppora.API.Services
{
    public class CompetitionService : ICompetitionService
    {
        private readonly ICompetitionRepository _repository;

        public CompetitionService(ICompetitionRepository repository)
        {
            _repository = repository;
        }

        public async Task<PagedResult<CompetitionListDto>> GetCompetitionsPagedAsync(CompetitionSearchQueryDto queryDto)
        {
            var (items, totalCount) = await _repository.GetPagedAsync(queryDto);

            int pageNumber = Math.Max(1, queryDto.PageNumber);
            int pageSize = Math.Clamp(queryDto.PageSize, 1, 100);
            var mappedItems = items.Select(MapToListDto).ToList();

            return new PagedResult<CompetitionListDto>
            {
                Items = mappedItems,
                TotalCount = totalCount,
                CurrentPage = pageNumber,
                PageSize = pageSize
            };
        }

        public async Task<CompetitionDetailDto?> GetCompetitionByIdAsync(int id)
        {
            var competition = await _repository.GetByIdAsync(id);
            return competition != null ? MapToDetailDto(competition) : null;
        }

        public async Task<List<Category>> GetCategoriesAsync()
        {
            return await _repository.GetCategoriesAsync();
        }

        public async Task<List<CompetitionListDto>> GetFeaturedCompetitionsAsync(int count = 5)
        {
            var items = await _repository.GetFeaturedAsync(count);
            return items.Select(MapToListDto).ToList();
        }

        public async Task<CompetitionDetailDto> CreateCompetitionAsync(CreateCompetitionDto dto)
        {
            var org = await _repository.GetOrCreateOrganizationAsync(dto.OrganizationName, dto.OrganizationLogoUrl);
            var category = await _repository.GetOrCreateCategoryAsync(dto.CategoryName);
            var location = await _repository.GetOrCreateLocationAsync(dto.LocationName);

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

            int ruleOrder = 1;
            foreach (var rule in dto.Rules)
            {
                competition.Rules.Add(new RuleItem
                {
                    RuleText = rule,
                    DisplayOrder = ruleOrder++
                });
            }

            foreach (var tagName in dto.Tags)
            {
                var tag = await _repository.GetOrCreateTagAsync(tagName);
                competition.CompetitionTags.Add(new CompetitionTag { TagId = tag.Id });
            }

            var created = await _repository.AddAsync(competition);
            return (await GetCompetitionByIdAsync(created.Id))!;
        }

        public async Task<CompetitionDetailDto?> UpdateCompetitionAsync(int id, UpdateCompetitionDto dto)
        {
            var competition = await _repository.GetByIdAsync(id);
            if (competition == null) return null;

            if (!string.IsNullOrWhiteSpace(dto.Title)) competition.Title = dto.Title;
            if (!string.IsNullOrWhiteSpace(dto.Description)) competition.Description = dto.Description;
            competition.IsFeatured = dto.IsFeatured;

            await _repository.UpdateAsync(competition);
            return await GetCompetitionByIdAsync(id);
        }

        public async Task<bool> DeleteCompetitionAsync(int id)
        {
            return await _repository.DeleteAsync(id);
        }

        private static CompetitionListDto MapToListDto(Competition c)
        {
            int daysRemaining = (c.RegistrationDeadline - DateTime.UtcNow).Days;
            string daysLeftText = daysRemaining > 0 ? $"{daysRemaining} Days Left" : "Expiring Soon";
            string statusText = daysRemaining <= 0 ? "Registration Closed" : (daysRemaining <= 7 ? "Closing Soon" : "Open");
            string popBadge = c.IsFeatured ? "Featured" : (c.RegisteredCount >= 30000 ? "Trending" : "Popular");
            int daysAgo = (DateTime.UtcNow - c.CreatedAt).Days;
            string postedDateText = daysAgo > 0 ? $"Posted {daysAgo}d ago" : "Posted today";

            string orgName = c.Organization?.Name ?? "Oppora Host";
            string logoUrl = !string.IsNullOrWhiteSpace(c.Organization?.LogoUrl) && !c.Organization.LogoUrl.Contains("picsum.photos")
                ? c.Organization.LogoUrl
                : $"https://ui-avatars.com/api/?name={Uri.EscapeDataString(orgName)}&background=1c4980&color=fff&bold=true&format=png";
            string bannerUrl = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80";

            return new CompetitionListDto
            {
                Id = c.Id,
                Title = c.Title,
                Organization = orgName,
                Logo = logoUrl,
                Banner = bannerUrl,
                Category = c.Category?.Name ?? "Competitions",
                Location = c.Location?.Name ?? "Online / India",
                Mode = c.Mode,
                TeamSize = c.TeamSize,
                RegistrationFee = c.RegistrationFee,
                RegistrationDeadline = c.RegistrationDeadline,
                Deadline = c.RegistrationDeadline.ToString("dd MMM yyyy"),
                DaysLeft = daysLeftText,
                Status = statusText,
                Difficulty = "Intermediate",
                PopularityBadge = popBadge,
                PostedDate = postedDateText,
                OfficialRegistrationUrl = c.OfficialRegistrationUrl,
                IsFeatured = c.IsFeatured,
                RegisteredCount = c.RegisteredCount,
                CreatedAt = c.CreatedAt,
                Tags = c.CompetitionTags.Where(ct => ct.Tag != null).Select(ct => ct.Tag!.Name).ToList(),
                Categories = new List<string> { c.Category?.Name ?? "Competitions" }
            };
        }

        private static CompetitionDetailDto MapToDetailDto(Competition c)
        {
            int daysRemaining = (c.RegistrationDeadline - DateTime.UtcNow).Days;
            string daysLeftText = daysRemaining > 0 ? $"{daysRemaining} Days Left" : "Expiring Soon";
            string statusText = daysRemaining <= 0 ? "Registration Closed" : (daysRemaining <= 7 ? "Closing Soon" : "Open");
            string popBadge = c.IsFeatured ? "Featured" : (c.RegisteredCount >= 30000 ? "Trending" : "Popular");
            int daysAgo = (DateTime.UtcNow - c.CreatedAt).Days;
            string postedDateText = daysAgo > 0 ? $"Posted {daysAgo}d ago" : "Posted today";
            string orgName = c.Organization?.Name ?? "Oppora Host";
            string logoUrl = !string.IsNullOrWhiteSpace(c.Organization?.LogoUrl) && !c.Organization.LogoUrl.Contains("picsum.photos")
                ? c.Organization.LogoUrl
                : $"https://ui-avatars.com/api/?name={Uri.EscapeDataString(orgName)}&background=1c4980&color=fff&bold=true&format=png";
            string bannerUrl = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80";

            return new CompetitionDetailDto
            {
                Id = c.Id,
                Title = c.Title,
                Description = c.Description,
                Organization = orgName,
                Logo = logoUrl,
                Banner = bannerUrl,
                Category = c.Category?.Name ?? "Competitions",
                Location = c.Location?.Name ?? "Online / India",
                Mode = c.Mode,
                TeamSize = c.TeamSize,
                RegistrationFee = c.RegistrationFee,
                RegistrationDeadline = c.RegistrationDeadline,
                Deadline = c.RegistrationDeadline.ToString("dd MMM yyyy"),
                DaysLeft = daysLeftText,
                Status = statusText,
                Difficulty = "Intermediate",
                PopularityBadge = popBadge,
                PostedDate = postedDateText,
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
                Tags = c.CompetitionTags.Where(ct => ct.Tag != null).Select(ct => ct.Tag!.Name).ToList(),
                Categories = new List<string> { c.Category?.Name ?? "Competitions" }
            };
        }
    }
}
