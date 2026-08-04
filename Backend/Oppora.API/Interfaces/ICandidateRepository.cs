using Oppora.API.Models;

namespace Oppora.API.Interfaces
{
    public interface ICandidateRepository : IGenericRepository<Candidate>
    {
        Task<Candidate?> GetByEmailAsync(string email);
        Task<IEnumerable<Candidate>> SearchCandidatesAsync(string query);
    }
}
