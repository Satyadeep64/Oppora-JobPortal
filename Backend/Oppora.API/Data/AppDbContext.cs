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

        // Standalone Interview Management System (IMS) DbSets
        public DbSet<Interview> Interviews => Set<Interview>();
        public DbSet<Candidate> Candidates => Set<Candidate>();
        public DbSet<Interviewer> Interviewers => Set<Interviewer>();
        public DbSet<InterviewPanel> InterviewPanels => Set<InterviewPanel>();
        public DbSet<InterviewRound> InterviewRounds => Set<InterviewRound>();
        public DbSet<Meeting> Meetings => Set<Meeting>();
        public DbSet<MeetingDetails> MeetingDetails => Set<MeetingDetails>();
        public DbSet<InterviewFeedback> InterviewFeedbacks => Set<InterviewFeedback>();
        public DbSet<InterviewScore> InterviewScores => Set<InterviewScore>();
        public DbSet<InterviewAudit> InterviewAudits => Set<InterviewAudit>();
        public DbSet<Notification> Notifications => Set<Notification>();
        public DbSet<InterviewNotification> InterviewNotifications => Set<InterviewNotification>();
        public DbSet<InterviewAttachment> InterviewAttachments => Set<InterviewAttachment>();
        public DbSet<InterviewPanelMember> InterviewPanelMembers => Set<InterviewPanelMember>();
        public DbSet<EmailQueue> EmailQueues => Set<EmailQueue>();
        public DbSet<InterviewEmail> InterviewEmails => Set<InterviewEmail>();

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

            // Interview Management System Mappings
            modelBuilder.Entity<Interview>()
                .HasOne(i => i.Application)
                .WithMany()
                .HasForeignKey(i => i.ApplicationId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Interview>()
                .HasOne(i => i.Recruiter)
                .WithMany()
                .HasForeignKey(i => i.RecruiterId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Interview>()
                .HasOne(i => i.Candidate)
                .WithMany()
                .HasForeignKey(i => i.CandidateId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Interview>()
                .HasOne(i => i.CandidateEntity)
                .WithMany(c => c.Interviews)
                .HasForeignKey(i => i.CandidateEntityId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<InterviewRound>()
                .HasOne(r => r.Interview)
                .WithMany(i => i.Rounds)
                .HasForeignKey(r => r.InterviewId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Meeting>()
                .HasOne(m => m.InterviewRound)
                .WithMany(r => r.Meetings)
                .HasForeignKey(m => m.InterviewRoundId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<MeetingDetails>()
                .HasOne(m => m.InterviewRound)
                .WithOne(r => r.MeetingDetails)
                .HasForeignKey<MeetingDetails>(m => m.InterviewRoundId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<InterviewPanel>()
                .HasOne(ip => ip.InterviewRound)
                .WithMany(r => r.PanelMembers)
                .HasForeignKey(ip => ip.InterviewRoundId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<InterviewPanel>()
                .HasOne(ip => ip.Interviewer)
                .WithMany(i => i.PanelMemberships)
                .HasForeignKey(ip => ip.InterviewerId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<InterviewFeedback>()
                .HasOne(f => f.InterviewRound)
                .WithMany(r => r.Feedbacks)
                .HasForeignKey(f => f.InterviewRoundId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<InterviewFeedback>()
                .HasOne(f => f.Interviewer)
                .WithMany(i => i.Feedbacks)
                .HasForeignKey(f => f.InterviewerId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<InterviewScore>()
                .HasOne(s => s.InterviewFeedback)
                .WithMany(f => f.Scores)
                .HasForeignKey(s => s.InterviewFeedbackId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<InterviewAudit>()
                .HasOne(a => a.Interview)
                .WithMany(i => i.Audits)
                .HasForeignKey(a => a.InterviewId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Notification>()
                .HasOne(n => n.Interview)
                .WithMany(i => i.SystemNotifications)
                .HasForeignKey(n => n.InterviewId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<InterviewAttachment>()
                .HasOne(att => att.Interview)
                .WithMany(i => i.Attachments)
                .HasForeignKey(att => att.InterviewId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<InterviewEmail>()
                .HasOne(ie => ie.Interview)
                .WithOne(i => i.InterviewEmail)
                .HasForeignKey<InterviewEmail>(ie => ie.InterviewId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}