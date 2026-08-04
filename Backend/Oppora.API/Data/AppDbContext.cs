using Microsoft.EntityFrameworkCore;
using Oppora.API.Models;

namespace Oppora.API.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options)
            : base(options)
        {
        }

        // Existing DbSets
        public DbSet<User> Users { get; set; }
        public DbSet<Opportunity> Opportunities { get; set; }
        public DbSet<Application> Applications { get; set; }
 

        // Competition Module DbSets
        public DbSet<Organization> Organizations => Set<Organization>();
        public DbSet<Category> Categories => Set<Category>();
        public DbSet<Location> Locations => Set<Location>();
        public DbSet<Competition> Competitions => Set<Competition>();
        public DbSet<Eligibility> Eligibilities => Set<Eligibility>();
        public DbSet<TimelineRound> TimelineRounds => Set<TimelineRound>();
        public DbSet<Prize> Prizes => Set<Prize>();
        public DbSet<RuleItem> Rules => Set<RuleItem>();
        public DbSet<Tag> Tags => Set<Tag>();
        public DbSet<CompetitionTag> CompetitionTags => Set<CompetitionTag>();
        public DbSet<Registration> Registrations => Set<Registration>();


        public DbSet<Resume> Resumes { get; set; }
        public DbSet<ResumeAnalysisHistory> ResumeAnalysisHistories { get; set; }

        public DbSet<Course> Courses { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<User>()
                .Property(x => x.Password)
                .HasColumnName("Password");

            modelBuilder.Entity<User>()
                .Property(x => x.PasswordHash)
                .HasColumnName("PasswordHash");


            modelBuilder.Entity<Opportunity>()
                .HasOne(o => o.Recruiter)
                .WithMany()
                .HasForeignKey(o => o.RecruiterId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Application>()
                .HasOne(a => a.User)
                .WithMany()
                .HasForeignKey(a => a.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Application>()
                .HasOne(a => a.Opportunity)
                .WithMany()
                .HasForeignKey(a => a.OpportunityId)
                .OnDelete(DeleteBehavior.Restrict);


            // Composite primary key for CompetitionTag join table
            modelBuilder.Entity<CompetitionTag>()
                .HasKey(ct => new { ct.CompetitionId, ct.TagId });

            modelBuilder.Entity<CompetitionTag>()
                .HasOne(ct => ct.Competition)
                .WithMany(c => c.CompetitionTags)
                .HasForeignKey(ct => ct.CompetitionId);

            modelBuilder.Entity<CompetitionTag>()
                .HasOne(ct => ct.Tag)
                .WithMany(t => t.CompetitionTags)
                .HasForeignKey(ct => ct.TagId);

            // 1-to-1 relationship between Competition and Eligibility
            modelBuilder.Entity<Competition>()
                .HasOne(c => c.Eligibility)
                .WithOne(e => e.Competition)
                .HasForeignKey<Eligibility>(e => e.CompetitionId)
                .OnDelete(DeleteBehavior.Cascade);

            // 1-to-Many relationships with Cascade delete
            modelBuilder.Entity<Competition>()
                .HasMany(c => c.TimelineRounds)
                .WithOne(t => t.Competition)
                .HasForeignKey(t => t.CompetitionId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Competition>()
                .HasMany(c => c.Prizes)
                .WithOne(p => p.Competition)
                .HasForeignKey(p => p.CompetitionId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Competition>()
                .HasMany(c => c.Rules)
                .WithOne(r => r.Competition)
                .HasForeignKey(r => r.CompetitionId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Competition>()
                .HasMany(c => c.Registrations)
                .WithOne(r => r.Competition)
                .HasForeignKey(r => r.CompetitionId)
                .OnDelete(DeleteBehavior.Cascade);

            // Unique Indexes
            modelBuilder.Entity<Category>()
                .HasIndex(c => c.Name)
                .IsUnique();

            modelBuilder.Entity<Tag>()
                .HasIndex(t => t.Name)
                .IsUnique();
        }
    }
}

            modelBuilder.Entity<Resume>()
            .HasOne(r => r.User)
            .WithMany(u => u.Resumes)
            .HasForeignKey(r => r.UserId)
            .OnDelete(DeleteBehavior.Cascade);
            modelBuilder.Entity<Opportunity>()
    .HasOne(o => o.Recruiter)
    .WithMany()
    .HasForeignKey(o => o.RecruiterId)
    .OnDelete(DeleteBehavior.NoAction);
        }
    }
}

