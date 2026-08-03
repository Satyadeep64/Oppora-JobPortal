using System.Text.Json;
using Google.GenAI;
using Google.GenAI.Types;
using Oppora.API.Models.MockTest;

namespace Oppora.API.Services
{
    public class GeminiService
    {
        private readonly Client _client;
        private readonly IConfiguration _configuration;
        private readonly ILogger<GeminiService> _logger;

        public GeminiService(
            IConfiguration configuration,
            ILogger<GeminiService> logger)
        {
            _configuration = configuration;
            _logger = logger;

            var apiKey = _configuration["Gemini:ApiKey"];

            if (string.IsNullOrWhiteSpace(apiKey))
            {
                throw new InvalidOperationException(
                    "Gemini API Key not found in appsettings.json");
            }

            _client = new Client(apiKey: apiKey);
        }

        public async Task<List<Question>> GenerateQuestionsAsync(
            MockTestRequest request)
        {
            try
            {
                string model =
                    _configuration["Gemini:Model"] ?? "gemini-2.5-flash";

                string prompt = $@"
Generate exactly {request.NumberOfQuestions} multiple choice questions.

Topic:
{request.Topic}

Difficulty:
{request.Difficulty}

Question Type:
{request.QuestionType}

Rules:

- Return ONLY valid JSON.
- Do not use markdown.
- Do not use ```json.
- Generate exactly {request.NumberOfQuestions} questions.
- Every question must have exactly 4 options.
- CorrectAnswer must exactly match one option.
- Explanation should be short.

Return JSON in this format:

[
  {{
    ""id"":1,
    ""questionText"":""..."",
    ""options"":[""A"",""B"",""C"",""D""],
    ""correctAnswer"":""A"",
    ""explanation"":""...""
  }}
]
";

                var config = new GenerateContentConfig
                {
                    Temperature = 0.4f,
                    MaxOutputTokens = 8192,
                    ResponseMimeType = "application/json"
                };

                var response =
                    await _client.Models.GenerateContentAsync(
                        model: model,
                        contents: prompt,
                        config: config);

                string json =
                    response.Candidates[0].Content.Parts[0].Text;

                var questions =
                    JsonSerializer.Deserialize<List<Question>>(
                        json,
                        new JsonSerializerOptions
                        {
                            PropertyNameCaseInsensitive = true
                        });

                return questions ?? new List<Question>();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex,
                    "Error generating Gemini questions.");

                throw;
            }
        }
    }
}