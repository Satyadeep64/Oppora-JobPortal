namespace Oppora.API.Interfaces
{
    public class GoogleCalendarEventResult
    {
        public string EventId { get; set; } = string.Empty;
        public string MeetingUrl { get; set; } = string.Empty;
        public string MeetingId { get; set; } = string.Empty;
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public string TimeZone { get; set; } = "UTC";
        public bool IsRealApiCreated { get; set; } = false;
    }

    public interface IGoogleCalendarService
    {
        Task<GoogleCalendarEventResult> CreateEventWithMeetAsync(
            string title,
            string description,
            DateTime startTime,
            DateTime endTime,
            string candidateEmail,
            string recruiterEmail,
            string timeZone = "UTC"
        );

        Task<GoogleCalendarEventResult> UpdateEventAsync(
            string eventId,
            string title,
            string description,
            DateTime newStartTime,
            DateTime newEndTime,
            string timeZone = "UTC"
        );

        Task<bool> DeleteEventAsync(string eventId);
    }
}
