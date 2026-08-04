using Microsoft.AspNetCore.Mvc;
using Oppora.API.DTOs;
using Oppora.API.Interfaces;
using Oppora.API.Validation;

namespace Oppora.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class InterviewController : ControllerBase
    {
        private readonly IInterviewService _interviewService;
        private readonly ILogger<InterviewController> _logger;

        public InterviewController(
            IInterviewService interviewService,
            ILogger<InterviewController> logger)
        {
            _interviewService = interviewService;
            _logger = logger;
        }

        /// <summary>
        /// 1. Get Interviews (Lists all interviews, optional filters for recruiterId and status).
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetInterviews([FromQuery] int? recruiterId, [FromQuery] string? status)
        {
            var interviews = await _interviewService.GetAllInterviewsAsync(recruiterId, status);
            return Ok(interviews);
        }

        /// <summary>
        /// 2. Create Interview (Saves interview, round & meeting link, sends email).
        /// </summary>
        [HttpPost]
        public async Task<IActionResult> CreateInterview([FromBody] ScheduleInterviewDto dto)
        {
            var errors = InterviewValidators.ValidateSchedule(dto);
            if (errors.Any())
            {
                return BadRequest(new { errors = errors.Select(e => e.ErrorMessage) });
            }

            try
            {
                var result = await _interviewService.ScheduleInterviewAsync(dto);
                return StatusCode(201, result);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while creating the interview.", error = ex.Message });
            }
        }

        /// <summary>
        /// 3. Update Interview (Updates status, recruiter notes, or result).
        /// </summary>
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateInterview(int id, [FromBody] UpdateInterviewDto dto)
        {
            if (id <= 0)
                return BadRequest(new { message = "Invalid interview ID." });

            if (dto == null)
                return BadRequest(new { message = "Update payload is required." });

            try
            {
                var result = await _interviewService.UpdateInterviewAsync(id, dto);
                return Ok(result);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[InterviewController] Error updating interview ID {Id}", id);
                return StatusCode(500, new { message = "An error occurred while updating interview.", detail = ex.Message });
            }
        }

        /// <summary>
        /// 4. Reschedule Interview (Updates start/end time, updates meeting link, enqueues email).
        /// </summary>
        [HttpPost("{id}/reschedule")]
        public async Task<IActionResult> RescheduleInterview(int id, [FromBody] RescheduleInterviewDto dto)
        {
            if (dto == null || dto.NewScheduledTime <= DateTime.MinValue)
            {
                return BadRequest(new { message = "Valid scheduled time is required." });
            }

            try
            {
                var result = await _interviewService.RescheduleInterviewAsync(id, dto);
                return Ok(result);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        /// <summary>
        /// 5a. Permanent Delete Interview (Deletes interview and all associated records permanently from DB).
        /// DELETE /api/Interview/{id}
        /// </summary>
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteInterview(int id)
        {
            if (id <= 0)
                return BadRequest(new { message = "Invalid interview ID." });

            try
            {
                var deleted = await _interviewService.DeleteInterviewAsync(id);
                if (!deleted)
                    return NotFound(new { message = $"Interview with ID {id} not found." });

                return Ok(new { success = true, message = $"Interview with ID {id} permanently deleted." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[InterviewController] Error deleting interview ID {Id}", id);
                return StatusCode(500, new { message = "An error occurred while deleting the interview.", detail = ex.Message });
            }
        }

        /// <summary>
        /// 5b. Cancel Interview (Marks interview status as cancelled).
        /// POST /api/Interview/{id}/cancel
        /// </summary>
        [HttpPost("{id}/cancel")]
        public async Task<IActionResult> CancelInterview(int id, [FromBody] CancelInterviewDto? dto = null)
        {
            if (id <= 0)
                return BadRequest(new { message = "Invalid interview ID." });

            try
            {
                var result = await _interviewService.CancelInterviewAsync(id, dto);
                return Ok(result);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[InterviewController] Error cancelling interview ID {Id}", id);
                return StatusCode(500, new { message = "An error occurred while cancelling interview.", detail = ex.Message });
            }
        }

        /// <summary>
        /// 6. Complete Interview (Marks interview as completed).
        /// </summary>
        [HttpPost("{id}/complete")]
        public async Task<IActionResult> CompleteInterview(int id)
        {
            try
            {
                var result = await _interviewService.CompleteInterviewAsync(id);
                return Ok(result);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Check Conflict endpoint (Detects interviewer or candidate double-booking conflicts before scheduling).
        /// </summary>
        [HttpPost("check-conflict")]
        public async Task<IActionResult> CheckConflict([FromBody] CheckConflictDto dto)
        {
            var conflict = await _interviewService.CheckConflictAsync(dto);
            return Ok(conflict);
        }

        /// <summary>
        /// 9. Get Candidate Interviews (Fetches all interviews for a specific candidate).
        /// </summary>
        [HttpGet("candidate/{candidateId}")]
        public async Task<IActionResult> GetCandidateInterviews(int candidateId)
        {
            var result = await _interviewService.GetCandidateInterviewsAsync(candidateId);
            return Ok(result);
        }

        /// <summary>
        /// 10. Get Upcoming Interviews (Lists upcoming interviews scheduled from current timestamp).
        /// </summary>
        [HttpGet("upcoming")]
        public async Task<IActionResult> GetUpcomingInterviews([FromQuery] int? recruiterId, [FromQuery] int? candidateId)
        {
            var result = await _interviewService.GetUpcomingInterviewsAsync(recruiterId, candidateId);
            return Ok(result);
        }

        /// <summary>
        /// 11. Get Calendar Events (Returns formatted calendar objects with status colors for UI calendars).
        /// </summary>
        [HttpGet("calendar")]
        public async Task<IActionResult> GetCalendarEvents([FromQuery] int? recruiterId, [FromQuery] int? candidateId)
        {
            try
            {
                var result = await _interviewService.GetCalendarEventsAsync(recruiterId, candidateId);
                return Ok(result ?? Enumerable.Empty<CalendarEventDto>());
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[InterviewController] Error fetching calendar events");
                return StatusCode(500, new { message = "An error occurred while fetching calendar events.", detail = ex.Message });
            }
        }

        /// <summary>
        /// 12. Submit Feedback (Submits interviewer ratings, comments & recommendation).
        /// </summary>
        [HttpPost("feedback")]
        public async Task<IActionResult> SubmitFeedback([FromBody] SubmitFeedbackDto dto)
        {
            var errors = InterviewValidators.ValidateFeedback(dto);
            if (errors.Any())
            {
                return BadRequest(new { errors = errors.Select(e => e.ErrorMessage) });
            }

            try
            {
                var result = await _interviewService.SubmitFeedbackAsync(dto);
                return Ok(result);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        /// <summary>
        /// 13. Get Shortlisted Candidates (Lists candidate applications eligible for scheduling).
        /// GET /api/Interview/shortlisted/{recruiterId}
        /// </summary>
        [HttpGet("shortlisted/{recruiterId}")]
        public async Task<IActionResult> GetShortlistedCandidates(int recruiterId)
        {
            if (recruiterId <= 0)
            {
                _logger.LogWarning("[InterviewController] Invalid recruiterId: {RecruiterId}", recruiterId);
                return BadRequest(new { message = "Invalid recruiter ID. Id must be greater than 0." });
            }

            try
            {
                var candidates = await _interviewService.GetShortlistedCandidatesAsync(recruiterId);
                return Ok(candidates ?? Enumerable.Empty<ShortlistedCandidateDto>());
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[InterviewController] Error fetching shortlisted candidates for recruiterId {RecruiterId}", recruiterId);
                return StatusCode(500, new { message = "An error occurred while fetching shortlisted candidates.", detail = ex.Message });
            }
        }

        /// <summary>
        /// 14. Search Candidate Directory (Lists registered platform candidates for manual scheduling).
        /// </summary>
        [HttpGet("candidates")]
        public async Task<IActionResult> GetCandidates([FromQuery] string? query)
        {
            try
            {
                var candidates = await _interviewService.SearchCandidatesAsync(query);
                return Ok(candidates ?? Enumerable.Empty<CandidateDirectoryDto>());
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[InterviewController] Error searching candidates");
                return StatusCode(500, new { message = "An error occurred while searching candidate directory.", detail = ex.Message });
            }
        }

        /// <summary>
        /// Get Interview By ID
        /// </summary>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetInterviewById(int id)
        {
            if (id <= 0)
                return BadRequest(new { message = "Invalid interview ID." });

            try
            {
                var result = await _interviewService.GetInterviewByIdAsync(id);
                if (result == null)
                    return NotFound(new { message = $"Interview with ID {id} not found." });

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[InterviewController] Error fetching interview ID {Id}", id);
                return StatusCode(500, new { message = "An error occurred while fetching interview details.", detail = ex.Message });
            }
        }

        /// <summary>
        /// Get Interviews By Recruiter
        /// GET /api/Interview/recruiter/{recruiterId}
        /// </summary>
        [HttpGet("recruiter/{recruiterId}")]
        public async Task<IActionResult> GetInterviewsByRecruiter(int recruiterId)
        {
            if (recruiterId <= 0)
            {
                _logger.LogWarning("[InterviewController] Invalid recruiterId: {RecruiterId}", recruiterId);
                return BadRequest(new { message = "Invalid recruiter ID. Id must be greater than 0." });
            }

            try
            {
                var result = await _interviewService.GetInterviewsByRecruiterAsync(recruiterId);
                return Ok(result ?? Enumerable.Empty<InterviewResponseDto>());
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[InterviewController] Error fetching recruiter interviews for recruiterId {RecruiterId}", recruiterId);
                return StatusCode(500, new { message = "An error occurred while fetching recruiter interviews.", detail = ex.Message });
            }
        }

        /// <summary>
        /// Get Interview Audit Logs (1-to-Many relationship)
        /// GET /api/Interview/{id}/audits
        /// </summary>
        [HttpGet("{id}/audits")]
        public async Task<IActionResult> GetInterviewAudits(int id)
        {
            if (id <= 0)
                return BadRequest(new { message = "Invalid interview ID." });

            var interview = await _interviewService.GetInterviewByIdAsync(id);
            if (interview == null)
                return NotFound(new { message = $"Interview with ID {id} not found." });

            return Ok(interview.Audits ?? new List<InterviewAuditDto>());
        }

        /// <summary>
        /// Get 1-to-1 Interview Email Status
        /// GET /api/Interview/{id}/email
        /// </summary>
        [HttpGet("{id}/email")]
        public async Task<IActionResult> GetInterviewEmailStatus(int id)
        {
            if (id <= 0)
                return BadRequest(new { message = "Invalid interview ID." });

            var interview = await _interviewService.GetInterviewByIdAsync(id);
            if (interview == null)
                return NotFound(new { message = $"Interview with ID {id} not found." });

            if (interview.EmailStatus == null)
                return NotFound(new { message = $"No email record found for interview ID {id}." });

            return Ok(interview.EmailStatus);
        }

        /// <summary>
        /// Resend / Send Invitation Email
        /// POST /api/Interview/{id}/send-invitation
        /// </summary>
        [HttpPost("{id}/send-invitation")]
        public async Task<IActionResult> SendInvitationEmail(int id)
        {
            if (id <= 0)
                return BadRequest(new { message = "Invalid interview ID." });

            var result = await _interviewService.SendInvitationEmailAsync(id);
            if (!result.Success)
                return StatusCode(500, new { message = result.Message ?? "Email sending failed.", error = result.ErrorMessage });

            return Ok(new { message = "Invitation email sent successfully.", detail = result.Message });
        }
    }
}
