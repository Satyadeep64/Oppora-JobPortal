using System.Net;
using System.Net.Mail;
using System.Text;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Oppora.API.Interfaces;
using Oppora.API.Models;

namespace Oppora.API.Services
{
    public class EmailQueueService : IEmailQueueService
    {
        private readonly IInterviewRepository _repository;
        private readonly EmailSettings _settings;
        private readonly ILogger<EmailQueueService> _logger;

        public EmailQueueService(
            IInterviewRepository repository,
            IOptions<EmailSettings> settings,
            ILogger<EmailQueueService> logger)
        {
            _repository = repository;
            _settings = settings.Value;
            _logger = logger;
        }

        public async Task EnqueueEmailAsync(string toEmail, string toName, string subject, string bodyHtml, string? icsContent = null, DateTime? scheduledFor = null)
        {
            var emailQueue = new EmailQueue
            {
                ToEmail = toEmail,
                ToName = toName,
                Subject = subject,
                BodyHtml = bodyHtml,
                IcsCalendarContent = icsContent,
                Status = "Pending",
                IsSent = false,
                RetryCount = 0,
                MaxRetries = 3,
                ScheduledFor = scheduledFor ?? DateTime.UtcNow,
                CreatedAt = DateTime.UtcNow
            };

            await _repository.AddEmailQueueAsync(emailQueue);
            await _repository.SaveChangesAsync();
        }

        public async Task EnqueueInvitationEmailAsync(
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
            string instructions)
        {
            string subject = $"Interview Invitation: {roundTitle} for {jobTitle} at {companyName}";
            string bodyHtml = BuildInvitationHtml(
                candidateName,
                jobTitle,
                companyName,
                interviewDate,
                startTime,
                timeZone,
                roundTitle,
                googleMeetUrl,
                recruiterName,
                instructions
            );

            string icsContent = GenerateIcsCalendarInvite(
                $"{roundTitle}: {jobTitle} - {companyName}",
                $"Join Google Meet: {googleMeetUrl}\nRecruiter: {recruiterName}\nInstructions: {instructions}",
                googleMeetUrl,
                startTime,
                endTime
            );

            // 1. Enqueue Immediate Invitation Email
            await EnqueueEmailAsync(candidateEmail, candidateName, subject, bodyHtml, icsContent, DateTime.UtcNow);

            // 2. Enqueue Future Reminder Email (Scheduled 24 Hours Before Start Time)
            var reminderTime = startTime.AddHours(-24);
            if (reminderTime > DateTime.UtcNow)
            {
                await EnqueueReminderEmailAsync(
                    candidateEmail,
                    candidateName,
                    jobTitle,
                    companyName,
                    interviewDate,
                    startTime,
                    timeZone,
                    roundTitle,
                    googleMeetUrl,
                    recruiterName,
                    reminderTime
                );
            }
        }

        public async Task EnqueueReminderEmailAsync(
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
            DateTime scheduledFor)
        {
            string subject = $"Reminder: Upcoming Interview for {jobTitle} at {companyName}";
            string bodyHtml = BuildReminderHtml(
                candidateName,
                jobTitle,
                companyName,
                interviewDate,
                startTime,
                timeZone,
                roundTitle,
                googleMeetUrl,
                recruiterName
            );

            await EnqueueEmailAsync(candidateEmail, candidateName, subject, bodyHtml, null, scheduledFor);
        }

        public async Task ProcessPendingEmailsAsync()
        {
            var pendingEmails = await _repository.GetPendingEmailsAsync(batchSize: 10);
            if (!pendingEmails.Any()) return;

            if (!_settings.IsConfigured)
            {
                _logger.LogWarning("[EmailQueueService] SMTP not configured — skipping batch dispatch.");
                return;
            }

            foreach (var email in pendingEmails)
            {
                try
                {
                    using var smtpClient = new SmtpClient(_settings.SmtpServer, _settings.Port)
                    {
                        Credentials = new NetworkCredential(_settings.Username, _settings.Password),
                        EnableSsl = _settings.EnableSsl,
                        DeliveryMethod = SmtpDeliveryMethod.Network
                    };

                    using var mailMessage = new MailMessage
                    {
                        From = new MailAddress(_settings.SenderEmail, _settings.SenderName),
                        Subject = email.Subject,
                        Body = email.BodyHtml,
                        IsBodyHtml = true
                    };

                    mailMessage.To.Add(new MailAddress(email.ToEmail, email.ToName));

                    if (!string.IsNullOrEmpty(email.IcsCalendarContent))
                    {
                        byte[] calendarBytes = Encoding.UTF8.GetBytes(email.IcsCalendarContent);
                        var ms = new MemoryStream(calendarBytes);
                        var attachment = new Attachment(ms, "invite.ics", "text/calendar");
                        mailMessage.Attachments.Add(attachment);
                    }

                    await smtpClient.SendMailAsync(mailMessage);

                    email.Status = "Sent";
                    email.IsSent = true;
                    email.SentAt = DateTime.UtcNow;
                    email.ErrorMessage = null;
                    _logger.LogInformation("[EmailQueueService] Sent email to {ToEmail} (ID: {Id})", email.ToEmail, email.Id);
                }
                catch (Exception ex)
                {
                    email.RetryCount++;
                    email.ErrorMessage = ex.Message;
                    email.Status = email.RetryCount >= email.MaxRetries ? "Failed" : "Pending";

                    if (email.Status == "Failed")
                        _logger.LogError("[EmailQueueService] Max retries reached for email ID {Id} — marked Failed.", email.Id);
                    else
                        _logger.LogWarning(ex, "[EmailQueueService] Attempt {Retry}/{Max} failed for {ToEmail}.", email.RetryCount, email.MaxRetries, email.ToEmail);
                }
            }

            await _repository.SaveChangesAsync();
        }

        public string GenerateIcsCalendarInvite(string eventTitle, string description, string location, DateTime startTime, DateTime endTime)
        {
            var sb = new StringBuilder();
            sb.AppendLine("BEGIN:VCALENDAR");
            sb.AppendLine("VERSION:2.0");
            sb.AppendLine("PRODID:-//Oppora Recruitment Platform//EN");
            sb.AppendLine("CALSCALE:GREGORIAN");
            sb.AppendLine("METHOD:REQUEST");
            sb.AppendLine("BEGIN:VEVENT");
            sb.AppendLine($"UID:{Guid.NewGuid()}@oppora.com");
            sb.AppendLine($"DTSTAMP:{DateTime.UtcNow:yyyyMMddTHHmmssZ}");
            sb.AppendLine($"DTSTART:{startTime:yyyyMMddTHHmmssZ}");
            sb.AppendLine($"DTEND:{endTime:yyyyMMddTHHmmssZ}");
            sb.AppendLine($"SUMMARY:{eventTitle}");
            sb.AppendLine($"DESCRIPTION:{description.Replace("\n", "\\n")}");
            sb.AppendLine($"LOCATION:{location}");
            sb.AppendLine("STATUS:CONFIRMED");
            sb.AppendLine("END:VEVENT");
            sb.AppendLine("END:VCALENDAR");

            return sb.ToString();
        }

        private static string BuildInvitationHtml(
            string candidateName,
            string jobTitle,
            string companyName,
            DateTime interviewDate,
            DateTime startTime,
            string timeZone,
            string roundTitle,
            string googleMeetUrl,
            string recruiterName,
            string instructions)
        {
            string candName = System.Web.HttpUtility.HtmlEncode(string.IsNullOrWhiteSpace(candidateName) ? "Candidate" : candidateName);
            string roleStr = System.Web.HttpUtility.HtmlEncode(string.IsNullOrWhiteSpace(jobTitle) ? "Software Engineer" : jobTitle);
            string companyStr = System.Web.HttpUtility.HtmlEncode(string.IsNullOrWhiteSpace(companyName) ? "Oppora" : companyName);
            string roundStr = System.Web.HttpUtility.HtmlEncode(string.IsNullOrWhiteSpace(roundTitle) ? "Interview Round" : roundTitle);
            string recruiterStr = System.Web.HttpUtility.HtmlEncode(string.IsNullOrWhiteSpace(recruiterName) ? "Recruiter" : recruiterName);
            string tzStr = System.Web.HttpUtility.HtmlEncode(string.IsNullOrWhiteSpace(timeZone) ? "UTC" : timeZone);

            var endTime = startTime.AddMinutes(45);
            string dateStr = interviewDate.ToString("dddd, MMMM dd, yyyy");
            string startTimeStr = startTime.ToString("hh:mm tt");
            string endTimeStr = endTime.ToString("hh:mm tt");
            string formattedTime = $"{startTimeStr} - {endTimeStr} ({tzStr})";

            string notesBlock = string.IsNullOrWhiteSpace(instructions)
                ? string.Empty
                : $@"<table role='presentation' width='100%' border='0' cellspacing='0' cellpadding='0' style='margin-bottom: 24px;'>
                        <tr>
                            <td style='background-color: #fefce8; border: 1px solid #fde047; border-radius: 10px; padding: 14px 18px; font-size: 13px; color: #854d0e;'>
                                <strong style='color: #a16207; display: block; margin-bottom: 4px;'>📋 Additional Notes & Instructions:</strong>
                                <span style='color: #713f12; line-height: 1.5;'>{System.Web.HttpUtility.HtmlEncode(instructions)}</span>
                            </td>
                        </tr>
                     </table>";

            string meetUrl = (googleMeetUrl ?? string.Empty).Trim();
            string encodedMeetUrl = System.Web.HttpUtility.HtmlEncode(meetUrl);

            string meetBlock = string.IsNullOrWhiteSpace(meetUrl)
                ? @"<div style='text-align: center; margin: 20px 0; font-size: 13px; color: #64748b;'>
                        Meeting link will be provided separately by your recruiter.
                    </div>"
                : $@"<div style='text-align: center; margin: 28px 0 20px 0;'>
                        <a href='{encodedMeetUrl}' target='_blank' style='display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff !important; font-weight: 800; font-size: 15px; padding: 14px 34px; text-decoration: none; border-radius: 10px; box-shadow: 0 4px 12px rgba(16,185,129,0.35);'>
                            🎥 Join Google Meet
                        </a>
                        <p style='margin: 12px 0 0 0; font-size: 12px; color: #64748b; word-break: break-all; text-align: center;'>
                            Google Meet Link: <a href='{encodedMeetUrl}' target='_blank' style='color: #2563eb; text-decoration: underline;'>{encodedMeetUrl}</a>
                        </p>
                    </div>";

            return $@"<!DOCTYPE html>
<html lang='en'>
<head>
    <meta charset='utf-8'/>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'/>
    <title>Interview Invitation - Oppora</title>
</head>
<body style='font-family: -apple-system, BlinkMacSystemFont, ""Segoe UI"", Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px 12px; color: #0f172a; line-height: 1.6;'>
    <table role='presentation' width='100%' border='0' cellspacing='0' cellpadding='0' style='max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.08);'>
        <!-- Header Banner -->
        <tr>
            <td style='background: linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%); padding: 36px 30px; text-align: center; color: #ffffff;'>
                <div style='display: inline-block; background: rgba(255,255,255,0.18); border: 1px solid rgba(255,255,255,0.3); padding: 5px 16px; border-radius: 20px; font-weight: 800; font-size: 12px; letter-spacing: 1.2px; text-transform: uppercase; margin-bottom: 12px; color: #ffffff;'>
                    OPPORA RECRUITMENT
                </div>
                <h1 style='margin: 0; font-size: 24px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;'>
                    Official Interview Invitation
                </h1>
                <p style='margin: 6px 0 0 0; font-size: 13.5px; opacity: 0.92; color: #e0e7ff;'>
                    You have been selected for an interview. Please find details below.
                </p>
            </td>
        </tr>

        <!-- Main Body Content -->
        <tr>
            <td style='padding: 32px 28px;'>
                <p style='margin: 0 0 16px 0; font-size: 15px; color: #0f172a;'>
                    Dear <strong>{candName}</strong>,
                </p>
                <p style='margin: 0 0 24px 0; font-size: 14px; color: #334155; line-height: 1.6;'>
                    We are pleased to invite you to an interview for the <strong>{roleStr}</strong> position at <strong>{companyStr}</strong>. Please review your interview details below:
                </p>

                <!-- Interview Details Card Table -->
                <table role='presentation' width='100%' border='0' cellspacing='0' cellpadding='0' style='background-color: #f8fafc; border: 1px solid #e2e8f0; border-left: 4px solid #4f46e5; border-radius: 10px; margin-bottom: 24px; border-collapse: separate;'>
                    <tr>
                        <td style='padding: 18px 20px;'>
                            <table role='presentation' width='100%' border='0' cellspacing='0' cellpadding='0'>
                                <tr>
                                    <td style='padding: 8px 0; border-bottom: 1px dashed #cbd5e1; font-size: 13.5px; font-weight: 700; color: #475569;'>Candidate Name</td>
                                    <td style='padding: 8px 0; border-bottom: 1px dashed #cbd5e1; font-size: 13.5px; font-weight: 700; color: #0f172a; text-align: right;'>{candName}</td>
                                </tr>
                                <tr>
                                    <td style='padding: 8px 0; border-bottom: 1px dashed #cbd5e1; font-size: 13.5px; font-weight: 700; color: #475569;'>Job Role</td>
                                    <td style='padding: 8px 0; border-bottom: 1px dashed #cbd5e1; font-size: 13.5px; font-weight: 700; color: #4f46e5; text-align: right;'>{roleStr}</td>
                                </tr>
                                <tr>
                                    <td style='padding: 8px 0; border-bottom: 1px dashed #cbd5e1; font-size: 13.5px; font-weight: 700; color: #475569;'>Interview Round</td>
                                    <td style='padding: 8px 0; border-bottom: 1px dashed #cbd5e1; font-size: 13.5px; font-weight: 700; color: #0f172a; text-align: right;'>{roundStr}</td>
                                </tr>
                                <tr>
                                    <td style='padding: 8px 0; border-bottom: 1px dashed #cbd5e1; font-size: 13.5px; font-weight: 700; color: #475569;'>Interviewer Name</td>
                                    <td style='padding: 8px 0; border-bottom: 1px dashed #cbd5e1; font-size: 13.5px; font-weight: 700; color: #0f172a; text-align: right;'>{recruiterStr}</td>
                                </tr>
                                <tr>
                                    <td style='padding: 8px 0; border-bottom: 1px dashed #cbd5e1; font-size: 13.5px; font-weight: 700; color: #475569;'>Interview Date</td>
                                    <td style='padding: 8px 0; border-bottom: 1px dashed #cbd5e1; font-size: 13.5px; font-weight: 700; color: #0f172a; text-align: right;'>{dateStr}</td>
                                </tr>
                                <tr>
                                    <td style='padding: 8px 0; border-bottom: 1px dashed #cbd5e1; font-size: 13.5px; font-weight: 700; color: #475569;'>Interview Time</td>
                                    <td style='padding: 8px 0; border-bottom: 1px dashed #cbd5e1; font-size: 13.5px; font-weight: 700; color: #0f172a; text-align: right;'>{formattedTime}</td>
                                </tr>
                                <tr>
                                    <td style='padding: 8px 0; font-size: 13.5px; font-weight: 700; color: #475569;'>Duration</td>
                                    <td style='padding: 8px 0; font-size: 13.5px; font-weight: 700; color: #0f172a; text-align: right;'>45 Mins</td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>

                {notesBlock}
                {meetBlock}

                <!-- Signoff -->
                <table role='presentation' width='100%' border='0' cellspacing='0' cellpadding='0' style='margin-top: 28px; padding-top: 20px; border-top: 1px solid #e2e8f0;'>
                    <tr>
                        <td style='font-size: 14px; color: #334155;'>
                            <p style='margin: 0 0 4px 0;'>Regards,</p>
                            <p style='margin: 0; font-weight: 800; color: #4f46e5;'>Oppora Recruitment Team</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>

        <!-- Automated Footer Notice -->
        <tr>
            <td style='background-color: #f8fafc; padding: 20px 28px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 12px; color: #64748b; line-height: 1.5;'>
                This is an automated interview invitation. Please do not reply directly to this email.
            </td>
        </tr>
    </table>
</body>
</html>";
        }

        private static string BuildReminderHtml(
            string candidateName,
            string jobTitle,
            string companyName,
            DateTime interviewDate,
            DateTime startTime,
            string timeZone,
            string roundTitle,
            string googleMeetUrl,
            string recruiterName)
        {
            return $@"
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{ font-family: 'Segoe UI', Arial, sans-serif; background-color: #f4f6f8; margin: 0; padding: 20px; color: #333; }}
        .card {{ max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.08); }}
        .header {{ background: linear-gradient(135deg, #f59e0b, #d97706); color: #ffffff; padding: 25px; text-align: center; }}
        .header h1 {{ margin: 0; font-size: 22px; font-weight: 700; }}
        .content {{ padding: 30px; }}
        .cta-btn {{ display: inline-block; background-color: #10b981; color: #ffffff !important; font-weight: 700; padding: 12px 24px; text-decoration: none; border-radius: 8px; }}
    </style>
</head>
<body>
    <div class='card'>
        <div class='header'>
            <h1>Interview Reminder</h1>
        </div>
        <div class='content'>
            <p>Dear <b>{candidateName}</b>,</p>
            <p>This is a friendly reminder for your upcoming <b>{roundTitle}</b> interview for <b>{jobTitle}</b> at <b>{companyName}</b>.</p>
            <p><b>Date & Time:</b> {interviewDate:dddd, MMMM dd, yyyy} at {startTime:hh:mm tt} ({timeZone})</p>
            <div style='text-align: center; margin: 25px 0;'>
                <a href='{googleMeetUrl}' target='_blank' class='cta-btn'>Join Google Meet</a>
            </div>
        </div>
    </div>
</body>
</html>";
        }
    }
}
