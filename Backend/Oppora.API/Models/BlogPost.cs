using System.ComponentModel.DataAnnotations;

namespace Oppora.API.Models
{
    public class BlogPost
    {
        [Key]
        public int Id { get; set; }

        public int UserId { get; set; }

        public string AuthorName { get; set; } = string.Empty;

        public string? AuthorImage { get; set; }

        public string Title { get; set; } = string.Empty;

        public string Category { get; set; } = "Interview Experience";

        public string Content { get; set; } = string.Empty;

        public int Upvotes { get; set; } = 0;

        public int Downvotes { get; set; } = 0;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public List<BlogComment> Comments { get; set; } = new();
    }

    public class BlogComment
    {
        [Key]
        public int Id { get; set; }

        public int BlogPostId { get; set; }

        public int UserId { get; set; }

        public string AuthorName { get; set; } = string.Empty;

        public string CommentText { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }

    public class VoteDto
    {
        public string VoteType { get; set; } = "upvote"; // "upvote" or "downvote"
    }

    public class CommentDto
    {
        public int UserId { get; set; }
        public string AuthorName { get; set; } = string.Empty;
        public string CommentText { get; set; } = string.Empty;
    }
}
