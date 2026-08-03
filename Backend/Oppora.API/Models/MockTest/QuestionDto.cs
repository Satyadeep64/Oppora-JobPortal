namespace Oppora.API.Models.MockTest
{
    public class QuestionDto
    {
        public int Id { get; set; }

        public string QuestionText { get; set; } = string.Empty;

        public List<string> Options { get; set; } = new();
    }
}
