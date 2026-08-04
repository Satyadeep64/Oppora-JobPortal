using System.Text.RegularExpressions;
using Microsoft.EntityFrameworkCore;
using Oppora.API.Data;
using Oppora.API.DTOs;
using Oppora.API.Interfaces;
using Oppora.API.Models;

namespace Oppora.API.Services
{
    public class MeetingService : IMeetingService
    {
        private readonly AppDbContext _context;

        public MeetingService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<MeetingDetails> CreateMeetingAsync(
            int roundId,
            string provider,
            DateTime startTime,
            DateTime endTime,
            string? customUrl = null,
            string timeZone = "UTC",
            string title = "Interview Round",
            string candidateEmail = "",
            string recruiterEmail = "")
        {
            string url = customUrl?.Trim() ?? string.Empty;
            string meetingId = !string.IsNullOrWhiteSpace(url) ? ExtractMeetingId(url) : string.Empty;

            int duration = (int)(endTime - startTime).TotalMinutes;
            if (duration <= 0) duration = 45;

            var meetingDetails = new MeetingDetails
            {
                InterviewRoundId = roundId,
                Provider = string.IsNullOrWhiteSpace(provider) ? "Google Meet" : provider,
                MeetingUrl = url,
                MeetingId = meetingId,
                ExternalCalendarEventId = string.Empty,
                ScheduledStartTime = startTime,
                ScheduledEndTime = endTime,
                DurationMinutes = duration,
                TimeZone = timeZone,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            return await Task.FromResult(meetingDetails);
        }

        public async Task<MeetingDetailsResponseDto> SaveMeetingAsync(SaveMeetingDetailsDto dto)
        {
            var existing = await _context.MeetingDetails
                .FirstOrDefaultAsync(m => m.InterviewRoundId == dto.InterviewRoundId);

            var endTime = dto.ScheduledStartTime.AddMinutes(dto.DurationMinutes);
            string url = !string.IsNullOrWhiteSpace(dto.CustomMeetingUrl) ? dto.CustomMeetingUrl.Trim() : (dto.MeetingUrl?.Trim() ?? string.Empty);
            string meetingId = ExtractMeetingId(url);

            if (existing != null)
            {
                existing.Provider = string.IsNullOrWhiteSpace(dto.Provider) ? dto.MeetingProvider : dto.Provider;
                existing.MeetingUrl = url;
                existing.MeetingId = meetingId;
                existing.ScheduledStartTime = dto.ScheduledStartTime;
                existing.ScheduledEndTime = endTime;
                existing.DurationMinutes = dto.DurationMinutes;
                existing.TimeZone = dto.TimeZone;
                existing.UpdatedAt = DateTime.UtcNow;

                _context.MeetingDetails.Update(existing);
                await _context.SaveChangesAsync();

                return MapToDto(existing);
            }

            var newMeeting = new MeetingDetails
            {
                InterviewRoundId = dto.InterviewRoundId,
                Provider = string.IsNullOrWhiteSpace(dto.Provider) ? dto.MeetingProvider : dto.Provider,
                MeetingUrl = url,
                MeetingId = meetingId,
                ExternalCalendarEventId = string.Empty,
                ScheduledStartTime = dto.ScheduledStartTime,
                ScheduledEndTime = endTime,
                DurationMinutes = dto.DurationMinutes,
                TimeZone = dto.TimeZone,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            await _context.MeetingDetails.AddAsync(newMeeting);
            await _context.SaveChangesAsync();

            return MapToDto(newMeeting);
        }

        public async Task<MeetingDetailsResponseDto?> GetMeetingByRoundIdAsync(int roundId)
        {
            var meeting = await _context.MeetingDetails
                .FirstOrDefaultAsync(m => m.InterviewRoundId == roundId);

            if (meeting == null) return null;
            return MapToDto(meeting);
        }

        public async Task<MeetingDetailsResponseDto?> UpdateMeetingAsync(int roundId, DateTime newStartTime, DateTime newEndTime, string? newUrl = null, string timeZone = "UTC")
        {
            var meeting = await _context.MeetingDetails
                .FirstOrDefaultAsync(m => m.InterviewRoundId == roundId);

            if (meeting == null) return null;

            meeting.ScheduledStartTime = newStartTime;
            meeting.ScheduledEndTime = newEndTime;
            meeting.DurationMinutes = (int)(newEndTime - newStartTime).TotalMinutes;
            meeting.TimeZone = timeZone;
            if (!string.IsNullOrWhiteSpace(newUrl))
            {
                meeting.MeetingUrl = newUrl.Trim();
                meeting.MeetingId = ExtractMeetingId(newUrl.Trim());
            }
            meeting.UpdatedAt = DateTime.UtcNow;

            _context.MeetingDetails.Update(meeting);
            await _context.SaveChangesAsync();

            return MapToDto(meeting);
        }

        public async Task<bool> CancelMeetingAsync(int roundId)
        {
            var meeting = await _context.MeetingDetails
                .FirstOrDefaultAsync(m => m.InterviewRoundId == roundId);

            if (meeting == null) return true;

            meeting.IsActive = false;
            meeting.UpdatedAt = DateTime.UtcNow;

            _context.MeetingDetails.Update(meeting);
            await _context.SaveChangesAsync();
            return true;
        }

        public string ExtractMeetingId(string meetingUrl)
        {
            if (string.IsNullOrWhiteSpace(meetingUrl)) return string.Empty;

            var match = Regex.Match(meetingUrl, @"meet\.google\.com\/([a-z0-9\-]+)", RegexOptions.IgnoreCase);
            if (match.Success)
            {
                return match.Groups[1].Value;
            }

            var clean = meetingUrl.TrimEnd('/');
            var lastSlash = clean.LastIndexOf('/');
            if (lastSlash >= 0 && lastSlash < clean.Length - 1)
            {
                return clean.Substring(lastSlash + 1);
            }

            return string.Empty;
        }

        public string GenerateGoogleMeetUrl(string title, DateTime startTime)
        {
            return string.Empty;
        }

        private static MeetingDetailsResponseDto MapToDto(MeetingDetails m)
        {
            return new MeetingDetailsResponseDto
            {
                Id = m.Id,
                InterviewRoundId = m.InterviewRoundId,
                Provider = m.Provider,
                MeetingUrl = m.MeetingUrl,
                MeetingId = m.MeetingId,
                DurationMinutes = m.DurationMinutes,
                TimeZone = m.TimeZone,
                ScheduledStartTime = m.ScheduledStartTime,
                ScheduledEndTime = m.ScheduledEndTime,
                ExternalCalendarEventId = m.ExternalCalendarEventId,
                IsActive = m.IsActive
            };
        }
    }
}
