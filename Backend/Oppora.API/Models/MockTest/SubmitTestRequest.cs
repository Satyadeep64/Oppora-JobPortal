namespace Oppora.API.Models.MockTest
{
    public class SubmitTestRequest
    {
        public string TestId { get; set; } = string.Empty;

        // Key = QuestionId
        // Value = Selected Option
        public Dictionary<int, string> Answers { get; set; } = new();
    }
}