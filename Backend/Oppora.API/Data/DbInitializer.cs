using Microsoft.EntityFrameworkCore;
using Oppora.API.Models;
using System.Text.Json;

namespace Oppora.API.Data
{
    public static class DbInitializer
    {
        public static async Task SeedAsync(AppDbContext context)
        {
            // Ensure DB schema is created and all migrations are applied
            try
            {
                await context.Database.MigrateAsync();
            }
            catch
            {
                await context.Database.EnsureCreatedAsync();
            }

            // If at least 20 complete competitions already exist with relational data, skip seeding
            int compCount = await context.Competitions.CountAsync();
            if (compCount >= 20 && await context.TimelineRounds.AnyAsync())
            {
                return;
            }

            // If fewer than 20 competitions exist (or legacy incomplete data), reset & re-seed dataset
            if (compCount > 0)
            {
                var existingComps = await context.Competitions.ToListAsync();
                context.Competitions.RemoveRange(existingComps);
                await context.SaveChangesAsync();
            }

            string jsonPath = Path.Combine(AppContext.BaseDirectory, "Data", "competitions.json");
            if (!File.Exists(jsonPath))
            {
                jsonPath = Path.Combine(Directory.GetCurrentDirectory(), "Data", "competitions.json");
            }

            if (!File.Exists(jsonPath))
            {
                return;
            }

            try
            {
                string jsonString = await File.ReadAllTextAsync(jsonPath);
                using var doc = JsonDocument.Parse(jsonString);
                var root = doc.RootElement;

                if (root.ValueKind != JsonValueKind.Array)
                {
                    return;
                }

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

                        // Organization
                        var orgObj = await context.Organizations.FirstOrDefaultAsync(x => x.Name.ToLower() == orgName.ToLower());
                        if (orgObj == null)
                        {
                            orgObj = new Organization { Name = orgName, LogoUrl = logoUrl };
                            context.Organizations.Add(orgObj);
                            await context.SaveChangesAsync();
                        }

                        // Category
                        var catObj = await context.Categories.FirstOrDefaultAsync(x => x.Name.ToLower() == catName.ToLower());
                        if (catObj == null)
                        {
                            catObj = new Category { Name = catName, Slug = catName.ToLower().Replace(" ", "-") };
                            context.Categories.Add(catObj);
                            await context.SaveChangesAsync();
                        }

                        // Location
                        var locObj = await context.Locations.FirstOrDefaultAsync(x => x.Name.ToLower() == locName.ToLower());
                        if (locObj == null)
                        {
                            locObj = new Location { Name = locName, IsOnline = locName.ToLower().Contains("online") };
                            context.Locations.Add(locObj);
                            await context.SaveChangesAsync();
                        }

                        // Competition
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

                        // Eligibility
                        List<string> eligList = new List<string>();
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

                        // Rounds
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

                        // Prizes
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
                                {
                                    amt = parsedAmt;
                                }

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

                        // Rules
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

                        // Tags
                        List<string> tagNames = new List<string> { catName };
                        if (el.TryGetProperty("tags", out var tagsEl) && tagsEl.ValueKind == JsonValueKind.Array)
                        {
                            foreach (var tItem in tagsEl.EnumerateArray())
                            {
                                if (tItem.ValueKind == JsonValueKind.String && !string.IsNullOrWhiteSpace(tItem.GetString()))
                                {
                                    tagNames.Add(tItem.GetString()!);
                                }
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
                            {
                                comp.CompetitionTags.Add(new CompetitionTag { CompetitionId = comp.Id, TagId = tagObj.Id });
                            }
                        }

                        context.Competitions.Add(comp);
                        await context.SaveChangesAsync();
                    }
                    catch (Exception itemEx)
                    {
                        Console.WriteLine($"[DbInitializer] Error seeding item: {itemEx.Message}");
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[DbInitializer] Error during db initialization: {ex.Message}");
            }
        }
    }
}
