using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Oppora.API.Data;
using Oppora.API.DTOs;
using Oppora.API.Interfaces;
using Oppora.API.Models;

namespace Oppora.API.Repositories
{
    public class CompetitionRepository : ICompetitionRepository
    {
        private readonly AppDbContext _context;
        private readonly IMemoryCache _cache;
        private static readonly TimeSpan CacheDuration = TimeSpan.FromMinutes(5);

        public CompetitionRepository(AppDbContext context, IMemoryCache cache)
        {
            _context = context;
            _cache = cache;
        }

        public async Task<(List<Competition> Items, int TotalCount)> GetPagedAsync(CompetitionSearchQueryDto queryDto)
        {
            var query = _context.Competitions
                .AsNoTracking()
                .Include(c => c.Organization)
                .Include(c => c.Category)
                .Include(c => c.Location)
                .Include(c => c.Prizes)
                .Include(c => c.CompetitionTags)
                    .ThenInclude(ct => ct.Tag)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(queryDto.SearchTerm))
            {
                var term = queryDto.SearchTerm.Trim().ToLower();
                query = query.Where(c => c.Title.ToLower().Contains(term)
                                      || (c.Organization != null && c.Organization.Name.ToLower().Contains(term))
                                      || (c.Category != null && c.Category.Name.ToLower().Contains(term))
                                      || c.Description.ToLower().Contains(term));
            }

            if (!string.IsNullOrWhiteSpace(queryDto.Title))
            {
                var titleTerm = queryDto.Title.Trim().ToLower();
                query = query.Where(c => c.Title.ToLower().Contains(titleTerm));
            }

            if (!string.IsNullOrWhiteSpace(queryDto.Organization))
            {
                var orgTerm = queryDto.Organization.Trim().ToLower();
                query = query.Where(c => c.Organization != null && c.Organization.Name.ToLower().Contains(orgTerm));
            }

            if (!string.IsNullOrWhiteSpace(queryDto.Category) && 
                !string.Equals(queryDto.Category.Trim(), "All", StringComparison.OrdinalIgnoreCase) &&
                !string.Equals(queryDto.Category.Trim(), "Competitions", StringComparison.OrdinalIgnoreCase))
            {
                var categoryTerm = queryDto.Category.Trim().ToLower();
                var categorySlug = categoryTerm.Replace(" ", "-");
                query = query.Where(c => (c.Category != null && (c.Category.Name.ToLower() == categoryTerm || c.Category.Name.ToLower().Contains(categoryTerm) || c.Category.Slug.ToLower() == categorySlug))
                                      || c.CompetitionTags.Any(ct => ct.Tag != null && (ct.Tag.Name.ToLower() == categoryTerm || ct.Tag.Name.ToLower().Contains(categoryTerm)))
                                      || c.Title.ToLower().Contains(categoryTerm));
            }

            if (!string.IsNullOrWhiteSpace(queryDto.Location))
            {
                var locTerm = queryDto.Location.Trim().ToLower();
                query = query.Where(c => c.Location != null && c.Location.Name.ToLower().Contains(locTerm));
            }

            if (!string.IsNullOrWhiteSpace(queryDto.Mode) && !string.Equals(queryDto.Mode.Trim(), "All", StringComparison.OrdinalIgnoreCase))
            {
                var modeTerm = queryDto.Mode.Trim().ToLower();
                query = query.Where(c => c.Mode.ToLower().Contains(modeTerm));
            }

            if (queryDto.MinPrizeAmount.HasValue && queryDto.MinPrizeAmount.Value > 0)
            {
                query = query.Where(c => c.Prizes.Any(p => p.Amount >= queryDto.MinPrizeAmount.Value));
            }
            if (queryDto.MaxPrizeAmount.HasValue && queryDto.MaxPrizeAmount.Value > 0)
            {
                query = query.Where(c => c.Prizes.Any(p => p.Amount <= queryDto.MaxPrizeAmount.Value));
            }

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

            int totalCount = await query.CountAsync();
            int pageNumber = Math.Max(1, queryDto.PageNumber);
            int pageSize = Math.Clamp(queryDto.PageSize, 1, 100);

            var items = await query
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return (items, totalCount);
        }

        public async Task<Competition?> GetByIdAsync(int id)
        {
            return await _context.Competitions
                .AsNoTracking()
                .Include(c => c.Organization)
                .Include(c => c.Category)
                .Include(c => c.Location)
                .Include(c => c.Eligibility)
                .Include(c => c.TimelineRounds)
                .Include(c => c.Prizes)
                .Include(c => c.Rules)
                .Include(c => c.CompetitionTags)
                    .ThenInclude(ct => ct.Tag)
                .FirstOrDefaultAsync(c => c.Id == id);
        }

        public async Task<List<Competition>> GetFeaturedAsync(int count)
        {
            string cacheKey = $"competitions_featured_{count}";
            return await _cache.GetOrCreateAsync(cacheKey, async entry =>
            {
                entry.SlidingExpiration = CacheDuration;
                return await _context.Competitions
                    .AsNoTracking()
                    .Include(c => c.Organization)
                    .Include(c => c.Category)
                    .Include(c => c.Location)
                    .Include(c => c.Prizes)
                    .Include(c => c.CompetitionTags)
                        .ThenInclude(ct => ct.Tag)
                    .Where(c => c.IsFeatured)
                    .Take(count)
                    .ToListAsync();
            }) ?? new List<Competition>();
        }

        public async Task<List<Category>> GetCategoriesAsync()
        {
            string cacheKey = "competitions_categories_all";
            return await _cache.GetOrCreateAsync(cacheKey, async entry =>
            {
                entry.SlidingExpiration = CacheDuration;
                return await _context.Categories.AsNoTracking().ToListAsync();
            }) ?? new List<Category>();
        }

        public async Task<Competition> AddAsync(Competition competition)
        {
            _context.Competitions.Add(competition);
            await _context.SaveChangesAsync();
            InvalidateCache();
            return competition;
        }

        public async Task UpdateAsync(Competition competition)
        {
            _context.Competitions.Update(competition);
            await _context.SaveChangesAsync();
            InvalidateCache();
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var entity = await _context.Competitions.FindAsync(id);
            if (entity == null) return false;

            _context.Competitions.Remove(entity);
            await _context.SaveChangesAsync();
            InvalidateCache();
            return true;
        }

        public async Task<bool> ExistsAsync(int id)
        {
            return await _context.Competitions.AnyAsync(c => c.Id == id);
        }

        public async Task<Organization> GetOrCreateOrganizationAsync(string name, string logoUrl)
        {
            var org = await _context.Organizations.FirstOrDefaultAsync(o => o.Name.ToLower() == name.ToLower());
            if (org == null)
            {
                org = new Organization { Name = name, LogoUrl = logoUrl };
                _context.Organizations.Add(org);
                await _context.SaveChangesAsync();
            }
            return org;
        }

        public async Task<Category> GetOrCreateCategoryAsync(string name)
        {
            var cat = await _context.Categories.FirstOrDefaultAsync(c => c.Name.ToLower() == name.ToLower());
            if (cat == null)
            {
                cat = new Category { Name = name, Slug = name.ToLower().Replace(" ", "-") };
                _context.Categories.Add(cat);
                await _context.SaveChangesAsync();
            }
            return cat;
        }

        public async Task<Location> GetOrCreateLocationAsync(string name)
        {
            var loc = await _context.Locations.FirstOrDefaultAsync(l => l.Name.ToLower() == name.ToLower());
            if (loc == null)
            {
                loc = new Location { Name = name, IsOnline = name.ToLower().Contains("online") };
                _context.Locations.Add(loc);
                await _context.SaveChangesAsync();
            }
            return loc;
        }

        public async Task<Tag> GetOrCreateTagAsync(string name)
        {
            var tag = await _context.Tags.FirstOrDefaultAsync(t => t.Name.ToLower() == name.ToLower());
            if (tag == null)
            {
                tag = new Tag { Name = name };
                _context.Tags.Add(tag);
                await _context.SaveChangesAsync();
            }
            return tag;
        }

        private void InvalidateCache()
        {
            _cache.Remove("competitions_categories_all");
            _cache.Remove("competitions_featured_3");
            _cache.Remove("competitions_featured_5");
            _cache.Remove("competitions_featured_10");
        }
    }
}
