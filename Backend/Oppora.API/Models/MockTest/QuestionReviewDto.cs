namespace Oppora.API.Models.MockTest
{
    public class QuestionReviewDto
    {
        public int Id { get; set; }

        public string Question { get; set; } = string.Empty;

        public string YourAnswer { get; set; } = string.Empty;

        public string CorrectAnswer { get; set; } = string.Empty;

        public string Explanation { get; set; } = string.Empty;

        public bool IsCorrect { get; set; }
    }
}