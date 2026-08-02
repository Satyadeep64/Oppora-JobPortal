using Oppora.API.DTOs;
using Oppora.API.Models;

namespace Oppora.API.Interfaces
{
    public interface ICompetitionRepository
    {
        Task<(List<Competition> Items, int TotalCount)> GetPagedAsync(CompetitionSearchQueryDto queryDto);
        Task<Competition?> GetByIdAsync(int id);
        Task<List<Competition>> GetFeaturedAsync(int count);
        Task<List<Category>> GetCategoriesAsync();
        Task<Competition> AddAsync(Competition competition);
        Task UpdateAsync(Competition competition);
        Task<bool> DeleteAsync(int id);
        Task<bool> ExistsAsync(int id);
        Task<Organization> GetOrCreateOrganizationAsync(string name, string logoUrl);
        Task<Category> GetOrCreateCategoryAsync(string name);
        Task<Location> GetOrCreateLocationAsync(string name);
        Task<Tag> GetOrCreateTagAsync(string name);
    }
}
