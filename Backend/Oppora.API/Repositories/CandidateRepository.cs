using Microsoft.EntityFrameworkCore;
using Oppora.API.Data;
using Oppora.API.Interfaces;
using Oppora.API.Models;

namespace Oppora.API.Repositories
{
    public class CandidateRepository : GenericRepository<Candidate>, ICandidateRepository
    {
        public CandidateRepository(AppDbContext context) : base(context)
        {
        }

        public async Task<Candidate?> GetByEmailAsync(string email)
        {
            return await _context.Candidates
                .Include(c => c.Interviews)
                .FirstOrDefaultAsync(c => c.Email.ToLower() == email.ToLower());
        }

        public async Task<IEnumerable<Candidate>> SearchCandidatesAsync(string query)
        {
            if (string.IsNullOrWhiteSpace(query))
            {
                return await _context.Candidates.OrderByDescending(c => c.CreatedAt).Take(20).ToListAsync();
            }

            string q = query.ToLower();
            return await _context.Candidates
                .Where(c => c.FullName.ToLower().Contains(q) || c.Email.ToLower().Contains(q) || c.CurrentCompany.ToLower().Contains(q))
                .OrderBy(c => c.FullName)
                .Take(20)
                .ToListAsync();
        }
    }
}
