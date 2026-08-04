namespace Oppora.API.Models
{
    /// <summary>
    /// Strongly-typed SMTP configuration bound from appsettings EmailSettings section.
    /// Never hardcode credentials — all values are read from configuration at startup.
    /// </summary>
    public class EmailSettings
    {
        public const string SectionName = "EmailSettings";

        /// <summary>Display name shown in the From header (e.g. "Oppora Recruitment Team").</summary>
        public string SenderName { get; set; } = string.Empty;

        /// <summary>From address (e.g. "opporateam@gmail.com").</summary>
        public string SenderEmail { get; set; } = string.Empty;

        /// <summary>SMTP host (e.g. "smtp.gmail.com").</summary>
        public string SmtpServer { get; set; } = string.Empty;

        /// <summary>SMTP port (587 for TLS / STARTTLS, 465 for SSL).</summary>
        public int Port { get; set; } = 587;

        /// <summary>SMTP authentication username.</summary>
        public string Username { get; set; } = string.Empty;

        /// <summary>SMTP authentication password or App Password.</summary>
        public string Password { get; set; } = string.Empty;

        /// <summary>Whether to use SSL/TLS (STARTTLS on port 587).</summary>
        public bool EnableSsl { get; set; } = true;

        /// <summary>Returns true when all required SMTP fields are configured.</summary>
        public bool IsConfigured =>
            !string.IsNullOrWhiteSpace(SmtpServer) &&
            !string.IsNullOrWhiteSpace(Username) &&
            !string.IsNullOrWhiteSpace(Password) &&
            !string.IsNullOrWhiteSpace(SenderEmail);
    }
}
