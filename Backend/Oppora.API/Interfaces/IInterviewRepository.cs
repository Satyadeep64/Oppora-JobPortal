using Oppora.API.Models;

namespace Oppora.API.Interfaces
{
    public interface IInterviewRepository : IGenericRepository<Interview>
    {
        // Interview queries
        Task<Interview?> GetInterviewDetailsAsync(int interviewId);
        Task<IEnumerable<Interview>> GetInterviewsByRecruiterAsync(int recruiterId);
        Task<IEnumerable<Interview>> GetInterviewsByCandidateAsync(int candidateId);
        Task<Interview?> GetExistingInterviewForApplicationAsync(int applicationId);

        // Application / candidate lookups
        Task<Application?> GetApplicationWithIncludesAsync(int applicationId);
        Task<User?> GetCandidateUserAsync(int userId);
        Task<IEnumerable<Application>> GetShortlistedApplicationsAsync(int recruiterId);
        Task<IEnumerable<User>> SearchCandidateUsersAsync(string query, int limit);

        // Round, meeting, feedback, notification, email
        Task<InterviewRound?> GetRoundByIdAsync(int roundId);
        Task AddRoundAsync(InterviewRound round);
        Task AddMeetingDetailsAsync(MeetingDetails meetingDetails);
        Task AddFeedbackAsync(InterviewFeedback feedback);
        Task AddNotificationAsync(InterviewNotification notification);
        Task AddEmailQueueAsync(EmailQueue emailQueue);
        Task<IEnumerable<EmailQueue>> GetPendingEmailsAsync(int batchSize = 10);
    }
}
