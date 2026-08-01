using System.Net;
using System.Net.Mail;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace Oppora.API.Services
{
    public interface IEmailService
    {
        Task SendEmailAsync(string toEmail, string subject, string body);
    }

    public class EmailService : IEmailService
    {
        private readonly IConfiguration _config;
        private readonly ILogger<EmailService> _logger;

        public EmailService(IConfiguration config, ILogger<EmailService> logger)
        {
            _config = config;
            _logger = logger;
        }

        public async Task SendEmailAsync(string toEmail, string subject, string body)
        {
            if (string.IsNullOrWhiteSpace(toEmail)) return;

            try
            {
                var smtpHost = _config["EmailSettings:SmtpHost"] ?? "smtp.gmail.com";
                var smtpPort = int.TryParse(_config["EmailSettings:SmtpPort"], out int p) ? p : 587;
                var senderEmail = _config["EmailSettings:SenderEmail"] ?? "";
                var senderPassword = _config["EmailSettings:SenderPassword"] ?? "";
                var senderName = _config["EmailSettings:SenderName"] ?? "Oppora Career Portal";
                var enableSsl = bool.TryParse(_config["EmailSettings:EnableSsl"], out bool ssl) ? ssl : true;

                if (string.IsNullOrWhiteSpace(senderEmail) || string.IsNullOrWhiteSpace(senderPassword))
                {
                    _logger.LogInformation("[Email Simulated] To: {ToEmail} | Subject: {Subject}", toEmail, subject);
                    return;
                }

                using var client = new SmtpClient(smtpHost, smtpPort)
                {
                    EnableSsl = enableSsl,
                    UseDefaultCredentials = false,
                    Credentials = new NetworkCredential(senderEmail, senderPassword)
                };

                var mailMessage = new MailMessage
                {
                    From = new MailAddress(senderEmail, senderName),
                    Subject = subject,
                    Body = body,
                    IsBodyHtml = true
                };
                mailMessage.To.Add(toEmail);

                await client.SendMailAsync(mailMessage);
                _logger.LogInformation("Email sent successfully to {ToEmail}", toEmail);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while sending email to {ToEmail}: {Message}", toEmail, ex.Message);
            }
        }
    }
}
