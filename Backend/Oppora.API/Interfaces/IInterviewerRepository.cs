using Oppora.API.Models;

namespace Oppora.API.Interfaces
{
    public interface IInterviewerRepository : IGenericRepository<Interviewer>
    {
        Task<IEnumerable<Interviewer>> GetActiveInterviewersAsync(string? department = null);
    }
}
