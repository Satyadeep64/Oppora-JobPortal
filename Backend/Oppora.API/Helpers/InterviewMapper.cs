using Oppora.API.DTOs;
using Oppora.API.Models;

namespace Oppora.API.Helpers
{
    public static class InterviewMapper
    {
        public static InterviewResponseDto ToDto(this Interview interview)
        {
            if (interview == null) throw new ArgumentNullException(nameof(interview));

            var round = interview.Rounds?.FirstOrDefault();

            string candidateName = !string.IsNullOrWhiteSpace(interview.CandidateName)
                ? interview.CandidateName
                : interview.Candidate?.FullName ?? interview.CustomCandidateName;
            if (string.IsNullOrWhiteSpace(candidateName)) candidateName = "Candidate";

            string candidateEmail = !string.IsNullOrWhiteSpace(interview.CandidateEmail)
                ? interview.CandidateEmail
                : interview.Candidate?.Email ?? interview.CustomCandidateEmail;

            string candidatePhone = !string.IsNullOrWhiteSpace(interview.CandidatePhone)
                ? interview.CandidatePhone
                : interview.CandidateEntity?.Phone ?? interview.CandidateEntity?.PhoneNumber ?? string.Empty;

            string jobTitle = !string.IsNullOrWhiteSpace(interview.JobRole)
                ? interview.JobRole
                : interview.Opportunity?.Title ?? interview.CustomJobTitle;
            if (string.IsNullOrWhiteSpace(jobTitle)) jobTitle = "Direct Interview";

            string companyName = interview.Opportunity?.CompanyName;
            if (string.IsNullOrWhiteSpace(companyName)) companyName = "Oppora Candidate Portal";

            string meetUrl = !string.IsNullOrWhiteSpace(interview.GoogleMeetLink)
                ? interview.GoogleMeetLink
                : round?.MeetingDetails?.MeetingUrl ?? string.Empty;

            return new InterviewResponseDto
            {
                Id = interview.Id,
                ApplicationId = interview.ApplicationId ?? 0,
                RecruiterId = interview.RecruiterId,
                RecruiterName = interview.Recruiter?.FullName ?? string.Empty,
                CandidateId = interview.CandidateId ?? 0,
                CandidateName = candidateName,
                CandidateEmail = candidateEmail ?? string.Empty,
                CandidatePhone = candidatePhone,
                OpportunityId = interview.OpportunityId ?? 0,
                OpportunityTitle = jobTitle,
                JobRole = jobTitle,
                Department = string.IsNullOrWhiteSpace(interview.Department) ? "Engineering" : interview.Department,
                CompanyName = companyName,
                Interviewer = string.IsNullOrWhiteSpace(interview.Interviewer) ? "Recruiter" : interview.Interviewer,
                InterviewRound = string.IsNullOrWhiteSpace(interview.InterviewRound) ? (round?.Title ?? "Technical Round 1") : interview.InterviewRound,
                InterviewType = string.IsNullOrWhiteSpace(interview.InterviewType) ? (round?.InterviewType ?? "Technical") : interview.InterviewType,
                InterviewDate = round?.ScheduledStartTime.Date ?? interview.InterviewDate,
                InterviewTime = round != null ? round.ScheduledStartTime.ToString("hh:mm tt") : interview.InterviewTime,
                Duration = round?.DurationMinutes > 0 ? round.DurationMinutes : (interview.Duration > 0 ? interview.Duration : 45),
                GoogleMeetLink = meetUrl,
                Location = string.IsNullOrWhiteSpace(interview.Location) ? "Online / Google Meet" : interview.Location,
                Notes = interview.RecruiterNotes ?? interview.Notes ?? string.Empty,
                OverallStatus = interview.Status ?? "Scheduled",
                InterviewStatus = interview.Status ?? "Scheduled",
                InvitationStatus = string.IsNullOrWhiteSpace(interview.InvitationStatus) ? (interview.InterviewEmail?.InvitationStatus ?? "Pending") : interview.InvitationStatus,
                CreatedBy = string.IsNullOrWhiteSpace(interview.CreatedBy) ? "Recruiter" : interview.CreatedBy,
                OverallResult = interview.OverallResult,
                SpecialInstructions = interview.RecruiterNotes ?? string.Empty,
                RecruiterNotes = interview.RecruiterNotes ?? string.Empty,
                EmailStatus = interview.InterviewEmail == null ? null : new InterviewEmailDto
                {
                    Id = interview.InterviewEmail.Id,
                    InterviewId = interview.InterviewEmail.InterviewId,
                    RecipientEmail = interview.InterviewEmail.RecipientEmail,
                    Subject = interview.InterviewEmail.Subject,
                    Body = interview.InterviewEmail.Body,
                    InvitationStatus = interview.InterviewEmail.InvitationStatus,
                    SentOn = interview.InterviewEmail.SentOn,
                    ErrorMessage = interview.InterviewEmail.ErrorMessage
                },
                Audits = interview.Audits?.Select(a => new InterviewAuditDto
                {
                    Id = a.Id,
                    InterviewId = a.InterviewId,
                    Action = a.Action,
                    Changes = a.Changes,
                    PerformedBy = a.PerformedBy,
                    PerformedOn = a.PerformedOn
                }).ToList() ?? new List<InterviewAuditDto>(),
                CreatedAt = interview.CreatedAt,
                CreatedOn = interview.CreatedAt,
                UpdatedOn = interview.UpdatedAt,
                Rounds = interview.Rounds?.Select(ToDto).ToList() ?? new List<InterviewRoundResponseDto>()
            };
        }

        public static InterviewRoundResponseDto ToDto(this InterviewRound round)
        {
            if (round == null) throw new ArgumentNullException(nameof(round));

            return new InterviewRoundResponseDto
            {
                Id = round.Id,
                InterviewId = round.InterviewId,
                RoundNumber = round.RoundNumber,
                Title = round.Title,
                Agenda = round.Agenda,
                ScheduledTime = round.ScheduledStartTime,
                DurationMinutes = round.DurationMinutes,
                Status = round.Status,
                MeetingDetails = round.MeetingDetails?.ToDto(),
                Feedbacks = round.Feedbacks?.Select(ToDto).ToList() ?? new List<InterviewFeedbackResponseDto>()
            };
        }

        public static MeetingDetailsResponseDto ToDto(this MeetingDetails meeting)
        {
            if (meeting == null) throw new ArgumentNullException(nameof(meeting));

            return new MeetingDetailsResponseDto
            {
                Id = meeting.Id,
                InterviewRoundId = meeting.InterviewRoundId,
                Provider = meeting.Provider,
                MeetingUrl = meeting.MeetingUrl,
                MeetingId = meeting.MeetingId,
                DurationMinutes = meeting.DurationMinutes,
                TimeZone = meeting.TimeZone,
                ScheduledStartTime = meeting.ScheduledStartTime,
                ScheduledEndTime = meeting.ScheduledEndTime,
                ExternalCalendarEventId = meeting.ExternalCalendarEventId,
                IsActive = meeting.IsActive
            };
        }

        public static InterviewFeedbackResponseDto ToDto(this InterviewFeedback feedback)
        {
            if (feedback == null) throw new ArgumentNullException(nameof(feedback));

            return new InterviewFeedbackResponseDto
            {
                Id = feedback.Id,
                InterviewRoundId = feedback.InterviewRoundId,
                EvaluatorId = feedback.EvaluatorId,
                EvaluatorName = feedback.Evaluator?.FullName ?? "Evaluator",
                OverallRating = feedback.OverallRating,
                TechnicalScore = feedback.TechnicalScore,
                CommunicationScore = feedback.CommunicationScore,
                ProblemSolvingScore = feedback.ProblemSolvingScore,
                Strengths = feedback.Strengths,
                AreasOfImprovement = feedback.AreasOfImprovement,
                Comments = feedback.Comments,
                Recommendation = feedback.Recommendation,
                SubmittedAt = feedback.SubmittedAt
            };
        }

        public static ShortlistedCandidateDto ToShortlistedDto(this Application application)
        {
            if (application == null) throw new ArgumentNullException(nameof(application));

            return new ShortlistedCandidateDto
            {
                ApplicationId = application.Id,
                UserId = application.UserId,
                FullName = application.User?.FullName ?? "Candidate",
                Email = application.User?.Email ?? string.Empty,
                OpportunityId = application.OpportunityId,
                OpportunityTitle = application.Opportunity?.Title ?? string.Empty,
                CompanyName = application.Opportunity?.CompanyName ?? string.Empty,
                Status = application.Status,
                AppliedAt = application.AppliedAt
            };
        }
    }
}
