using Oppora.API.DTOs;

namespace Oppora.API.Interfaces
{
    public interface IInterviewService
    {
        Task<IEnumerable<InterviewResponseDto>> GetAllInterviewsAsync(int? recruiterId = null, string? status = null);
        Task<InterviewResponseDto> ScheduleInterviewAsync(ScheduleInterviewDto dto);
        Task<InterviewResponseDto> UpdateInterviewAsync(int interviewId, UpdateInterviewDto dto);
        Task<InterviewResponseDto> RescheduleInterviewAsync(int interviewId, RescheduleInterviewDto dto);
        Task<InterviewResponseDto> CancelInterviewAsync(int interviewId, CancelInterviewDto? dto = null);
        Task<bool> DeleteInterviewAsync(int interviewId);
        Task<InterviewResponseDto> CompleteInterviewAsync(int interviewId);
        Task<EmailSendResult> SendInvitationEmailAsync(int interviewId);
        Task<EmailSendResult> ResendInvitationEmailAsync(int interviewId);
        Task<IEnumerable<InterviewResponseDto>> GetCandidateInterviewsAsync(int candidateId);
        Task<IEnumerable<InterviewResponseDto>> GetUpcomingInterviewsAsync(int? recruiterId = null, int? candidateId = null);
        Task<IEnumerable<CalendarEventDto>> GetCalendarEventsAsync(int? recruiterId = null, int? candidateId = null);
        Task<InterviewFeedbackResponseDto> SubmitFeedbackAsync(SubmitFeedbackDto dto);
        Task<InterviewRoundResponseDto> AddRoundAsync(CreateInterviewRoundDto dto);
        Task<InterviewResponseDto?> GetInterviewByIdAsync(int interviewId);
        Task<IEnumerable<InterviewResponseDto>> GetInterviewsByRecruiterAsync(int recruiterId);
        Task<IEnumerable<ShortlistedCandidateDto>> GetShortlistedCandidatesAsync(int recruiterId);
        Task<IEnumerable<CandidateDirectoryDto>> SearchCandidatesAsync(string? query);
        Task<ConflictCheckResponseDto> CheckConflictAsync(CheckConflictDto dto);
    }
}
