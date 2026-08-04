using Microsoft.EntityFrameworkCore;
using Oppora.API.Data;
using Oppora.API.Interfaces;
using Oppora.API.Models;

namespace Oppora.API.Repositories
{
    public class InterviewerRepository : GenericRepository<Interviewer>, IInterviewerRepository
    {
        public InterviewerRepository(AppDbContext context) : base(context)
        {
        }

        public async Task<IEnumerable<Interviewer>> GetActiveInterviewersAsync(string? department = null)
        {
            var query = _context.Interviewers.Where(i => i.IsActive);
            if (!string.IsNullOrWhiteSpace(department))
            {
                query = query.Where(i => i.Department.ToLower() == department.ToLower());
            }

            return await query.OrderBy(i => i.FullName).ToListAsync();
        }
    }
}
