using Oppora.API.DTOs;

namespace Oppora.API.Interfaces
{
    /// <summary>
    /// Contract for the production SMTP email service.
    /// Responsible for direct async email delivery (not queue-based).
    /// </summary>
    public interface IEmailService
    {
        /// <summary>
        /// Sends a professional HTML interview invitation email to the candidate.
        /// </summary>
        Task<EmailSendResult> SendInterviewInvitationAsync(SendInvitationRequestDto request);

        /// <summary>
        /// Reads interview entity from database and sends email invitation via SMTP.
        /// Updates 1-to-1 InterviewEmail status and stores error on failure allowing retry.
        /// </summary>
        Task<EmailSendResult> SendInterviewEmailFromDbAsync(int interviewId);

        /// <summary>
        /// Sends a plain HTML email with a given subject and body.
        /// </summary>
        Task<EmailSendResult> SendEmailAsync(string toEmail, string toName, string subject, string htmlBody);
    }
}
