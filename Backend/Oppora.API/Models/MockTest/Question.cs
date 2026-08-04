namespace Oppora.API.Models.MockTest
{
    public class Question
    {
        public int Id { get; set; }

        public string QuestionText { get; set; } = string.Empty;

        public List<string> Options { get; set; } = new();

        // Not sent to frontend until submission
        public string CorrectAnswer { get; set; } = string.Empty;

        public string Explanation { get; set; } = string.Empty;
    }
}