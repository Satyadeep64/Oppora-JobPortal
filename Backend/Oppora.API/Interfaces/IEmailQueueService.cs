using Oppora.API.Models;

namespace Oppora.API.Interfaces
{
    public interface IEmailQueueService
    {
        Task EnqueueEmailAsync(string toEmail, string toName, string subject, string bodyHtml, string? icsContent = null, DateTime? scheduledFor = null);
        
        Task EnqueueInvitationEmailAsync(
            string candidateEmail,
            string candidateName,
            string jobTitle,
            string companyName,
            DateTime interviewDate,
            DateTime startTime,
            DateTime endTime,
            string timeZone,
            string roundTitle,
            string googleMeetUrl,
            string recruiterName,
            string instructions
        );

        Task EnqueueReminderEmailAsync(
            string candidateEmail,
            string candidateName,
            string jobTitle,
            string companyName,
            DateTime interviewDate,
            DateTime startTime,
            string timeZone,
            string roundTitle,
            string googleMeetUrl,
            string recruiterName,
            DateTime scheduledFor
        );

        Task ProcessPendingEmailsAsync();
        
        string GenerateIcsCalendarInvite(string eventTitle, string description, string location, DateTime startTime, DateTime endTime);
    }
}
