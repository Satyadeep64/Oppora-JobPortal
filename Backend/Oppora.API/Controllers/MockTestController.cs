using Microsoft.AspNetCore.Mvc;
using Oppora.API.Models.MockTest;
using Oppora.API.Services;


namespace Oppora.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MockTestController : ControllerBase
    {
        private readonly MockTestService _mockTestService;

        public MockTestController(MockTestService mockTestService)
        {
            _mockTestService = mockTestService;
        }

        /// <summary>
        /// Generate a new AI Mock Test
        /// </summary>
        [HttpPost("generate")]
        public async Task<IActionResult> GenerateTest(
            [FromBody] MockTestRequest request,
            CancellationToken cancellationToken)
        {
            try
            {
                string sessionId = Guid.NewGuid().ToString();

                var questions = await _mockTestService.GenerateTestAsync(
                    sessionId,
                    request,
                    cancellationToken);

                var questionDtos = questions.Select(q => new QuestionDto
                {
                    Id = q.Id,
                    QuestionText = q.QuestionText,
                    Options = q.Options
                }).ToList();

                return Ok(new
                {
                    SessionId = sessionId,
                    Questions = questionDtos
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    Message = ex.Message
                });
            }
        }

        /// <summary>
        /// Get current generated test
        /// </summary>
        [HttpGet("{sessionId}")]
        public IActionResult GetTest(string sessionId)
        {
            var test = _mockTestService.GetCurrentTest(sessionId);

            if (test == null)
            {
                return NotFound(new
                {
                    Message = "Test session not found."
                });
            }

            return Ok(test);
        }

        /// <summary>
        /// Submit completed test
        /// </summary>
        [HttpPost("submit/{sessionId}")]
        public IActionResult SubmitTest(
            string sessionId,
            [FromBody] SubmitTestRequest request)
        {
            try
            {
                var result = _mockTestService.SubmitTest(
                    sessionId,
                    request.Answers);

                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    Message = ex.Message
                });
            }
        }

        /// <summary>
        /// Clear an active test session
        /// </summary>
        [HttpDelete("{sessionId}")]
        public IActionResult ClearSession(string sessionId)
        {
            _mockTestService.ClearSession(sessionId);

            return Ok(new
            {
                Message = "Session cleared successfully."
            });
        }
    }
}
