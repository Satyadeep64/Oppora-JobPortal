using Oppora.API.DTOs;
using Oppora.API.Models;

namespace Oppora.API.Services
{
    public interface ICompetitionService
    {
        Task<PagedResult<CompetitionListDto>> GetCompetitionsPagedAsync(CompetitionSearchQueryDto queryDto);
        Task<CompetitionDetailDto?> GetCompetitionByIdAsync(int id);
        Task<List<Category>> GetCategoriesAsync();
        Task<List<CompetitionListDto>> GetFeaturedCompetitionsAsync(int count = 5);
        Task<CompetitionDetailDto> CreateCompetitionAsync(CreateCompetitionDto dto);
        Task<CompetitionDetailDto?> UpdateCompetitionAsync(int id, UpdateCompetitionDto dto);
        Task<bool> DeleteCompetitionAsync(int id);
    }
}
