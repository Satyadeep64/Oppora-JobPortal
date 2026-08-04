using Microsoft.AspNetCore.Mvc;
using Oppora.API.DTOs;
using Oppora.API.Interfaces;

namespace Oppora.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class EmailController : ControllerBase
    {
        private readonly IEmailService _emailService;
        private readonly ILogger<EmailController> _logger;

        public EmailController(IEmailService emailService, ILogger<EmailController> logger)
        {
            _emailService = emailService;
            _logger = logger;
        }

        /// <summary>
        /// POST /api/email/test
        /// Dedicated endpoint for testing SMTP connection, Gmail authentication, and App Password functionality.
        /// Sends a test email from opporateam@gmail.com to the recipient email specified in the payload.
        /// </summary>
        [HttpPost("test")]
        public async Task<IActionResult> TestEmail([FromBody] TestEmailRequestDto request)
        {
            string email = (request?.RecipientEmail ?? request?.ToEmail ?? string.Empty).Trim();

            if (string.IsNullOrWhiteSpace(email))
            {
                return BadRequest(new
                {
                    success = false,
                    message = "Recipient email address is required."
                });
            }

            try
            {
                string subject = string.IsNullOrWhiteSpace(request?.Subject)
                    ? "Oppora SMTP Verification Test Email"
                    : request.Subject;

                string htmlBody = $@"
<!DOCTYPE html>
<html lang='en'>
<head>
    <meta charset='utf-8'/>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'/>
    <title>Oppora SMTP Test</title>
</head>
<body style='font-family: -apple-system, BlinkMacSystemFont, ""Segoe UI"", Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px 12px; color: #0f172a; line-height: 1.6;'>
    <table role='presentation' width='100%' border='0' cellspacing='0' cellpadding='0' style='max-width: 550px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.08);'>
        <tr>
            <td style='background: linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%); padding: 30px; text-align: center; color: #ffffff;'>
                <div style='display: inline-block; background: rgba(255,255,255,0.18); border: 1px solid rgba(255,255,255,0.3); padding: 4px 14px; border-radius: 20px; font-weight: 800; font-size: 11px; letter-spacing: 1.2px; text-transform: uppercase; margin-bottom: 10px; color: #ffffff;'>
                    OPPORA SMTP VERIFICATION
                </div>
                <h1 style='margin: 0; font-size: 22px; font-weight: 800; color: #ffffff;'>
                    SMTP Connectivity Test
                </h1>
            </td>
        </tr>
        <tr>
            <td style='padding: 28px 24px;'>
                <p style='margin: 0 0 16px 0; font-size: 14px; color: #0f172a;'>
                    Hello Recruiter / Administrator,
                </p>
                <p style='margin: 0 0 20px 0; font-size: 13.5px; color: #334155;'>
                    This is an automated SMTP verification message dispatched from <strong>opporateam@gmail.com</strong> to confirm that Gmail App Password authentication and port 587 TLS connectivity are operating normally.
                </p>
                <div style='background-color: #f0fdf4; border: 1px solid #bbf7d0; border-left: 4px solid #10b981; border-radius: 8px; padding: 14px 16px; font-size: 13.5px; font-weight: 700; color: #15803d; margin-bottom: 20px;'>
                    ✔ Success: SMTP Connection & Gmail Authentication Succeeded!
                </div>
                <p style='margin: 0; font-size: 12px; color: #64748b;'>
                    Dispatched On: <strong>{DateTime.UtcNow:dddd, MMMM dd, yyyy - HH:mm:ss} UTC</strong>
                </p>
            </td>
        </tr>
        <tr>
            <td style='background-color: #f8fafc; padding: 16px 24px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 12px; color: #64748b;'>
                Oppora Enterprise ATS Email Diagnostic Utility
            </td>
        </tr>
    </table>
</body>
</html>";

                var result = await _emailService.SendEmailAsync(email, "Recruiter", subject, htmlBody);

                if (result.Success)
                {
                    return Ok(new
                    {
                        success = true,
                        message = $"Success: Test email sent successfully from opporateam@gmail.com to {email}.",
                        detail = result.Message,
                        smtpHost = result.SmtpHost,
                        smtpPort = result.SmtpPort
                    });
                }
                else
                {
                    return StatusCode(500, new
                    {
                        success = false,
                        message = result.Message ?? "SMTP delivery failed.",
                        error = result.ErrorMessage ?? result.Message,
                        stackTrace = result.StackTrace,
                        smtpHost = result.SmtpHost,
                        smtpPort = result.SmtpPort
                    });
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[EmailController] SMTP Exception testing email to {Email}", email);
                return StatusCode(500, new
                {
                    success = false,
                    message = "SMTP Exception encountered while sending test email.",
                    error = ex.Message,
                    stackTrace = ex.StackTrace,
                    exceptionDetails = ex.ToString()
                });
            }
        }
    }
}
