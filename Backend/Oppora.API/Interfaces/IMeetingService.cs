using Oppora.API.DTOs;
using Oppora.API.Models;

namespace Oppora.API.Interfaces
{
    public interface IMeetingService
    {
        Task<MeetingDetails> CreateMeetingAsync(int roundId, string provider, DateTime startTime, DateTime endTime, string? customUrl = null, string timeZone = "UTC", string title = "Interview Round", string candidateEmail = "", string recruiterEmail = "");
        Task<MeetingDetailsResponseDto> SaveMeetingAsync(SaveMeetingDetailsDto dto);
        Task<MeetingDetailsResponseDto?> GetMeetingByRoundIdAsync(int roundId);
        Task<MeetingDetailsResponseDto?> UpdateMeetingAsync(int roundId, DateTime newStartTime, DateTime newEndTime, string? newUrl = null, string timeZone = "UTC");
        Task<bool> CancelMeetingAsync(int roundId);
        string ExtractMeetingId(string meetingUrl);
        string GenerateGoogleMeetUrl(string title, DateTime startTime);
    }
}
