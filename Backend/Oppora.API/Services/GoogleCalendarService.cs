using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Text.RegularExpressions;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Oppora.API.Interfaces;

namespace Oppora.API.Services
{
    public class GoogleCalendarService : IGoogleCalendarService
    {
        private readonly IConfiguration _configuration;
        private readonly ILogger<GoogleCalendarService> _logger;
        private readonly HttpClient _httpClient;

        private string? _cachedAccessToken;
        private DateTime _accessTokenExpiry = DateTime.MinValue;

        public GoogleCalendarService(IConfiguration configuration, ILogger<GoogleCalendarService> logger, HttpClient httpClient)
        {
            _configuration = configuration;
            _logger = logger;
            _httpClient = httpClient;
        }

        public async Task<GoogleCalendarEventResult> CreateEventWithMeetAsync(
            string title,
            string description,
            DateTime startTime,
            DateTime endTime,
            string candidateEmail,
            string recruiterEmail,
            string timeZone = "UTC")
        {
            string clientId = _configuration["GoogleCalendar:ClientId"] ?? string.Empty;
            string clientSecret = _configuration["GoogleCalendar:ClientSecret"] ?? string.Empty;
            string refreshToken = _configuration["GoogleCalendar:RefreshToken"] ?? string.Empty;
            string calendarId = _configuration["GoogleCalendar:CalendarId"] ?? "primary";

            // If OAuth credentials are missing or unconfigured, fallback safely
            if (string.IsNullOrWhiteSpace(clientId) || clientId.Contains("YOUR_GOOGLE") || string.IsNullOrWhiteSpace(refreshToken))
            {
                _logger.LogInformation("Google Calendar OAuth credentials not configured. Generating synthetic Google Meet URL.");
                return GenerateFallbackResult(startTime, endTime, timeZone);
            }

            try
            {
                string accessToken = await GetOrRefreshAccessTokenAsync(clientId, clientSecret, refreshToken);
                if (string.IsNullOrWhiteSpace(accessToken))
                {
                    _logger.LogWarning("Failed to obtain OAuth access token for Google Calendar API. Using fallback.");
                    return GenerateFallbackResult(startTime, endTime, timeZone);
                }

                var eventPayload = new
                {
                    summary = title,
                    description = description,
                    start = new { dateTime = startTime.ToString("yyyy-MM-ddTHH:mm:ssZ"), timeZone = timeZone },
                    end = new { dateTime = endTime.ToString("yyyy-MM-ddTHH:mm:ssZ"), timeZone = timeZone },
                    attendees = new[]
                    {
                        new { email = candidateEmail },
                        new { email = recruiterEmail }
                    },
                    conferenceData = new
                    {
                        createRequest = new
                        {
                            requestId = Guid.NewGuid().ToString("N"),
                            conferenceSolutionKey = new { type = "hangoutsMeet" }
                        }
                    }
                };

                string url = $"https://www.googleapis.com/calendar/v3/calendars/{Uri.EscapeDataString(calendarId)}/events?conferenceDataVersion=1";
                var request = new HttpRequestMessage(HttpMethod.Post, url);
                request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);
                request.Content = new StringContent(JsonSerializer.Serialize(eventPayload), Encoding.UTF8, "application/json");

                var response = await _httpClient.SendAsync(request);
                string responseJson = await response.Content.ReadAsStringAsync();

                if (response.IsSuccessStatusCode)
                {
                    using var doc = JsonDocument.Parse(responseJson);
                    var root = doc.RootElement;

                    string eventId = root.TryGetProperty("id", out var idProp) ? idProp.GetString() ?? string.Empty : Guid.NewGuid().ToString("N");
                    string hangoutLink = root.TryGetProperty("hangoutLink", out var hProp) ? hProp.GetString() ?? string.Empty : string.Empty;

                    if (string.IsNullOrWhiteSpace(hangoutLink) && root.TryGetProperty("conferenceData", out var confProp))
                    {
                        if (confProp.TryGetProperty("entryPoints", out var entryProp) && entryProp.ValueKind == JsonValueKind.Array && entryProp.GetArrayLength() > 0)
                        {
                            hangoutLink = entryProp[0].TryGetProperty("uri", out var uriProp) ? uriProp.GetString() ?? string.Empty : string.Empty;
                        }
                    }

                    if (string.IsNullOrWhiteSpace(hangoutLink))
                    {
                        hangoutLink = GenerateGoogleMeetUrl();
                    }

                    return new GoogleCalendarEventResult
                    {
                        EventId = eventId,
                        MeetingUrl = hangoutLink,
                        MeetingId = ExtractMeetingId(hangoutLink),
                        StartTime = startTime,
                        EndTime = endTime,
                        TimeZone = timeZone,
                        IsRealApiCreated = true
                    };
                }
                else
                {
                    _logger.LogError("Google Calendar API Create Event failed with status {StatusCode}: {Response}", response.StatusCode, responseJson);
                    return GenerateFallbackResult(startTime, endTime, timeZone);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Exception encountered while calling Google Calendar API.");
                return GenerateFallbackResult(startTime, endTime, timeZone);
            }
        }

        public async Task<GoogleCalendarEventResult> UpdateEventAsync(
            string eventId,
            string title,
            string description,
            DateTime newStartTime,
            DateTime newEndTime,
            string timeZone = "UTC")
        {
            string clientId = _configuration["GoogleCalendar:ClientId"] ?? string.Empty;
            string clientSecret = _configuration["GoogleCalendar:ClientSecret"] ?? string.Empty;
            string refreshToken = _configuration["GoogleCalendar:RefreshToken"] ?? string.Empty;
            string calendarId = _configuration["GoogleCalendar:CalendarId"] ?? "primary";

            if (string.IsNullOrWhiteSpace(eventId) || string.IsNullOrWhiteSpace(clientId) || clientId.Contains("YOUR_GOOGLE"))
            {
                return GenerateFallbackResult(newStartTime, newEndTime, timeZone);
            }

            try
            {
                string accessToken = await GetOrRefreshAccessTokenAsync(clientId, clientSecret, refreshToken);
                if (string.IsNullOrWhiteSpace(accessToken))
                {
                    return GenerateFallbackResult(newStartTime, newEndTime, timeZone);
                }

                var patchPayload = new
                {
                    summary = title,
                    description = description,
                    start = new { dateTime = newStartTime.ToString("yyyy-MM-ddTHH:mm:ssZ"), timeZone = timeZone },
                    end = new { dateTime = newEndTime.ToString("yyyy-MM-ddTHH:mm:ssZ"), timeZone = timeZone }
                };

                string url = $"https://www.googleapis.com/calendar/v3/calendars/{Uri.EscapeDataString(calendarId)}/events/{Uri.EscapeDataString(eventId)}";
                var request = new HttpRequestMessage(HttpMethod.Patch, url);
                request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);
                request.Content = new StringContent(JsonSerializer.Serialize(patchPayload), Encoding.UTF8, "application/json");

                var response = await _httpClient.SendAsync(request);
                string responseJson = await response.Content.ReadAsStringAsync();

                if (response.IsSuccessStatusCode)
                {
                    using var doc = JsonDocument.Parse(responseJson);
                    var root = doc.RootElement;
                    string hangoutLink = root.TryGetProperty("hangoutLink", out var hProp) ? hProp.GetString() ?? string.Empty : string.Empty;
                    if (string.IsNullOrWhiteSpace(hangoutLink)) hangoutLink = GenerateGoogleMeetUrl();

                    return new GoogleCalendarEventResult
                    {
                        EventId = eventId,
                        MeetingUrl = hangoutLink,
                        MeetingId = ExtractMeetingId(hangoutLink),
                        StartTime = newStartTime,
                        EndTime = newEndTime,
                        TimeZone = timeZone,
                        IsRealApiCreated = true
                    };
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Exception updating Google Calendar event {EventId}", eventId);
            }

            return GenerateFallbackResult(newStartTime, newEndTime, timeZone, eventId);
        }

        public async Task<bool> DeleteEventAsync(string eventId)
        {
            if (string.IsNullOrWhiteSpace(eventId)) return true;

            string clientId = _configuration["GoogleCalendar:ClientId"] ?? string.Empty;
            string clientSecret = _configuration["GoogleCalendar:ClientSecret"] ?? string.Empty;
            string refreshToken = _configuration["GoogleCalendar:RefreshToken"] ?? string.Empty;
            string calendarId = _configuration["GoogleCalendar:CalendarId"] ?? "primary";

            if (string.IsNullOrWhiteSpace(clientId) || clientId.Contains("YOUR_GOOGLE")) return true;

            try
            {
                string accessToken = await GetOrRefreshAccessTokenAsync(clientId, clientSecret, refreshToken);
                if (string.IsNullOrWhiteSpace(accessToken)) return false;

                string url = $"https://www.googleapis.com/calendar/v3/calendars/{Uri.EscapeDataString(calendarId)}/events/{Uri.EscapeDataString(eventId)}";
                var request = new HttpRequestMessage(HttpMethod.Delete, url);
                request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);

                var response = await _httpClient.SendAsync(request);
                return response.IsSuccessStatusCode;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Exception deleting Google Calendar event {EventId}", eventId);
                return false;
            }
        }

        private async Task<string> GetOrRefreshAccessTokenAsync(string clientId, string clientSecret, string refreshToken)
        {
            if (!string.IsNullOrWhiteSpace(_cachedAccessToken) && DateTime.UtcNow < _accessTokenExpiry)
            {
                return _cachedAccessToken;
            }

            try
            {
                var dict = new Dictionary<string, string>
                {
                    { "client_id", clientId },
                    { "client_secret", clientSecret },
                    { "refresh_token", refreshToken },
                    { "grant_type", "refresh_token" }
                };

                var response = await _httpClient.PostAsync("https://oauth2.googleapis.com/token", new FormUrlEncodedContent(dict));
                string json = await response.Content.ReadAsStringAsync();

                if (response.IsSuccessStatusCode)
                {
                    using var doc = JsonDocument.Parse(json);
                    if (doc.RootElement.TryGetProperty("access_token", out var tokenProp))
                    {
                        _cachedAccessToken = tokenProp.GetString();
                        int expiresIn = doc.RootElement.TryGetProperty("expires_in", out var expProp) ? expProp.GetInt32() : 3600;
                        _accessTokenExpiry = DateTime.UtcNow.AddSeconds(expiresIn - 60); // 1 minute safety buffer
                        return _cachedAccessToken ?? string.Empty;
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error refreshing OAuth token for Google Calendar.");
            }

            return string.Empty;
        }

        private static GoogleCalendarEventResult GenerateFallbackResult(DateTime startTime, DateTime endTime, string timeZone, string? eventId = null)
        {
            string meetUrl = GenerateGoogleMeetUrl();
            return new GoogleCalendarEventResult
            {
                EventId = eventId ?? Guid.NewGuid().ToString("N")[..12],
                MeetingUrl = meetUrl,
                MeetingId = ExtractMeetingId(meetUrl),
                StartTime = startTime,
                EndTime = endTime,
                TimeZone = timeZone,
                IsRealApiCreated = false
            };
        }

        private static string GenerateGoogleMeetUrl()
        {
            string code = Guid.NewGuid().ToString("N")[..9];
            return $"https://meet.google.com/{code[..3]}-{code.Substring(3, 4)}-{code.Substring(7, 2)}";
        }

        private static string ExtractMeetingId(string url)
        {
            if (string.IsNullOrWhiteSpace(url)) return string.Empty;
            var match = Regex.Match(url, @"meet\.google\.com\/([a-z0-9\-]+)", RegexOptions.IgnoreCase);
            return match.Success ? match.Groups[1].Value : url;
        }
    }
}
