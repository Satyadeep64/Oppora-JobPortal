using System.Text;
using System.Text.Json;
using Oppora.API.DTOs;

namespace Oppora.API.Services
{
    public class ATSAnalysisService
    {
        private readonly HttpClient _httpClient;
        private readonly IConfiguration _configuration;

        public ATSAnalysisService(HttpClient httpClient, IConfiguration configuration)
        {
            _httpClient = httpClient;
            _configuration = configuration;
        }

        public async Task<ResumeAnalysisResponse> AnalyzeResumeAsync(string resumeText)
        {
            var apiKey = _configuration["Gemini:ApiKey"];

            var url =
                $"https://generativelanguage.googleapis.com/v1/models/gemini-3.6-flash:generateContent?key={apiKey}";

            var prompt = $@"
You are an ATS Resume Analyzer.

Analyze the following resume.

Return ONLY valid JSON in this format.

{{
  ""ATSScore"": 0,
  ""Strengths"": [],
  ""MissingSkills"": [],
  ""Suggestions"": [],
  ""OverallFeedback"": """"
}}

Resume:

{resumeText}
";

            var requestBody = new
            {
                contents = new[]
                {
                    new
                    {
                        parts = new[]
                        {
                            new
                            {
                                text = prompt
                            }
                        }
                    }
                }
            };

            var json = JsonSerializer.Serialize(requestBody);

            var response = await _httpClient.PostAsync(
                url,
                new StringContent(json, Encoding.UTF8, "application/json"));

            if (!response.IsSuccessStatusCode)
            {
                var error = await response.Content.ReadAsStringAsync();
                throw new Exception($"Gemini API Error: {error}");
            }

            var result = await response.Content.ReadAsStringAsync();

            return ParseGeminiResponse(result);
        }

        private ResumeAnalysisResponse ParseGeminiResponse(string response)
        {
            using var document = JsonDocument.Parse(response);

            var text = document
                .RootElement
                .GetProperty("candidates")[0]
                .GetProperty("content")
                .GetProperty("parts")[0]
                .GetProperty("text")
                .GetString();

            if (string.IsNullOrWhiteSpace(text))
                throw new Exception("Gemini returned an empty response.");

            text = text.Replace("```json", "")
                       .Replace("```", "")
                       .Trim();

            return JsonSerializer.Deserialize<ResumeAnalysisResponse>(text)
                   ?? throw new Exception("Failed to parse Gemini response.");
        }
    }
}