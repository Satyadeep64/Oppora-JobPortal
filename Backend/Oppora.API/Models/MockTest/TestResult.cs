namespace Oppora.API.Models.MockTest
{
    public class TestResult
    {
        public int TotalQuestions { get; set; }

        public int CorrectAnswers { get; set; }

        public int WrongAnswers { get; set; }

        public int Unattempted { get; set; }

        public int Score { get; set; }

        public double Percentage { get; set; }

        public List<QuestionReviewDto> Review { get; set; } = new();
    }
}