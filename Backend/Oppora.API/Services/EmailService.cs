using System.Net;
using System.Net.Mail;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Oppora.API.DTOs;
using Oppora.API.Interfaces;
using Oppora.API.Models;

namespace Oppora.API.Services
{
    /// <summary>
    /// Production SMTP email service.
    /// Reads all credentials from the injected <see cref="EmailSettings"/> (appsettings EmailSettings section).
    /// No credentials are hardcoded.
    /// </summary>
    public class EmailService : IEmailService
    {
        private readonly EmailSettings _settings;
        private readonly ILogger<EmailService> _logger;
        private readonly Data.AppDbContext _context;

        public EmailService(IOptions<EmailSettings> settings, ILogger<EmailService> logger, Data.AppDbContext context)
        {
            _settings = settings.Value;
            _logger = logger;
            _context = context;
        }

        // ── Public API ────────────────────────────────────────────────────────

        /// <inheritdoc/>
        public async Task<EmailSendResult> SendInterviewEmailFromDbAsync(int interviewId)
        {
            var interview = await _context.Interviews
                .Include(i => i.InterviewEmail)
                .Include(i => i.Audits)
                .Include(i => i.Rounds)
                .FirstOrDefaultAsync(i => i.Id == interviewId);

            if (interview == null)
            {
                return EmailSendResult.Fail($"Interview with ID {interviewId} was not found in the database.");
            }

            string candName = !string.IsNullOrWhiteSpace(interview.CandidateName) ? interview.CandidateName : interview.CustomCandidateName;
            string candEmail = !string.IsNullOrWhiteSpace(interview.CandidateEmail) ? interview.CandidateEmail : interview.CustomCandidateEmail;
            string jobRole = !string.IsNullOrWhiteSpace(interview.JobRole) ? interview.JobRole : interview.CustomJobTitle;

            if (string.IsNullOrWhiteSpace(candEmail))
            {
                return EmailSendResult.Fail("Candidate email address is missing.");
            }

            var request = new SendInvitationRequestDto
            {
                CandidateEmail = candEmail,
                CandidateName = candName,
                JobTitle = string.IsNullOrWhiteSpace(jobRole) ? "Software Engineer" : jobRole,
                CompanyName = "Oppora Recruitment Hub",
                InterviewDate = interview.InterviewDate,
                StartTime = DateTime.TryParse(interview.InterviewTime, out var t) ? t : DateTime.UtcNow,
                EndTime = DateTime.TryParse(interview.InterviewTime, out var t2) ? t2.AddMinutes(interview.Duration > 0 ? interview.Duration : 45) : DateTime.UtcNow.AddMinutes(45),
                TimeZone = "UTC",
                RoundTitle = string.IsNullOrWhiteSpace(interview.InterviewRound) ? "Technical Round 1" : interview.InterviewRound,
                GoogleMeetUrl = interview.GoogleMeetLink ?? string.Empty,
                RecruiterName = string.IsNullOrWhiteSpace(interview.Interviewer) ? "Recruiter Admin" : interview.Interviewer,
                Instructions = interview.Notes ?? interview.RecruiterNotes ?? "Please bring a valid photo ID and join 5 minutes early."
            };

            // Get or Create 1-to-1 InterviewEmail record
            var interviewEmail = interview.InterviewEmail;
            if (interviewEmail == null)
            {
                interviewEmail = new InterviewEmail
                {
                    InterviewId = interview.Id,
                    RecipientEmail = candEmail,
                    Subject = "Interview Scheduled - Oppora",
                    Body = BuildInvitationHtml(request),
                    InvitationStatus = "Pending",
                    CreatedOn = DateTime.UtcNow
                };
                await _context.InterviewEmails.AddAsync(interviewEmail);
            }
            else
            {
                interviewEmail.RecipientEmail = candEmail;
                interviewEmail.Subject = "Interview Scheduled - Oppora";
                interviewEmail.Body = BuildInvitationHtml(request);
            }

            // Attempt SMTP send
            var result = await SendInterviewInvitationAsync(request);

            if (result.Success)
            {
                interviewEmail.InvitationStatus = "Sent";
                interviewEmail.SentOn = DateTime.UtcNow;
                interviewEmail.ErrorMessage = null;
                interview.InvitationStatus = "Sent";

                _context.InterviewAudits.Add(new InterviewAudit
                {
                    InterviewId = interview.Id,
                    Action = "Email Sent",
                    Details = $"Successfully sent invitation email to {candEmail}",
                    Changes = $"Successfully sent invitation email to {candEmail}",
                    PerformedByName = request.RecruiterName,
                    PerformedBy = request.RecruiterName,
                    Timestamp = DateTime.UtcNow,
                    PerformedOn = DateTime.UtcNow
                });

                await _context.SaveChangesAsync();
                return result;
            }
            else
            {
                // Store error without losing interview data, allow retry!
                interviewEmail.InvitationStatus = "Failed";
                interviewEmail.ErrorMessage = result.ErrorMessage ?? result.Message;
                interview.InvitationStatus = "Failed";

                _context.InterviewAudits.Add(new InterviewAudit
                {
                    InterviewId = interview.Id,
                    Action = "Email Failed",
                    Details = $"Email transmission failed: {result.ErrorMessage ?? result.Message}",
                    Changes = $"Email transmission failed: {result.ErrorMessage ?? result.Message}",
                    PerformedByName = request.RecruiterName,
                    PerformedBy = request.RecruiterName,
                    Timestamp = DateTime.UtcNow,
                    PerformedOn = DateTime.UtcNow
                });

                await _context.SaveChangesAsync();
                return result;
            }
        }

        /// <inheritdoc/>
        public async Task<EmailSendResult> SendInterviewInvitationAsync(SendInvitationRequestDto request)
        {
            if (!_settings.IsConfigured)
            {
                _logger.LogWarning("[EmailService] SMTP not configured. Skipping real send for {Email}.", request.CandidateEmail);
                return EmailSendResult.Fail("SMTP credentials are not configured in EmailSettings.");
            }

            string subject = "Interview Scheduled - Oppora";
            string body    = BuildInvitationHtml(request);

            return await SendEmailAsync(request.CandidateEmail, request.CandidateName, subject, body);
        }

        /// <inheritdoc/>
        public async Task<EmailSendResult> SendEmailAsync(string toEmail, string toName, string subject, string htmlBody)
        {
            string host = _settings.SmtpServer ?? "UnknownHost";
            int port = _settings.Port;
            string sender = _settings.SenderEmail ?? "UnknownSender";
            string authStatus = string.IsNullOrWhiteSpace(_settings.Username) || string.IsNullOrWhiteSpace(_settings.Password)
                ? "Unauthenticated (Missing Credentials)"
                : $"Authenticated as {_settings.Username}";

            _logger.LogInformation("[EmailService] SMTP ATTEMPT | Host: {Host}:{Port} | Sender: {Sender} | Recipient: {Recipient} | Subject: {Subject} | Auth: {AuthStatus}",
                host, port, sender, toEmail, subject, authStatus);

            if (!_settings.IsConfigured)
            {
                _logger.LogWarning("[EmailService] SMTP DISPATCH FAILED (Not Configured) | Host: {Host}:{Port} | Sender: {Sender} | Recipient: {Recipient} | Subject: {Subject} | Auth: {AuthStatus} | Success: False | Failure Reason: Missing SMTP credentials",
                    host, port, sender, toEmail, subject, authStatus);

                return new EmailSendResult
                {
                    Success = false,
                    Message = "SMTP credentials are not configured in EmailSettings.",
                    ErrorDetail = "SMTP credentials (Host, Username, Password) are missing or incomplete in settings.",
                    SmtpHost = host,
                    SmtpPort = port,
                    SenderEmail = sender,
                    RecipientEmail = toEmail
                };
            }

            int maxRetries = 3;
            int delayMs = 1000;

            for (int attempt = 1; attempt <= maxRetries; attempt++)
            {
                try
                {
                    using var smtp = BuildSmtpClient();
                    using var message = BuildMailMessage(toEmail, toName, subject, htmlBody);

                    await smtp.SendMailAsync(message);

                    _logger.LogInformation("[EmailService] SMTP DISPATCH SUCCESS | Host: {Host}:{Port} | Sender: {Sender} | Recipient: {Recipient} | Subject: {Subject} | Auth: {AuthStatus} | Success: True | Attempt: {Attempt}",
                        host, port, sender, toEmail, subject, authStatus, attempt);

                    return new EmailSendResult
                    {
                        Success = true,
                        Message = $"Email successfully sent to {toEmail}.",
                        SmtpHost = host,
                        SmtpPort = port,
                        SenderEmail = sender,
                        RecipientEmail = toEmail
                    };
                }
                catch (SmtpException ex) when (attempt < maxRetries)
                {
                    _logger.LogWarning(ex, "[EmailService] SMTP ATTEMPT {Attempt} RETRY | Host: {Host}:{Port} | Sender: {Sender} | Recipient: {Recipient} | Subject: {Subject} | Auth: {AuthStatus} | Success: False | Reason: {Reason}",
                        attempt, host, port, sender, toEmail, subject, authStatus, ex.Message);
                    await Task.Delay(delayMs);
                    delayMs *= 2;
                }
                catch (SmtpException ex)
                {
                    _logger.LogError(ex, "[EmailService] SMTP DISPATCH FAILURE (SmtpException) | Host: {Host}:{Port} | Sender: {Sender} | Recipient: {Recipient} | Subject: {Subject} | Auth: {AuthStatus} | Success: False | Failure Reason: {Reason} | StackTrace: {StackTrace}",
                        host, port, sender, toEmail, subject, authStatus, ex.Message, ex.StackTrace);

                    return new EmailSendResult
                    {
                        Success = false,
                        Message = $"SMTP delivery failed: {ex.Message}",
                        ErrorDetail = ex.Message,
                        StackTrace = ex.StackTrace,
                        SmtpHost = host,
                        SmtpPort = port,
                        SenderEmail = sender,
                        RecipientEmail = toEmail
                    };
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "[EmailService] SMTP DISPATCH FAILURE (Unexpected Exception) | Host: {Host}:{Port} | Sender: {Sender} | Recipient: {Recipient} | Subject: {Subject} | Auth: {AuthStatus} | Success: False | Failure Reason: {Reason} | StackTrace: {StackTrace}",
                        host, port, sender, toEmail, subject, authStatus, ex.Message, ex.StackTrace);

                    return new EmailSendResult
                    {
                        Success = false,
                        Message = $"An unexpected error occurred: {ex.Message}",
                        ErrorDetail = ex.Message,
                        StackTrace = ex.StackTrace,
                        SmtpHost = host,
                        SmtpPort = port,
                        SenderEmail = sender,
                        RecipientEmail = toEmail
                    };
                }
            }

            return new EmailSendResult
            {
                Success = false,
                Message = "SMTP delivery failed after maximum retries.",
                ErrorDetail = "SMTP server did not accept connection.",
                SmtpHost = host,
                SmtpPort = port,
                SenderEmail = sender,
                RecipientEmail = toEmail
            };
        }

        // ── Private Helpers ───────────────────────────────────────────────────

        private SmtpClient BuildSmtpClient()
        {
            return new SmtpClient(_settings.SmtpServer, _settings.Port)
            {
                Credentials = new NetworkCredential(_settings.Username, _settings.Password),
                EnableSsl = _settings.EnableSsl,
                DeliveryMethod = SmtpDeliveryMethod.Network
            };
        }

        private MailMessage BuildMailMessage(string toEmail, string toName, string subject, string htmlBody)
        {
            var message = new MailMessage
            {
                From = new MailAddress(_settings.SenderEmail, _settings.SenderName),
                Subject = subject,
                Body = htmlBody,
                IsBodyHtml = true
            };

            message.To.Add(new MailAddress(toEmail, toName));
            return message;
        }

        // ── HTML Template ─────────────────────────────────────────────────────

        // ── HTML Template ─────────────────────────────────────────────────────

        private static string BuildInvitationHtml(SendInvitationRequestDto r)
        {
            string candName = System.Web.HttpUtility.HtmlEncode(r.CandidateName ?? "Candidate");
            string jobTitle = System.Web.HttpUtility.HtmlEncode(r.JobTitle ?? "Software Engineer");
            string companyName = System.Web.HttpUtility.HtmlEncode(r.CompanyName ?? "Oppora");
            string roundTitle = System.Web.HttpUtility.HtmlEncode(r.RoundTitle ?? "Interview Round");
            string recruiterName = System.Web.HttpUtility.HtmlEncode(r.RecruiterName ?? "Recruiter");
            string timeZoneStr = System.Web.HttpUtility.HtmlEncode(r.TimeZone ?? "UTC");

            int durationMins = r.EndTime > r.StartTime ? (int)(r.EndTime - r.StartTime).TotalMinutes : 45;
            string durationText = $"{durationMins} Mins";

            string dateStr = r.InterviewDate.ToString("dddd, MMMM dd, yyyy");
            string startTimeStr = r.StartTime.ToString("hh:mm tt");
            string endTimeStr = (r.EndTime > r.StartTime ? r.EndTime : r.StartTime.AddMinutes(45)).ToString("hh:mm tt");
            string formattedTime = $"{startTimeStr} - {endTimeStr} ({timeZoneStr})";

            string notesBlock = string.IsNullOrWhiteSpace(r.Instructions)
                ? string.Empty
                : $@"<table role='presentation' width='100%' border='0' cellspacing='0' cellpadding='0' style='margin-bottom: 24px;'>
                        <tr>
                            <td style='background-color: #fefce8; border: 1px solid #fde047; border-radius: 10px; padding: 14px 18px; font-size: 13px; color: #854d0e;'>
                                <strong style='color: #a16207; display: block; margin-bottom: 4px;'>📋 Additional Notes & Instructions:</strong>
                                <span style='color: #713f12; line-height: 1.5;'>{System.Web.HttpUtility.HtmlEncode(r.Instructions)}</span>
                            </td>
                        </tr>
                     </table>";

            string meetUrl = (r.GoogleMeetUrl ?? string.Empty).Trim();
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
                    We are pleased to invite you to an interview for the <strong>{jobTitle}</strong> position at <strong>{companyName}</strong>. Please review your interview details below:
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
                                    <td style='padding: 8px 0; border-bottom: 1px dashed #cbd5e1; font-size: 13.5px; font-weight: 700; color: #4f46e5; text-align: right;'>{jobTitle}</td>
                                </tr>
                                <tr>
                                    <td style='padding: 8px 0; border-bottom: 1px dashed #cbd5e1; font-size: 13.5px; font-weight: 700; color: #475569;'>Interview Round</td>
                                    <td style='padding: 8px 0; border-bottom: 1px dashed #cbd5e1; font-size: 13.5px; font-weight: 700; color: #0f172a; text-align: right;'>{roundTitle}</td>
                                </tr>
                                <tr>
                                    <td style='padding: 8px 0; border-bottom: 1px dashed #cbd5e1; font-size: 13.5px; font-weight: 700; color: #475569;'>Interviewer Name</td>
                                    <td style='padding: 8px 0; border-bottom: 1px dashed #cbd5e1; font-size: 13.5px; font-weight: 700; color: #0f172a; text-align: right;'>{recruiterName}</td>
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
                                    <td style='padding: 8px 0; font-size: 13.5px; font-weight: 700; color: #0f172a; text-align: right;'>{durationText}</td>
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
    }
}
