using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Oppora.API.Data;
using Oppora.API.Models;

namespace Oppora.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BlogController : ControllerBase
    {
        private readonly AppDbContext _context;

        public BlogController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/Blog
        [HttpGet]
        public async Task<IActionResult> GetAllPosts()
        {
            var posts = await _context.BlogPosts
                .Include(b => b.Comments)
                .OrderByDescending(b => b.CreatedAt)
                .ToListAsync();

            if (!posts.Any())
            {
                // Seed initial sample community blogs if none exist in DB
                var samplePosts = GetSampleSeedPosts();
                _context.BlogPosts.AddRange(samplePosts);
                await _context.SaveChangesAsync();
                return Ok(samplePosts);
            }

            return Ok(posts);
        }

        // GET: api/Blog/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetPostById(int id)
        {
            var post = await _context.BlogPosts
                .Include(b => b.Comments)
                .FirstOrDefaultAsync(b => b.Id == id);

            if (post == null) return NotFound(new { message = "Blog post not found" });

            return Ok(post);
        }

        // POST: api/Blog
        [HttpPost]
        public async Task<IActionResult> CreatePost([FromBody] BlogPost post)
        {
            if (string.IsNullOrWhiteSpace(post.Title) || string.IsNullOrWhiteSpace(post.Content))
            {
                return BadRequest(new { message = "Title and Content are required." });
            }

            var user = await _context.Users.FindAsync(post.UserId);
            if (user != null)
            {
                post.AuthorName = user.FullName;
                post.AuthorImage = user.ProfileImage ?? string.Empty;
            }

            post.CreatedAt = DateTime.UtcNow;
            post.Upvotes = 0;
            post.Downvotes = 0;

            _context.BlogPosts.Add(post);
            await _context.SaveChangesAsync();

            return Ok(post);
        }

        // PUT: api/Blog/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdatePost(int id, [FromBody] BlogPost updatedPost)
        {
            var post = await _context.BlogPosts.FindAsync(id);
            if (post == null) return NotFound(new { message = "Post not found" });

            post.Title = updatedPost.Title;
            post.Category = updatedPost.Category;
            post.Content = updatedPost.Content;

            await _context.SaveChangesAsync();

            return Ok(post);
        }

        // DELETE: api/Blog/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePost(int id)
        {
            var post = await _context.BlogPosts
                .Include(b => b.Comments)
                .FirstOrDefaultAsync(b => b.Id == id);

            if (post == null) return NotFound(new { message = "Post not found" });

            _context.BlogPosts.Remove(post);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Blog post deleted successfully" });
        }

        // POST: api/Blog/{id}/vote
        [HttpPost("{id}/vote")]
        public async Task<IActionResult> VotePost(int id, [FromBody] VoteDto dto)
        {
            var post = await _context.BlogPosts.FindAsync(id);
            if (post == null) return NotFound(new { message = "Post not found" });

            var type = dto.VoteType?.ToLower() ?? "upvote";

            switch (type)
            {
                case "downvote":
                    post.Downvotes += 1;
                    break;
                case "remove_downvote":
                    if (post.Downvotes > 0) post.Downvotes -= 1;
                    break;
                case "remove_upvote":
                    if (post.Upvotes > 0) post.Upvotes -= 1;
                    break;
                case "upvote":
                default:
                    post.Upvotes += 1;
                    break;
            }

            await _context.SaveChangesAsync();

            return Ok(new { upvotes = post.Upvotes, downvotes = post.Downvotes });
        }

        // POST: api/Blog/{id}/comment
        [HttpPost("{id}/comment")]
        public async Task<IActionResult> AddComment(int id, [FromBody] CommentDto dto)
        {
            var post = await _context.BlogPosts.FindAsync(id);
            if (post == null) return NotFound(new { message = "Post not found" });

            var comment = new BlogComment
            {
                BlogPostId = id,
                UserId = dto.UserId,
                AuthorName = string.IsNullOrWhiteSpace(dto.AuthorName) ? "Candidate" : dto.AuthorName,
                CommentText = dto.CommentText,
                CreatedAt = DateTime.UtcNow
            };

            _context.BlogComments.Add(comment);
            await _context.SaveChangesAsync();

            return Ok(comment);
        }

        private static List<BlogPost> GetSampleSeedPosts()
        {
            return new List<BlogPost>
            {
                new BlogPost
                {
                    UserId = 1,
                    AuthorName = "Satya Kumar",
                    AuthorImage = "",
                    Title = "How I Cracked the React & .NET Full-Stack Interview at Top Tech",
                    Category = "Interview Experience",
                    Content = "Sharing my complete interview breakdown! Technical rounds covered Data Structures (Tree traversals & Dynamic Programming), React performance optimizations (useCallback, React.memo), EF Core query optimization, and System Design for high-throughput REST APIs.",
                    Upvotes = 24,
                    Downvotes = 1,
                    CreatedAt = DateTime.UtcNow.AddDays(-2),
                    Comments = new List<BlogComment>
                    {
                        new BlogComment { AuthorName = "Priya Sharma", CommentText = "Super helpful tips! Thanks for sharing the React optimization points.", CreatedAt = DateTime.UtcNow.AddDays(-1) }
                    }
                },
                new BlogPost
                {
                    UserId = 2,
                    AuthorName = "Aman Verma",
                    AuthorImage = "",
                    Title = "Top 10 System Design & SQL Performance Gotchas Every Candidate Should Know",
                    Category = "Career Advice",
                    Content = "Indexes are your best friend! Always analyze execution plans before pushing complex JOIN queries to production. Here are the top database indexing tips that saved me during technical design rounds.",
                    Upvotes = 18,
                    Downvotes = 0,
                    CreatedAt = DateTime.UtcNow.AddDays(-1),
                    Comments = new List<BlogComment>()
                }
            };
        }
    }
}
