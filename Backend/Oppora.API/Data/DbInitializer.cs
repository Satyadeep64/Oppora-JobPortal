using Microsoft.EntityFrameworkCore;
using Oppora.API.Models;
using System.Text.Json;

namespace Oppora.API.Data
{
    public static class DbInitializer
    {
        public static async Task SeedAsync(AppDbContext context)
        {
            // EnsureCreatedAsync creates all tables defined in the DbContext via EF Core.
            // This is the correct approach for both MySQL and SQL Server.
            try
            {
                await context.Database.EnsureCreatedAsync();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[DbInitializer] EnsureCreated notice: {ex.Message}");
            }

            // Run MySQL-compatible column migrations for any schema gaps
            await EnsureColumnsMySqlAsync(context);

            // Seed default recruiter user if none exist
            try
            {
                if (!await context.Users.AnyAsync(u => u.Role == "Recruiter" || u.Role == "Admin"))
                {
                    context.Users.Add(new User
                    {
                        FullName = "Oppora Lead Recruiter",
                        Email = "opporateam@gmail.com",
                        Password = "hashed_password",
                        PasswordHash = "hashed_password",
                        Role = "Recruiter",
                        CreatedAt = DateTime.UtcNow
                    });
                    await context.SaveChangesAsync();
                }

                if (!await context.Users.AnyAsync(u => u.Role == "Candidate" || u.Role == "Student"))
                {
                    context.Users.Add(new User
                    {
                        FullName = "Alex Rivera",
                        Email = "alex.rivera@example.com",
                        Password = "hashed_password",
                        PasswordHash = "hashed_password",
                        Role = "Candidate",
                        CreatedAt = DateTime.UtcNow
                    });
                    await context.SaveChangesAsync();
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[DbInitializer] User seeding notice: {ex.Message}");
            }

            // Skip competition seeding if enough already exist
            try
            {
                int compCount = await context.Competitions.CountAsync();
                if (compCount >= 20 && await context.TimelineRounds.AnyAsync())
                    return;

                if (compCount > 0)
                {
                    var existingComps = await context.Competitions.ToListAsync();
                    context.Competitions.RemoveRange(existingComps);
                    await context.SaveChangesAsync();
                }

                string jsonPath = Path.Combine(AppContext.BaseDirectory, "Data", "competitions.json");
                if (!File.Exists(jsonPath))
                    jsonPath = Path.Combine(Directory.GetCurrentDirectory(), "Data", "competitions.json");

                if (!File.Exists(jsonPath))
                    return;

                string jsonString = await File.ReadAllTextAsync(jsonPath);
                using var doc = JsonDocument.Parse(jsonString);
                var root = doc.RootElement;

                if (root.ValueKind != JsonValueKind.Array)
                    return;

                foreach (var el in root.EnumerateArray())
                {
                    try
                    {
                        string title = el.TryGetProperty("title", out var t) ? t.GetString() ?? "" : "";
                        if (string.IsNullOrWhiteSpace(title)) continue;

                        string orgName = el.TryGetProperty("organization", out var o) ? o.GetString() ?? "Oppora Host" : "Oppora Host";
                        string logoUrl = el.TryGetProperty("logo", out var l) ? l.GetString() ?? "" : "";
                        string catName = el.TryGetProperty("category", out var c) ? c.GetString() ?? "Competitions" : "Competitions";
                        string locName = el.TryGetProperty("location", out var loc) ? loc.GetString() ?? "Online" : "Online";
                        string mode = el.TryGetProperty("mode", out var m) ? m.GetString() ?? "Online" : "Online";
                        string teamSize = el.TryGetProperty("teamSize", out var ts) ? ts.GetString() ?? "1 - 4 Members" : "1 - 4 Members";
                        string regFee = el.TryGetProperty("registrationFee", out var rf) ? rf.GetString() ?? "Free" : "Free";
                        string desc = el.TryGetProperty("description", out var d) ? d.GetString() ?? "" : "";
                        string overview = el.TryGetProperty("overview", out var ov) ? ov.GetString() ?? desc : desc;
                        string regUrl = el.TryGetProperty("officialRegistrationUrl", out var ru) ? ru.GetString() ?? "https://oppora.com" : "https://oppora.com";

                        bool isFeatured = false;
                        if (el.TryGetProperty("featured", out var f))
                        {
                            if (f.ValueKind == JsonValueKind.True) isFeatured = true;
                            else if (f.ValueKind == JsonValueKind.String && bool.TryParse(f.GetString(), out bool b)) isFeatured = b;
                        }

                        int viewsCount = 1200;
                        if (el.TryGetProperty("registeredCount", out var rc))
                        {
                            if (rc.ValueKind == JsonValueKind.Number) viewsCount = rc.GetInt32();
                            else if (rc.ValueKind == JsonValueKind.String)
                            {
                                var digits = new string(rc.GetString()?.Where(char.IsDigit).ToArray());
                                if (int.TryParse(digits, out int parsedRc)) viewsCount = parsedRc;
                            }
                        }
                        else if (el.TryGetProperty("views", out var v))
                        {
                            if (v.ValueKind == JsonValueKind.Number) viewsCount = v.GetInt32();
                            else if (v.ValueKind == JsonValueKind.String && int.TryParse(v.GetString(), out int parsedV)) viewsCount = parsedV;
                        }

                        var orgObj = await context.Organizations.FirstOrDefaultAsync(x => x.Name.ToLower() == orgName.ToLower());
                        if (orgObj == null)
                        {
                            orgObj = new Organization { Name = orgName, LogoUrl = logoUrl };
                            context.Organizations.Add(orgObj);
                            await context.SaveChangesAsync();
                        }

                        var catObj = await context.Categories.FirstOrDefaultAsync(x => x.Name.ToLower() == catName.ToLower());
                        if (catObj == null)
                        {
                            catObj = new Category { Name = catName, Slug = catName.ToLower().Replace(" ", "-") };
                            context.Categories.Add(catObj);
                            await context.SaveChangesAsync();
                        }

                        var locObj = await context.Locations.FirstOrDefaultAsync(x => x.Name.ToLower() == locName.ToLower());
                        if (locObj == null)
                        {
                            locObj = new Location { Name = locName, IsOnline = locName.ToLower().Contains("online") };
                            context.Locations.Add(locObj);
                            await context.SaveChangesAsync();
                        }

                        var comp = new Competition
                        {
                            Title = title,
                            Description = string.IsNullOrWhiteSpace(overview) ? desc : overview,
                            OrganizationId = orgObj.Id,
                            CategoryId = catObj.Id,
                            LocationId = locObj.Id,
                            Mode = mode,
                            TeamSize = teamSize,
                            MinTeamMembers = 1,
                            MaxTeamMembers = 4,
                            RegistrationFee = regFee,
                            RegistrationDeadline = DateTime.UtcNow.AddDays(30),
                            IsFeatured = isFeatured,
                            RegisteredCount = viewsCount,
                            OfficialRegistrationUrl = regUrl,
                            CreatedAt = DateTime.UtcNow
                        };

                        List<string> eligList = new();
                        if (el.TryGetProperty("eligibility", out var eligEl) && eligEl.ValueKind == JsonValueKind.Array)
                        {
                            foreach (var item in eligEl.EnumerateArray())
                            {
                                if (item.ValueKind == JsonValueKind.String && !string.IsNullOrWhiteSpace(item.GetString()))
                                    eligList.Add(item.GetString()!);
                            }
                        }

                        comp.Eligibility = new Eligibility
                        {
                            CompetitionId = comp.Id,
                            DegreeRequirement = eligList.Count > 0 ? eligList[0] : "All Bachelor's & Master's Students",
                            BatchRequirement = eligList.Count > 1 ? eligList[1] : "All Passing Batches Eligible",
                            DomainSpecialization = eligList.Count > 2 ? eligList[2] : "Open to All Disciplines & Streams",
                            MinAge = 18,
                            MaxAge = 35
                        };

                        int roundNo = 1;
                        if (el.TryGetProperty("rounds", out var roundsEl) && roundsEl.ValueKind == JsonValueKind.Array)
                        {
                            foreach (var r in roundsEl.EnumerateArray())
                            {
                                string rTitle = r.TryGetProperty("title", out var rt) ? rt.GetString() ?? $"Round {roundNo}" : $"Round {roundNo}";
                                string rDesc = r.TryGetProperty("description", out var rd) ? rd.GetString() ?? "" : "";
                                string rDateStr = r.TryGetProperty("startDate", out var rsd) ? rsd.GetString() ?? "" : "";
                                DateTime rDate = DateTime.TryParse(rDateStr, out var parsedRDate) ? parsedRDate : DateTime.UtcNow.AddDays(7 * roundNo);

                                comp.TimelineRounds.Add(new TimelineRound
                                {
                                    CompetitionId = comp.Id,
                                    RoundNumber = roundNo++,
                                    RoundTitle = rTitle,
                                    Description = rDesc,
                                    RoundDate = rDate
                                });
                            }
                        }
                        else if (el.TryGetProperty("importantDates", out var datesEl) && datesEl.ValueKind == JsonValueKind.Array)
                        {
                            foreach (var dItem in datesEl.EnumerateArray())
                            {
                                string dTitle = dItem.TryGetProperty("title", out var dt) ? dt.GetString() ?? $"Phase {roundNo}" : $"Phase {roundNo}";
                                string dDesc = dItem.TryGetProperty("description", out var dd) ? dd.GetString() ?? "" : "";
                                string dDateStr = dItem.TryGetProperty("date", out var ddt) ? ddt.GetString() ?? "" : "";
                                DateTime dDate = DateTime.TryParse(dDateStr, out var parsedDDate) ? parsedDDate : DateTime.UtcNow.AddDays(7 * roundNo);

                                comp.TimelineRounds.Add(new TimelineRound
                                {
                                    CompetitionId = comp.Id,
                                    RoundNumber = roundNo++,
                                    RoundTitle = dTitle,
                                    Description = dDesc,
                                    RoundDate = dDate
                                });
                            }
                        }

                        int rankNo = 1;
                        if (el.TryGetProperty("prizes", out var prizesEl) && prizesEl.ValueKind == JsonValueKind.Array)
                        {
                            foreach (var p in prizesEl.EnumerateArray())
                            {
                                string posName = p.TryGetProperty("position", out var pos) ? pos.GetString() ?? $"Rank #{rankNo}" : $"Rank #{rankNo}";
                                string rewardDesc = p.TryGetProperty("reward", out var rew) ? rew.GetString() ?? "" : "";
                                decimal amt = 1000 * (4 - Math.Min(rankNo, 3));

                                var digits = new string(rewardDesc.Where(char.IsDigit).ToArray());
                                if (!string.IsNullOrEmpty(digits) && decimal.TryParse(digits, out decimal parsedAmt))
                                    amt = parsedAmt;

                                comp.Prizes.Add(new Prize
                                {
                                    CompetitionId = comp.Id,
                                    Rank = rankNo++,
                                    PositionName = posName,
                                    RewardDescription = rewardDesc,
                                    Amount = amt
                                });
                            }
                        }

                        int ruleOrder = 1;
                        if (el.TryGetProperty("rules", out var rulesEl) && rulesEl.ValueKind == JsonValueKind.Array)
                        {
                            foreach (var rItem in rulesEl.EnumerateArray())
                            {
                                if (rItem.ValueKind == JsonValueKind.String && !string.IsNullOrWhiteSpace(rItem.GetString()))
                                {
                                    comp.Rules.Add(new RuleItem
                                    {
                                        CompetitionId = comp.Id,
                                        RuleText = rItem.GetString()!,
                                        DisplayOrder = ruleOrder++
                                    });
                                }
                            }
                        }
                        else if (eligList.Count > 0)
                        {
                            foreach (var rule in eligList)
                            {
                                comp.Rules.Add(new RuleItem
                                {
                                    CompetitionId = comp.Id,
                                    RuleText = rule,
                                    DisplayOrder = ruleOrder++
                                });
                            }
                        }

                        List<string> tagNames = new() { catName };
                        if (el.TryGetProperty("tags", out var tagsEl) && tagsEl.ValueKind == JsonValueKind.Array)
                        {
                            foreach (var tItem in tagsEl.EnumerateArray())
                            {
                                if (tItem.ValueKind == JsonValueKind.String && !string.IsNullOrWhiteSpace(tItem.GetString()))
                                    tagNames.Add(tItem.GetString()!);
                            }
                        }

                        foreach (var tagName in tagNames.Distinct())
                        {
                            var tagObj = await context.Tags.FirstOrDefaultAsync(t => t.Name.ToLower() == tagName.ToLower());
                            if (tagObj == null)
                            {
                                tagObj = new Tag { Name = tagName };
                                context.Tags.Add(tagObj);
                                await context.SaveChangesAsync();
                            }

                            if (!comp.CompetitionTags.Any(ct => ct.TagId == tagObj.Id))
                                comp.CompetitionTags.Add(new CompetitionTag { CompetitionId = comp.Id, TagId = tagObj.Id });
                        }

                        context.Competitions.Add(comp);
                        await context.SaveChangesAsync();
                    }
                    catch (Exception itemEx)
                    {
                        Console.WriteLine($"[DbInitializer] Error seeding competition: {itemEx.Message}");
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[DbInitializer] Competition seeding notice: {ex.Message}");
            }
        }

        /// <summary>
        /// Runs MySQL-compatible ALTER TABLE statements to add any missing columns
        /// that EF Core's EnsureCreated may not have added (due to schema drift).
        /// Uses MySQL's IF NOT EXISTS syntax for ADD COLUMN (MySQL 8.0+).
        /// </summary>
        private static async Task EnsureColumnsMySqlAsync(AppDbContext context)
        {
            try
            {
                // Detect if we're using MySQL by checking the provider name
                var providerName = context.Database.ProviderName ?? "";
                if (!providerName.Contains("MySql", StringComparison.OrdinalIgnoreCase) &&
                    !providerName.Contains("Pomelo", StringComparison.OrdinalIgnoreCase))
                {
                    // Not MySQL — skip (SQL Server handled by EnsureCreated)
                    return;
                }

                // MySQL 8.0.29+ supports ALTER TABLE IF NOT EXISTS for ADD COLUMN
                // Wrapped in individual try-catch blocks so one failure doesn't stop others
                var alterStatements = new[]
                {
                    // Interviews table — ensure all critical columns exist
                    "ALTER TABLE `Interviews` ADD COLUMN IF NOT EXISTS `CandidateName` VARCHAR(150) NULL;",
                    "ALTER TABLE `Interviews` ADD COLUMN IF NOT EXISTS `CandidateEmail` VARCHAR(150) NULL;",
                    "ALTER TABLE `Interviews` ADD COLUMN IF NOT EXISTS `CandidatePhone` VARCHAR(50) NULL;",
                    "ALTER TABLE `Interviews` ADD COLUMN IF NOT EXISTS `JobRole` VARCHAR(150) NULL;",
                    "ALTER TABLE `Interviews` ADD COLUMN IF NOT EXISTS `Department` VARCHAR(150) NULL;",
                    "ALTER TABLE `Interviews` ADD COLUMN IF NOT EXISTS `Interviewer` VARCHAR(150) NULL;",
                    "ALTER TABLE `Interviews` ADD COLUMN IF NOT EXISTS `InterviewRound` VARCHAR(100) NULL;",
                    "ALTER TABLE `Interviews` ADD COLUMN IF NOT EXISTS `InterviewType` VARCHAR(50) NULL;",
                    "ALTER TABLE `Interviews` ADD COLUMN IF NOT EXISTS `GoogleMeetLink` VARCHAR(500) NULL;",
                    "ALTER TABLE `Interviews` ADD COLUMN IF NOT EXISTS `Notes` TEXT NULL;",
                    "ALTER TABLE `Interviews` ADD COLUMN IF NOT EXISTS `Status` VARCHAR(50) NOT NULL DEFAULT 'Scheduled';",
                    "ALTER TABLE `Interviews` ADD COLUMN IF NOT EXISTS `OverallStatus` VARCHAR(50) NOT NULL DEFAULT 'Scheduled';",
                    "ALTER TABLE `Interviews` ADD COLUMN IF NOT EXISTS `InvitationStatus` VARCHAR(50) NOT NULL DEFAULT 'Pending';",
                    "ALTER TABLE `Interviews` ADD COLUMN IF NOT EXISTS `Duration` INT NOT NULL DEFAULT 45;",
                    "ALTER TABLE `Interviews` ADD COLUMN IF NOT EXISTS `InterviewTime` VARCHAR(50) NULL;",
                    "ALTER TABLE `Interviews` ADD COLUMN IF NOT EXISTS `InterviewDate` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP;",
                    "ALTER TABLE `Interviews` ADD COLUMN IF NOT EXISTS `RecruiterNotes` TEXT NULL;",
                    "ALTER TABLE `Interviews` ADD COLUMN IF NOT EXISTS `CreatedBy` VARCHAR(150) NULL;",
                    "ALTER TABLE `Interviews` ADD COLUMN IF NOT EXISTS `OverallResult` VARCHAR(50) NULL;",
                    "ALTER TABLE `Interviews` ADD COLUMN IF NOT EXISTS `UpdatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP;",
                    "ALTER TABLE `Interviews` ADD COLUMN IF NOT EXISTS `CustomCandidateName` VARCHAR(150) NULL;",
                    "ALTER TABLE `Interviews` ADD COLUMN IF NOT EXISTS `CustomCandidateEmail` VARCHAR(150) NULL;",
                    "ALTER TABLE `Interviews` ADD COLUMN IF NOT EXISTS `CustomJobTitle` VARCHAR(150) NULL;",
                    "ALTER TABLE `Interviews` ADD COLUMN IF NOT EXISTS `Location` VARCHAR(200) NULL;",

                    // InterviewAudits table — ensure Changes/Details column exists
                    "ALTER TABLE `InterviewAudits` ADD COLUMN IF NOT EXISTS `Details` VARCHAR(1000) NULL;",
                    "ALTER TABLE `InterviewAudits` ADD COLUMN IF NOT EXISTS `OldValue` VARCHAR(1000) NULL;",
                    "ALTER TABLE `InterviewAudits` ADD COLUMN IF NOT EXISTS `NewValue` VARCHAR(1000) NULL;",
                    "ALTER TABLE `InterviewAudits` ADD COLUMN IF NOT EXISTS `PerformedByName` VARCHAR(150) NULL;",
                    "ALTER TABLE `InterviewAudits` ADD COLUMN IF NOT EXISTS `PerformedByUserId` INT NOT NULL DEFAULT 0;",

                    // Candidates table extra columns
                    "ALTER TABLE `Candidates` ADD COLUMN IF NOT EXISTS `Phone` VARCHAR(50) NULL;",
                    "ALTER TABLE `Candidates` ADD COLUMN IF NOT EXISTS `PhoneNumber` VARCHAR(50) NULL;",
                    "ALTER TABLE `Candidates` ADD COLUMN IF NOT EXISTS `College` VARCHAR(200) NULL;",
                    "ALTER TABLE `Candidates` ADD COLUMN IF NOT EXISTS `CurrentCompany` VARCHAR(150) NULL;",
                    "ALTER TABLE `Candidates` ADD COLUMN IF NOT EXISTS `ExperienceYears` DOUBLE NOT NULL DEFAULT 0;",
                    "ALTER TABLE `Candidates` ADD COLUMN IF NOT EXISTS `Source` VARCHAR(100) NULL;",
                    "ALTER TABLE `Candidates` ADD COLUMN IF NOT EXISTS `UpdatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP;",
                    "ALTER TABLE `Candidates` ADD COLUMN IF NOT EXISTS `CreatedOn` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP;",
                    "ALTER TABLE `Candidates` ADD COLUMN IF NOT EXISTS `UserId` INT NULL;",
                };

                foreach (var sql in alterStatements)
                {
                    try
                    {
                        await context.Database.ExecuteSqlRawAsync(sql);
                    }
                    catch (Exception colEx)
                    {
                        // Non-critical — column may already exist or table may not exist yet
                        Console.WriteLine($"[DbInitializer] Column migration notice: {colEx.Message.Split('\n')[0]}");
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[DbInitializer] Schema migration notice: {ex.Message}");
            }
        }
    }
}
