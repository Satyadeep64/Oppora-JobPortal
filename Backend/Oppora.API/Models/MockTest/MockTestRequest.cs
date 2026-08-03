namespace Oppora.API.Models.MockTest
{
    public class MockTestRequest
    {
        public string Topic { get; set; } = string.Empty;

        public string Difficulty { get; set; } = string.Empty;

        public int NumberOfQuestions { get; set; }

        public int Duration { get; set; }

        public string QuestionType { get; set; } = "MCQ";

        public string TemplateName { get; set; } = string.Empty;
    }
}