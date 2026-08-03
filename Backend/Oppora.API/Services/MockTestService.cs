using Oppora.API.Models.MockTest;
using Oppora.API.Session;


namespace Oppora.API.Services
{
    public class MockTestService
    {
        private readonly GeminiService _geminiService;
        private readonly TestSessionManager _sessionManager;
        private readonly ILogger<MockTestService> _logger;

        public MockTestService(
            GeminiService geminiService,
            TestSessionManager sessionManager,
            ILogger<MockTestService> logger)
        {
            _geminiService = geminiService;
            _sessionManager = sessionManager;
            _logger = logger;
        }

        /// <summary>
        /// Generates a new mock test using Gemini and stores it temporarily.
        /// </summary>
        public async Task<List<Question>> GenerateTestAsync(
            string sessionId,
            MockTestRequest request,
            CancellationToken cancellationToken = default)
        {
            if (string.IsNullOrWhiteSpace(sessionId))
                throw new ArgumentException("Invalid session.");

            var questions = await _geminiService.GenerateQuestionsAsync(request);

            _sessionManager.SaveTest(sessionId, questions);

            _logger.LogInformation(
                "Generated {Count} questions for Session {SessionId}",
                questions.Count,
                sessionId);

            return questions;
        }

        /// <summary>
        /// Returns generated questions of current session.
        /// </summary>
        public List<Question>? GetCurrentTest(string sessionId)
        {
            return _sessionManager.GetTest(sessionId);
        }

        /// <summary>
        /// Calculates result after submission.
        /// </summary>
        public TestResult SubmitTest(
            string sessionId,
            Dictionary<int, string> userAnswers)
        {
            var questions = _sessionManager.GetTest(sessionId);

            if (questions == null)
                throw new Exception("Test session not found.");

            int correct = 0;

            var review = new List<QuestionReviewDto>();

            foreach (var question in questions)
            {
                userAnswers.TryGetValue(question.Id, out var userAnswer);

                bool isCorrect = userAnswer == question.CorrectAnswer;

                if (isCorrect)
                {
                    correct++;
                }

                review.Add(new QuestionReviewDto
                {
                    Id = question.Id,
                    Question = question.QuestionText,
                    YourAnswer = userAnswer ?? "Not Attempted",
                    CorrectAnswer = question.CorrectAnswer,
                    Explanation = question.Explanation,
                    IsCorrect = isCorrect
                });
            }

            int attempted = userAnswers.Count;
            int unattempted = questions.Count - attempted;
            int wrong = attempted - correct;
            int score = correct;

            double percentage = questions.Count == 0
                ? 0
                : Math.Round((double)correct / questions.Count * 100, 2);

            var result = new TestResult
            {
                TotalQuestions = questions.Count,
                CorrectAnswers = correct,
                WrongAnswers = wrong,
                Unattempted = unattempted,
                Score = score,
                Percentage = percentage,
                Review = review
            };

            _sessionManager.RemoveTest(sessionId);

            _logger.LogInformation(
                "Session {SessionId} completed with score {Score}",
                sessionId,
                result.Score);

            return result;
        }

        /// <summary>
        /// Removes abandoned session.
        /// </summary>
        public void ClearSession(string sessionId)
        {
            _sessionManager.RemoveTest(sessionId);

            _logger.LogInformation(
                "Session {SessionId} cleared.",
                sessionId);
        }
    }
}