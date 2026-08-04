using System.ComponentModel.DataAnnotations;
using Oppora.API.DTOs;

namespace Oppora.API.Validation
{
    public static class InterviewValidators
    {
        public static List<ValidationResult> ValidateSchedule(ScheduleInterviewDto dto)
        {
            var results = new List<ValidationResult>();

            if (dto == null)
            {
                results.Add(new ValidationResult("Payload cannot be null."));
                return results;
            }

            bool hasApp = dto.ApplicationId.HasValue && dto.ApplicationId.Value > 0;
            bool hasCandidate = dto.CandidateId.HasValue && dto.CandidateId.Value > 0;
            bool hasEmail = !string.IsNullOrWhiteSpace(dto.CandidateEmail);

            if (!hasApp && !hasCandidate && !hasEmail)
            {
                results.Add(new ValidationResult("Candidate details are required (Application ID, Candidate ID, or Candidate Email).", new[] { nameof(dto.CandidateEmail) }));
            }

            if (dto.RecruiterId <= 0)
            {
                results.Add(new ValidationResult("Valid Recruiter ID is required.", new[] { nameof(dto.RecruiterId) }));
            }

            if (dto.ScheduledTime <= DateTime.MinValue)
            {
                results.Add(new ValidationResult("Scheduled time is required.", new[] { nameof(dto.ScheduledTime) }));
            }

            if (dto.DurationMinutes < 15 || dto.DurationMinutes > 240)
            {
                results.Add(new ValidationResult("Duration must be between 15 and 240 minutes.", new[] { nameof(dto.DurationMinutes) }));
            }

            string meetUrl = dto.CustomMeetingUrl ?? dto.GoogleMeetLink ?? string.Empty;
            if (!string.IsNullOrWhiteSpace(meetUrl))
            {
                if (!meetUrl.Trim().StartsWith("https://meet.google.com/", StringComparison.OrdinalIgnoreCase))
                {
                    results.Add(new ValidationResult("Google Meet link must start with 'https://meet.google.com/'.", new[] { nameof(dto.GoogleMeetLink) }));
                }
            }

            return results;
        }

        public static List<ValidationResult> ValidateFeedback(SubmitFeedbackDto dto)
        {
            var results = new List<ValidationResult>();

            if (dto == null)
            {
                results.Add(new ValidationResult("Payload cannot be null."));
                return results;
            }

            if (dto.InterviewRoundId <= 0)
            {
                results.Add(new ValidationResult("Interview Round ID is required.", new[] { nameof(dto.InterviewRoundId) }));
            }

            if (dto.OverallRating < 1 || dto.OverallRating > 5)
            {
                results.Add(new ValidationResult("Overall rating must be between 1 and 5.", new[] { nameof(dto.OverallRating) }));
            }

            if (string.IsNullOrWhiteSpace(dto.Recommendation))
            {
                results.Add(new ValidationResult("Recommendation is required.", new[] { nameof(dto.Recommendation) }));
            }

            return results;
        }
    }
}
