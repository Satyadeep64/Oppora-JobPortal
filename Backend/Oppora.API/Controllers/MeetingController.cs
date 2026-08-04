using Microsoft.AspNetCore.Mvc;
using Oppora.API.DTOs;
using Oppora.API.Interfaces;

namespace Oppora.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MeetingController : ControllerBase
    {
        private readonly IMeetingService _meetingService;

        public MeetingController(IMeetingService meetingService)
        {
            _meetingService = meetingService;
        }

        /// <summary>
        /// Saves or updates Google Meet link and schedule details for an interview round.
        /// </summary>
        [HttpPost("save")]
        public async Task<IActionResult> SaveMeeting([FromBody] SaveMeetingDetailsDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.MeetingUrl))
            {
                return BadRequest(new { message = "Meeting URL is required." });
            }

            var result = await _meetingService.SaveMeetingAsync(dto);
            return Ok(result);
        }

        /// <summary>
        /// Gets meeting details (Meeting Link, Meeting ID, Duration, TimeZone) for a specific interview round.
        /// </summary>
        [HttpGet("round/{roundId}")]
        public async Task<IActionResult> GetMeetingByRound(int roundId)
        {
            var meeting = await _meetingService.GetMeetingByRoundIdAsync(roundId);
            if (meeting == null)
            {
                return NotFound(new { message = "No meeting details found for this interview round." });
            }
            return Ok(meeting);
        }

        /// <summary>
        /// Parses and extracts the Meeting ID from any provided Google Meet link.
        /// </summary>
        [HttpPost("extract-id")]
        public IActionResult ExtractMeetingId([FromBody] string meetingUrl)
        {
            string meetingId = _meetingService.ExtractMeetingId(meetingUrl);
            return Ok(new { meetingUrl, meetingId });
        }
    }
}
