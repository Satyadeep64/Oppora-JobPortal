namespace Oppora.API.Models
{
    public class Course
    {
        public int Id { get; set; }

        public string Image { get; set; } = string.Empty;

        public string Title { get; set; } = string.Empty;

        public string Skills { get; set; } = string.Empty;

        public string Link { get; set; } = string.Empty;

        public string RowName { get; set; } = string.Empty;
    }
}