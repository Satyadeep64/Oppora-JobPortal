using Microsoft.EntityFrameworkCore;
using Oppora.API.Data;
using Oppora.API.DTOs;
using Oppora.API.Helpers;
using Oppora.API.Interfaces;
using Oppora.API.Models;

namespace Oppora.API.Services
{
    public class InterviewService : IInterviewService
    {
        private readonly IInterviewRepository _repository;
        private readonly IMeetingService _meetingService;
        private readonly INotificationService _notificationService;
        private readonly IEmailService _emailService;
        private readonly AppDbContext _context;
        private readonly ILogger<InterviewService> _logger;

        public InterviewService(
            IInterviewRepository repository,
            IMeetingService meetingService,
            INotificationService notificationService,
            IEmailService emailService,
            AppDbContext context,
            ILogger<InterviewService> logger)
        {
            _repository = repository;
            _meetingService = meetingService;
            _notificationService = notificationService;
            _emailService = emailService;
            _context = context;
            _logger = logger;
        }

        // ── Queries ───────────────────────────────────────────────────────────

        public async Task<IEnumerable<InterviewResponseDto>> GetAllInterviewsAsync(int? recruiterId = null, string? status = null)
        {
            try
            {
                var query = BuildBaseInterviewQuery();

                if (recruiterId is > 0)
                    query = query.Where(i => i.RecruiterId == recruiterId.Value);

                if (!string.IsNullOrWhiteSpace(status))
                    query = query.Where(i => i.OverallStatus.ToLower() == status.ToLower());

                var list = await query.OrderByDescending(i => i.CreatedAt).ToListAsync();
                return list.Select(i => i.ToDto());
            }
            catch (Exception)
            {
                return Enumerable.Empty<InterviewResponseDto>();
            }
        }

        public async Task<IEnumerable<InterviewResponseDto>> GetInterviewsByRecruiterAsync(int recruiterId)
        {
            return await GetAllInterviewsAsync(recruiterId);
        }

        public async Task<InterviewResponseDto?> GetInterviewByIdAsync(int id)
        {
            try
            {
                var interview = await _repository.GetInterviewDetailsAsync(id);
                return interview?.ToDto();
            }
            catch (Exception)
            {
                return null;
            }
        }

        public async Task<IEnumerable<InterviewResponseDto>> GetCandidateInterviewsAsync(int candidateId)
        {
            try
            {
                var list = await _repository.GetInterviewsByCandidateAsync(candidateId);
                return list.Select(i => i.ToDto());
            }
            catch (Exception)
            {
                return Enumerable.Empty<InterviewResponseDto>();
            }
        }

        public async Task<IEnumerable<InterviewResponseDto>> GetUpcomingInterviewsAsync(int? recruiterId = null, int? candidateId = null)
        {
            try
            {
                var now = DateTime.UtcNow;
                var query = BuildBaseInterviewQuery()
                    .Where(i => i.OverallStatus != "Cancelled" && i.Rounds.Any(r => r.ScheduledStartTime >= now));

                if (recruiterId is > 0) query = query.Where(i => i.RecruiterId == recruiterId.Value);
                if (candidateId is > 0) query = query.Where(i => i.CandidateId == candidateId.Value);

                var list = await query.OrderBy(i => i.Rounds.Min(r => r.ScheduledStartTime)).ToListAsync();
                return list.Select(i => i.ToDto());
            }
            catch (Exception)
            {
                return Enumerable.Empty<InterviewResponseDto>();
            }
        }

        public async Task<IEnumerable<CalendarEventDto>> GetCalendarEventsAsync(int? recruiterId = null, int? candidateId = null)
        {
            try
            {
                var query = BuildBaseInterviewQuery();
                if (recruiterId is > 0) query = query.Where(i => i.RecruiterId == recruiterId.Value);
                if (candidateId is > 0) query = query.Where(i => i.CandidateId == candidateId.Value);

                var interviews = await query.ToListAsync();
                return interviews.SelectMany(BuildCalendarEvents);
            }
            catch (Exception)
            {
                return Enumerable.Empty<CalendarEventDto>();
            }
        }

        public async Task<IEnumerable<ShortlistedCandidateDto>> GetShortlistedCandidatesAsync(int recruiterId)
        {
            var applications = await _repository.GetShortlistedApplicationsAsync(recruiterId);
            return applications.Select(a => new ShortlistedCandidateDto
            {
                ApplicationId = a.Id,
                OpportunityId = a.OpportunityId,
                UserId = a.UserId,
                FullName = a.User?.FullName ?? "Candidate",
                Email = a.User?.Email ?? string.Empty,
                OpportunityTitle = a.Opportunity?.Title ?? "Open Role",
                CompanyName = a.Opportunity?.CompanyName ?? "Oppora Hub",
                Status = a.Status,
                AppliedAt = a.AppliedAt
            });
        }

        public async Task<IEnumerable<CandidateDirectoryDto>> SearchCandidatesAsync(string? query)
        {
            var users = await _repository.SearchCandidateUsersAsync(query ?? string.Empty, limit: 20);
            return users.Select(u => new CandidateDirectoryDto
            {
                UserId = u.Id,
                FullName = u.FullName,
                Email = u.Email,
                Role = u.Role,
                RecentJobTitle = "Applicant"
            });
        }

        // ── Mutations ─────────────────────────────────────────────────────────

        public async Task<InterviewResponseDto> ScheduleInterviewAsync(ScheduleInterviewDto dto)
        {
            var application = dto.ApplicationId > 0
                ? await _repository.GetApplicationWithIncludesAsync(dto.ApplicationId!.Value)
                : null;

            var candidateUser = application == null && dto.CandidateId > 0
                ? await _repository.GetCandidateUserAsync(dto.CandidateId!.Value)
                : null;

            var interview = await ResolveOrCreateInterviewAsync(dto, application, candidateUser);
            await _repository.SaveChangesAsync();

            var endTime = dto.ScheduledTime.AddMinutes(dto.DurationMinutes);
            var round = BuildInterviewRound(interview.Id, dto, endTime);
            await _repository.AddRoundAsync(round);
            await _repository.SaveChangesAsync();

            string candidateEmail = application?.User?.Email ?? candidateUser?.Email ?? dto.CandidateEmail ?? string.Empty;
            string recruiterEmail = application?.Opportunity?.Recruiter?.Email ?? "recruiter@oppora.com";
            string candidateName = application?.User?.FullName ?? candidateUser?.FullName ?? dto.CandidateName ?? "Candidate";
            string jobTitle = application?.Opportunity?.Title ?? dto.CustomJobTitle ?? "Direct Interview";
            string company = application?.Opportunity?.CompanyName ?? "Oppora Recruitment Hub";

            var meeting = await _meetingService.CreateMeetingAsync(
                round.Id, dto.MeetingProvider, dto.ScheduledTime, endTime,
                dto.CustomMeetingUrl ?? dto.GoogleMeetLink, "UTC",
                $"{dto.RoundTitle} - {candidateName}", candidateEmail, recruiterEmail);

            await _repository.AddMeetingDetailsAsync(meeting);

            interview.GoogleMeetLink = meeting.MeetingUrl;

            try
            {
                // Audit record for Creation
                var audit = new InterviewAudit
                {
                    InterviewId = interview.Id,
                    Action = "Interview Created",
                    Changes = $"Created interview for candidate {candidateName} ({jobTitle})",
                    PerformedBy = string.IsNullOrWhiteSpace(dto.CreatedBy) ? "Recruiter" : dto.CreatedBy,
                    PerformedOn = DateTime.UtcNow,
                    Timestamp = DateTime.UtcNow
                };
                await _context.Set<InterviewAudit>().AddAsync(audit);
                await _context.SaveChangesAsync();

                if (application != null)
                {
                    application.Status = "Interview Scheduled";
                    _context.Applications.Update(application);
                    await _context.SaveChangesAsync();
                }

                // ── Automatic Email Dispatch Workflow ─────────────────────────────
                try
                {
                    var emailResult = await _emailService.SendInterviewEmailFromDbAsync(interview.Id);
                    if (!emailResult.Success)
                    {
                        _logger.LogWarning("[InterviewService] Auto email warning for interview {InterviewId}: {Message} Details: {Error}", interview.Id, emailResult.Message, emailResult.ErrorMessage);
                    }
                }
                catch (Exception emailEx)
                {
                    _logger.LogError(emailEx, "[InterviewService] Auto email exception for interview {InterviewId}", interview.Id);
                    interview.InvitationStatus = "Failed";
                    var existingEmail = await _context.Set<InterviewEmail>().FirstOrDefaultAsync(e => e.InterviewId == interview.Id);
                    if (existingEmail != null)
                    {
                        existingEmail.InvitationStatus = "Failed";
                        existingEmail.ErrorMessage = emailEx.Message;
                    }
                    await _context.SaveChangesAsync();
                }

                return await GetInterviewByIdAsync(interview.Id)
                    ?? throw new InvalidOperationException("Failed to retrieve the created interview.");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[InterviewService] Post-creation warning: {ex.Message}");
                return await GetInterviewByIdAsync(interview.Id)
                    ?? throw new InvalidOperationException("Failed to retrieve the created interview.");
            }
        }

        public async Task<InterviewRoundResponseDto> AddRoundAsync(CreateInterviewRoundDto dto)
        {
            var interview = await _repository.GetInterviewDetailsAsync(dto.InterviewId)
                ?? throw new KeyNotFoundException("Interview not found.");

            int roundNumber = (interview.Rounds?.Count ?? 0) + 1;
            var endTime = dto.ScheduledTime.AddMinutes(dto.DurationMinutes);

            var round = new InterviewRound
            {
                InterviewId = dto.InterviewId,
                RoundNumber = dto.RoundNumber > 0 ? dto.RoundNumber : roundNumber,
                Title = dto.Title,
                Agenda = dto.Agenda,
                InterviewDate = dto.ScheduledTime.Date,
                ScheduledStartTime = dto.ScheduledTime,
                ScheduledEndTime = endTime,
                DurationMinutes = dto.DurationMinutes,
                Status = "Scheduled",
                CreatedAt = DateTime.UtcNow
            };

            await _repository.AddRoundAsync(round);
            await _repository.SaveChangesAsync();

            var meeting = await _meetingService.CreateMeetingAsync(
                round.Id, dto.MeetingProvider, dto.ScheduledTime, endTime,
                dto.CustomMeetingUrl, "UTC",
                $"{dto.Title} - {interview.Candidate?.FullName ?? interview.CustomCandidateName}",
                interview.Candidate?.Email ?? interview.CustomCandidateEmail ?? string.Empty,
                interview.Recruiter?.Email ?? "recruiter@oppora.com");

            await _repository.AddMeetingDetailsAsync(meeting);
            round.MeetingDetails = meeting;

            return round.ToDto();
        }

        public async Task<InterviewResponseDto> UpdateInterviewAsync(int interviewId, UpdateInterviewDto dto)
        {
            var interview = await _repository.GetInterviewDetailsAsync(interviewId)
                ?? throw new KeyNotFoundException("Interview not found.");

            if (!string.IsNullOrWhiteSpace(dto.OverallStatus)) interview.Status = dto.OverallStatus;
            if (!string.IsNullOrWhiteSpace(dto.Status)) interview.Status = dto.Status;
            if (!string.IsNullOrWhiteSpace(dto.CandidateName)) interview.CandidateName = dto.CandidateName;
            if (!string.IsNullOrWhiteSpace(dto.CandidateEmail)) interview.CandidateEmail = dto.CandidateEmail;
            if (!string.IsNullOrWhiteSpace(dto.CandidatePhone)) interview.CandidatePhone = dto.CandidatePhone;
            if (!string.IsNullOrWhiteSpace(dto.JobRole)) interview.JobRole = dto.JobRole;
            if (!string.IsNullOrWhiteSpace(dto.Interviewer)) interview.Interviewer = dto.Interviewer;
            if (!string.IsNullOrWhiteSpace(dto.InterviewRound)) interview.InterviewRound = dto.InterviewRound;
            if (!string.IsNullOrWhiteSpace(dto.GoogleMeetLink)) interview.GoogleMeetLink = dto.GoogleMeetLink;
            if (!string.IsNullOrWhiteSpace(dto.Notes)) interview.Notes = dto.Notes;
            if (!string.IsNullOrWhiteSpace(dto.RecruiterNotes)) interview.Notes = dto.RecruiterNotes;
            interview.UpdatedAt = DateTime.UtcNow;

            _repository.Update(interview);
            await _repository.SaveChangesAsync();

            return interview.ToDto();
        }

        public async Task<InterviewResponseDto> RescheduleInterviewAsync(int interviewId, RescheduleInterviewDto dto)
        {
            var interview = await _repository.GetInterviewDetailsAsync(interviewId)
                ?? throw new KeyNotFoundException("Interview not found.");

            string oldDateStr = interview.InterviewDate.ToString("yyyy-MM-dd");
            string oldTimeStr = interview.InterviewTime ?? "N/A";
            string oldInterviewer = interview.Interviewer ?? "N/A";
            string oldRound = interview.InterviewRound ?? "N/A";
            string oldMeetLink = string.IsNullOrWhiteSpace(interview.GoogleMeetLink) ? "None" : interview.GoogleMeetLink;

            string newMeetLink = !string.IsNullOrWhiteSpace(dto.GoogleMeetLink)
                ? dto.GoogleMeetLink
                : (!string.IsNullOrWhiteSpace(dto.NewMeetingUrl) ? dto.NewMeetingUrl : interview.GoogleMeetLink);

            var latestRound = interview.Rounds.OrderByDescending(r => r.RoundNumber).FirstOrDefault();
            if (latestRound != null)
            {
                var newEndTime = dto.NewScheduledTime.AddMinutes(dto.DurationMinutes);
                latestRound.ScheduledStartTime = dto.NewScheduledTime;
                latestRound.ScheduledEndTime = newEndTime;
                latestRound.DurationMinutes = dto.DurationMinutes;
                latestRound.InterviewDate = dto.NewScheduledTime.Date;
                latestRound.Status = "Rescheduled";

                if (!string.IsNullOrWhiteSpace(dto.InterviewRound))
                {
                    latestRound.Title = dto.InterviewRound;
                }

                await _meetingService.UpdateMeetingAsync(latestRound.Id, dto.NewScheduledTime, newEndTime, newMeetLink, latestRound.TimeZone);
            }

            interview.Status = "Rescheduled";
            interview.InterviewDate = dto.NewScheduledTime.Date;
            interview.InterviewTime = !string.IsNullOrWhiteSpace(dto.InterviewTime) ? dto.InterviewTime : dto.NewScheduledTime.ToString("hh:mm tt");
            interview.Duration = dto.DurationMinutes;

            if (!string.IsNullOrWhiteSpace(dto.Interviewer))
            {
                interview.Interviewer = dto.Interviewer;
            }
            if (!string.IsNullOrWhiteSpace(dto.InterviewRound))
            {
                interview.InterviewRound = dto.InterviewRound;
            }
            if (!string.IsNullOrWhiteSpace(newMeetLink))
            {
                interview.GoogleMeetLink = newMeetLink;
            }

            interview.UpdatedAt = DateTime.UtcNow;

            // ── Record Detailed Activity Audit Log ─────────────────────────────────
            string recruiterName = !string.IsNullOrWhiteSpace(dto.RecruiterName) ? dto.RecruiterName : "Recruiter Admin";
            var audit = new InterviewAudit
            {
                InterviewId = interview.Id,
                Action = "Interview Rescheduled",
                Details = $"Rescheduled from {oldDateStr} at {oldTimeStr} to {interview.InterviewDate:yyyy-MM-dd} at {interview.InterviewTime}",
                OldValue = $"Date: {oldDateStr}, Time: {oldTimeStr}, Link: {oldMeetLink}, Interviewer: {oldInterviewer}, Round: {oldRound}",
                NewValue = $"Date: {interview.InterviewDate:yyyy-MM-dd}, Time: {interview.InterviewTime}, Link: {interview.GoogleMeetLink}, Interviewer: {interview.Interviewer}, Round: {interview.InterviewRound}",
                Changes = $"Old Date: {oldDateStr} | New Date: {interview.InterviewDate:yyyy-MM-dd} | Old Time: {oldTimeStr} | New Time: {interview.InterviewTime} | Old Meet Link: {oldMeetLink} | New Meet Link: {interview.GoogleMeetLink}",
                PerformedByName = recruiterName,
                PerformedBy = recruiterName,
                Timestamp = DateTime.UtcNow,
                PerformedOn = DateTime.UtcNow
            };

            await _context.Set<InterviewAudit>().AddAsync(audit);
            await _repository.SaveChangesAsync();

            // ── Send Updated Confirmation Email ────────────────────────────────────
            try
            {
                var emailResult = await _emailService.SendInterviewEmailFromDbAsync(interview.Id);
                if (!emailResult.Success)
                {
                    Console.WriteLine($"[InterviewService] Reschedule email warning for interview {interview.Id}: {emailResult.Message}");
                }
            }
            catch (Exception emailEx)
            {
                Console.WriteLine($"[InterviewService] Reschedule email exception for interview {interview.Id}: {emailEx.Message}");
            }

            return await GetInterviewByIdAsync(interview.Id) ?? interview.ToDto();
        }

        public async Task<InterviewResponseDto> CancelInterviewAsync(int interviewId, CancelInterviewDto? dto = null)
        {
            var interview = await _repository.GetInterviewDetailsAsync(interviewId)
                ?? throw new KeyNotFoundException("Interview not found.");

            string reason = dto?.Reason ?? "Cancelled by recruiter";
            interview.Status = "Cancelled";
            interview.Notes = string.IsNullOrWhiteSpace(interview.Notes)
                ? $"Cancellation Reason: {reason}"
                : $"{interview.Notes}\nCancellation Reason: {reason}";
            interview.UpdatedAt = DateTime.UtcNow;

            if (interview.Rounds != null)
            {
                foreach (var round in interview.Rounds)
                {
                    round.Status = "Cancelled";
                    await _meetingService.CancelMeetingAsync(round.Id);
                }
            }

            await _repository.SaveChangesAsync();
            return interview.ToDto();
        }

        public async Task<bool> DeleteInterviewAsync(int interviewId)
        {
            var interview = await _context.Set<Interview>()
                .Include(i => i.Rounds).ThenInclude(r => r.MeetingDetails)
                .Include(i => i.Rounds).ThenInclude(r => r.Feedbacks)
                .Include(i => i.Notifications)
                .Include(i => i.Audits)
                .FirstOrDefaultAsync(i => i.Id == interviewId);

            if (interview == null)
                return false;

            if (interview.Rounds != null && interview.Rounds.Any())
            {
                foreach (var r in interview.Rounds)
                {
                    if (r.MeetingDetails != null)
                    {
                        _context.Set<MeetingDetails>().Remove(r.MeetingDetails);
                    }
                    if (r.Feedbacks != null && r.Feedbacks.Any())
                    {
                        _context.Set<InterviewFeedback>().RemoveRange(r.Feedbacks);
                    }
                }
                _context.Set<InterviewRound>().RemoveRange(interview.Rounds);
            }

            if (interview.Notifications != null && interview.Notifications.Any())
            {
                _context.Set<InterviewNotification>().RemoveRange(interview.Notifications);
            }

            if (interview.Audits != null && interview.Audits.Any())
            {
                _context.Set<InterviewAudit>().RemoveRange(interview.Audits);
            }

            _context.Set<Interview>().Remove(interview);
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<InterviewResponseDto> CompleteInterviewAsync(int interviewId)
        {
            var interview = await _repository.GetInterviewDetailsAsync(interviewId)
                ?? throw new KeyNotFoundException("Interview not found.");

            interview.Status = "Completed";
            interview.UpdatedAt = DateTime.UtcNow;

            foreach (var round in interview.Rounds)
                round.Status = "Completed";

            await _repository.SaveChangesAsync();
            return interview.ToDto();
        }

        public async Task<EmailSendResult> SendInvitationEmailAsync(int interviewId)
        {
            return await _emailService.SendInterviewEmailFromDbAsync(interviewId);
        }

        public async Task<EmailSendResult> ResendInvitationEmailAsync(int interviewId)
        {
            return await _emailService.SendInterviewEmailFromDbAsync(interviewId);
        }

        public async Task<ConflictCheckResponseDto> CheckConflictAsync(CheckConflictDto dto)
        {
            var response = new ConflictCheckResponseDto();
            var newEndTime = dto.ScheduledStartTime.AddMinutes(dto.DurationMinutes);

            if (dto.InterviewerId is > 0)
            {
                var panelConflict = await _context.Set<InterviewPanel>()
                    .Include(p => p.InterviewRound)
                    .Where(p => p.InterviewerId == dto.InterviewerId.Value &&
                                p.InterviewRound!.Status != "Cancelled" &&
                                p.InterviewRound!.ScheduledStartTime < newEndTime &&
                                p.InterviewRound!.ScheduledEndTime > dto.ScheduledStartTime)
                    .FirstOrDefaultAsync();

                if (panelConflict != null)
                {
                    response.HasConflict = true;
                    response.Conflicts.Add(
                        $"Interviewer has a conflict with round '{panelConflict.InterviewRound?.Title}' " +
                        $"from {panelConflict.InterviewRound?.ScheduledStartTime:HH:mm} to {panelConflict.InterviewRound?.ScheduledEndTime:HH:mm}.");
                }
            }

            if (dto.CandidateId is > 0)
            {
                var candidateConflict = await _context.Set<InterviewRound>()
                    .Include(r => r.Interview)
                    .Where(r => r.Interview!.CandidateId == dto.CandidateId.Value &&
                                r.Status != "Cancelled" &&
                                r.ScheduledStartTime < newEndTime &&
                                r.ScheduledEndTime > dto.ScheduledStartTime)
                    .FirstOrDefaultAsync();

                if (candidateConflict != null)
                {
                    response.HasConflict = true;
                    response.Conflicts.Add(
                        $"Candidate has an existing interview scheduled from " +
                        $"{candidateConflict.ScheduledStartTime:HH:mm} to {candidateConflict.ScheduledEndTime:HH:mm}.");
                }
            }

            if (response.HasConflict)
                response.ConflictReason = string.Join(" ", response.Conflicts);

            return response;
        }

        public async Task<InterviewFeedbackResponseDto> SubmitFeedbackAsync(SubmitFeedbackDto dto)
        {
            var round = await _repository.GetRoundByIdAsync(dto.InterviewRoundId)
                ?? throw new KeyNotFoundException("Interview round not found.");

            var feedback = new InterviewFeedback
            {
                InterviewRoundId = dto.InterviewRoundId,
                EvaluatorId = dto.EvaluatorId,
                Rating = dto.OverallRating,
                OverallRating = dto.OverallRating,
                TechnicalScore = dto.TechnicalScore,
                CommunicationScore = dto.CommunicationScore,
                ProblemSolvingScore = dto.ProblemSolvingScore,
                Strengths = dto.Strengths,
                AreasOfImprovement = dto.AreasOfImprovement,
                Comments = dto.Comments,
                Recommendation = dto.Recommendation,
                SubmittedAt = DateTime.UtcNow
            };

            await _repository.AddFeedbackAsync(feedback);

            round.Status = "Completed";
            if (round.Interview != null)
            {
                round.Interview.OverallStatus = "Completed";
                round.Interview.OverallResult = dto.Recommendation;
            }

            await _repository.SaveChangesAsync();
            return MapFeedbackToDto(feedback);
        }

        // ── Private Helpers ───────────────────────────────────────────────────

        private async Task<Interview> ResolveOrCreateInterviewAsync(
            ScheduleInterviewDto dto, Application? application, User? candidateUser)
        {
            Candidate? candidateEntity = null;
            string candEmail = application?.User?.Email ?? candidateUser?.Email ?? dto.CandidateEmail ?? string.Empty;
            string candName = application?.User?.FullName ?? candidateUser?.FullName ?? dto.CandidateName ?? "Candidate";
            string candPhone = dto.CandidatePhone ?? string.Empty;

            if (!string.IsNullOrEmpty(candEmail))
            {
                try
                {
                    candidateEntity = await _context.Candidates.FirstOrDefaultAsync(c => c.Email == candEmail);
                    if (candidateEntity == null)
                    {
                        candidateEntity = new Candidate
                        {
                            FullName = candName,
                            Email = candEmail,
                            PhoneNumber = candPhone,
                            CreatedAt = DateTime.UtcNow,
                            CreatedOn = DateTime.UtcNow
                        };
                        await _context.Candidates.AddAsync(candidateEntity);
                        await _context.SaveChangesAsync();
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"[InterviewService] Candidate entity lookup/creation warning: {ex.Message}");
                    candidateEntity = null;
                }
            }

            if (dto.ApplicationId > 0)
            {
                var existing = await _repository.GetExistingInterviewForApplicationAsync(dto.ApplicationId!.Value);
                if (existing != null)
                {
                    existing.Status = "Scheduled";
                    existing.Notes = dto.SpecialInstructions ?? dto.Notes ?? string.Empty;
                    existing.CandidateEntityId = candidateEntity?.Id;
                    existing.UpdatedAt = DateTime.UtcNow;
                    _context.Set<Interview>().Update(existing);
                    return existing;
                }
            }

            var interview = new Interview
            {
                ApplicationId = application?.Id,
                RecruiterId = dto.RecruiterId > 0 ? dto.RecruiterId : 1,
                CandidateId = application?.UserId ?? candidateUser?.Id ?? (dto.CandidateId > 0 ? dto.CandidateId : null),
                CandidateEntityId = candidateEntity?.Id,
                OpportunityId = application?.OpportunityId ?? (dto.OpportunityId > 0 ? dto.OpportunityId : null),
                CandidateName = candName,
                CandidateEmail = candEmail,
                CandidatePhone = candPhone,
                JobRole = !string.IsNullOrWhiteSpace(dto.JobRole) ? dto.JobRole : (application?.Opportunity?.Title ?? dto.CustomJobTitle ?? "Software Engineer"),
                Department = string.IsNullOrWhiteSpace(dto.Department) ? "Engineering" : dto.Department,
                Interviewer = string.IsNullOrWhiteSpace(dto.Interviewer) ? "Recruiter" : dto.Interviewer,
                InterviewRound = string.IsNullOrWhiteSpace(dto.InterviewRound) ? (string.IsNullOrWhiteSpace(dto.RoundTitle) ? "Technical Round 1" : dto.RoundTitle) : dto.InterviewRound,
                InterviewDate = dto.ScheduledTime.Date,
                InterviewTime = dto.ScheduledTime.ToString("hh:mm tt"),
                Duration = dto.DurationMinutes > 0 ? dto.DurationMinutes : 45,
                GoogleMeetLink = dto.CustomMeetingUrl ?? dto.GoogleMeetLink ?? string.Empty,
                Notes = dto.SpecialInstructions ?? dto.Notes ?? string.Empty,
                Status = "Scheduled",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            await _repository.AddAsync(interview);
            return interview;
        }

        private static InterviewRound BuildInterviewRound(int interviewId, ScheduleInterviewDto dto, DateTime endTime)
        {
            return new InterviewRound
            {
                InterviewId = interviewId,
                RoundNumber = 1,
                Title = dto.RoundTitle,
                InterviewType = "Technical",
                Agenda = dto.Agenda,
                InterviewDate = dto.ScheduledTime.Date,
                ScheduledStartTime = dto.ScheduledTime,
                ScheduledEndTime = endTime,
                DurationMinutes = dto.DurationMinutes,
                Status = "Scheduled",
                IsEmailSent = true,
                EmailSentAt = DateTime.UtcNow,
                CreatedAt = DateTime.UtcNow
            };
        }

        private Task EnqueueCancellationEmailAsync(Interview interview, string reason)
        {
            return Task.CompletedTask;
        }

        private IQueryable<Interview> BuildBaseInterviewQuery()
        {
            return _context.Set<Interview>()
                .AsSplitQuery()
                .Include(i => i.Candidate)
                .Include(i => i.Recruiter)
                .Include(i => i.Opportunity)
                .Include(i => i.Rounds).ThenInclude(r => r.MeetingDetails)
                .Include(i => i.Rounds).ThenInclude(r => r.Feedbacks).ThenInclude(f => f.Evaluator)
                .Include(i => i.Notifications);
        }

        private static IEnumerable<CalendarEventDto> BuildCalendarEvents(Interview interview)
        {
            return interview.Rounds.Select(round => new CalendarEventDto
            {
                Id = $"evt-{interview.Id}-{round.Id}",
                InterviewId = interview.Id,
                RoundId = round.Id,
                Title = $"{round.Title}: {interview.Candidate?.FullName ?? interview.CustomCandidateName}",
                CandidateName = interview.Candidate?.FullName ?? interview.CustomCandidateName,
                OpportunityTitle = interview.Opportunity?.Title ?? interview.CustomJobTitle,
                CompanyName = interview.Opportunity?.CompanyName ?? "Oppora Hub",
                Start = round.ScheduledStartTime,
                End = round.ScheduledEndTime,
                Status = round.Status,
                MeetingUrl = round.MeetingDetails?.MeetingUrl ?? string.Empty,
                Color = RoundStatusToColor(round.Status)
            });
        }

        private static string RoundStatusToColor(string status) => status switch
        {
            "Scheduled"   => "#4f46e5",
            "Completed"   => "#10b981",
            "Rescheduled" => "#f59e0b",
            "Cancelled"   => "#ef4444",
            _             => "#6b7280"
        };

        private static InterviewFeedbackResponseDto MapFeedbackToDto(InterviewFeedback f)
        {
            return new InterviewFeedbackResponseDto
            {
                Id = f.Id,
                InterviewRoundId = f.InterviewRoundId,
                EvaluatorId = f.EvaluatorId,
                EvaluatorName = f.Evaluator?.FullName ?? "Evaluator",
                Rating = f.Rating,
                OverallRating = f.OverallRating,
                TechnicalScore = f.TechnicalScore,
                CommunicationScore = f.CommunicationScore,
                ProblemSolvingScore = f.ProblemSolvingScore,
                Strengths = f.Strengths,
                AreasOfImprovement = f.AreasOfImprovement,
                Comments = f.Comments,
                Recommendation = f.Recommendation,
                SubmittedAt = f.SubmittedAt
            };
        }
    }
}
