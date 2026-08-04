using Microsoft.EntityFrameworkCore;
using Oppora.API.Data;
using Oppora.API.Interfaces;
using Oppora.API.Models;

namespace Oppora.API.Repositories
{
    public class InterviewRepository : GenericRepository<Interview>, IInterviewRepository
    {
        public InterviewRepository(AppDbContext context) : base(context)
        {
        }

        // ── Interview Queries ─────────────────────────────────────────────────

        public async Task<Interview?> GetInterviewDetailsAsync(int interviewId)
        {
            return await _context.Set<Interview>()
                .AsSplitQuery()
                .AsNoTracking()
                .Include(i => i.Application)
                .Include(i => i.Recruiter)
                .Include(i => i.Candidate)
                .Include(i => i.CandidateEntity)
                .Include(i => i.Opportunity)
                .Include(i => i.InterviewEmail)
                .Include(i => i.Audits)
                .Include(i => i.Rounds).ThenInclude(r => r.MeetingDetails)
                .Include(i => i.Rounds).ThenInclude(r => r.Feedbacks).ThenInclude(f => f.Evaluator)
                .Include(i => i.Notifications)
                .FirstOrDefaultAsync(i => i.Id == interviewId);
        }

        public async Task<IEnumerable<Interview>> GetInterviewsByRecruiterAsync(int recruiterId)
        {
            try
            {
                return await _context.Set<Interview>()
                    .AsSplitQuery()
                    .AsNoTracking()
                    .Include(i => i.Application)
                    .Include(i => i.Recruiter)
                    .Include(i => i.Candidate)
                    .Include(i => i.Opportunity)
                    .Include(i => i.Rounds).ThenInclude(r => r.MeetingDetails)
                    .Include(i => i.Rounds).ThenInclude(r => r.Feedbacks)
                    .Where(i => i.RecruiterId == recruiterId)
                    .OrderByDescending(i => i.CreatedAt)
                    .ToListAsync();
            }
            catch (Exception)
            {
                return Enumerable.Empty<Interview>();
            }
        }

        public async Task<IEnumerable<Interview>> GetInterviewsByCandidateAsync(int candidateId)
        {
            try
            {
                return await _context.Set<Interview>()
                    .Include(i => i.Application)
                    .Include(i => i.Recruiter)
                    .Include(i => i.Candidate)
                    .Include(i => i.Opportunity)
                    .Include(i => i.Rounds).ThenInclude(r => r.MeetingDetails)
                    .Where(i => i.CandidateId == candidateId)
                    .OrderByDescending(i => i.CreatedAt)
                    .ToListAsync();
            }
            catch (Exception)
            {
                return Enumerable.Empty<Interview>();
            }
        }

        public async Task<Interview?> GetExistingInterviewForApplicationAsync(int applicationId)
        {
            try
            {
                return await _context.Set<Interview>()
                    .Include(i => i.Rounds)
                    .FirstOrDefaultAsync(i => i.ApplicationId == applicationId);
            }
            catch (Exception)
            {
                return null;
            }
        }

        // ── Application / Candidate Lookups ──────────────────────────────────

        public async Task<Application?> GetApplicationWithIncludesAsync(int applicationId)
        {
            try
            {
                return await _context.Applications
                    .Include(a => a.User)
                    .Include(a => a.Opportunity).ThenInclude(o => o!.Recruiter)
                    .FirstOrDefaultAsync(a => a.Id == applicationId);
            }
            catch (Exception)
            {
                return null;
            }
        }

        public async Task<User?> GetCandidateUserAsync(int userId)
        {
            try
            {
                return await _context.Users.FindAsync(userId);
            }
            catch (Exception)
            {
                return null;
            }
        }

        public async Task<IEnumerable<Application>> GetShortlistedApplicationsAsync(int recruiterId)
        {
            try
            {
                return await _context.Applications
                    .Include(a => a.User)
                    .Include(a => a.Opportunity)
                    .Where(a =>
                        (a.Status == "Shortlisted" || a.Status == "Applied") &&
                        !_context.Set<Interview>().Any(i => i.ApplicationId == a.Id && i.OverallStatus != "Cancelled"))
                    .Take(30)
                    .ToListAsync();
            }
            catch (Exception)
            {
                return Enumerable.Empty<Application>();
            }
        }

        public async Task<IEnumerable<User>> SearchCandidateUsersAsync(string query, int limit)
        {
            try
            {
                return await _context.Users
                    .Where(u =>
                        (u.Role == "Candidate" || u.Role == "Student") &&
                        (string.IsNullOrEmpty(query) || u.FullName.Contains(query) || u.Email.Contains(query)))
                    .Take(limit)
                    .ToListAsync();
            }
            catch (Exception)
            {
                return Enumerable.Empty<User>();
            }
        }

        // ── Round, Meeting, Feedback, Notification, Email ────────────────────

        public async Task<InterviewRound?> GetRoundByIdAsync(int roundId)
        {
            try
            {
                return await _context.Set<InterviewRound>()
                    .Include(r => r.Interview)
                    .Include(r => r.MeetingDetails)
                    .Include(r => r.Feedbacks)
                    .FirstOrDefaultAsync(r => r.Id == roundId);
            }
            catch (Exception)
            {
                return null;
            }
        }

        public async Task AddRoundAsync(InterviewRound round)
        {
            await _context.Set<InterviewRound>().AddAsync(round);
        }

        public async Task AddMeetingDetailsAsync(MeetingDetails meetingDetails)
        {
            await _context.Set<MeetingDetails>().AddAsync(meetingDetails);
        }

        public async Task AddFeedbackAsync(InterviewFeedback feedback)
        {
            await _context.Set<InterviewFeedback>().AddAsync(feedback);
        }

        public async Task AddNotificationAsync(InterviewNotification notification)
        {
            await _context.Set<InterviewNotification>().AddAsync(notification);
        }

        public async Task AddEmailQueueAsync(EmailQueue emailQueue)
        {
            await _context.Set<EmailQueue>().AddAsync(emailQueue);
        }

        public async Task<IEnumerable<EmailQueue>> GetPendingEmailsAsync(int batchSize = 10)
        {
            try
            {
                return await _context.Set<EmailQueue>()
                    .Where(e => !e.IsSent && e.RetryCount < 3 && e.ScheduledFor <= DateTime.UtcNow)
                    .OrderBy(e => e.ScheduledFor)
                    .Take(batchSize)
                    .ToListAsync();
            }
            catch (Exception)
            {
                return Enumerable.Empty<EmailQueue>();
            }
        }
    }
}
