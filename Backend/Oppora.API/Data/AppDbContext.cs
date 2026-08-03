using Microsoft.EntityFrameworkCore;
using Oppora.API.Models;


namespace Oppora.API.Data
{
    public class AppDbContext : DbContext
    {

        public AppDbContext(DbContextOptions options)
        : base(options)
        {

        }


        public DbSet<User> Users { get; set; }

        public DbSet<Opportunity> Opportunities { get; set; }

        public DbSet<Application> Applications { get; set; }

        public DbSet<Resume> Resumes { get; set; }

        public DbSet<Notification> Notifications { get; set; }

        public DbSet<BlogPost> BlogPosts { get; set; }

        public DbSet<BlogComment> BlogComments { get; set; }

        public DbSet<Course> Courses { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<User>()
                .Property(x => x.Password)
                .HasColumnName("Password");


            modelBuilder.Entity<User>()
                .Property(x => x.PasswordHash)
                .HasColumnName("PasswordHash");
        }
}
}