using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Oppora.API.Data;
using Oppora.API.Models;
using Microsoft.EntityFrameworkCore;
using Oppora.API.Services;

namespace Oppora.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class OpportunitiesController : ControllerBase
    {

        private readonly AppDbContext _context;
        private readonly IEmailService _emailService;


        public OpportunitiesController(AppDbContext context, IEmailService emailService)
        {
            _context = context;
            _emailService = emailService;
        }



        // POST: api/Opportunities
        // POST: api/Opportunities
        [HttpPost]
        [Authorize(Roles = "Recruiter")]
        public async Task<IActionResult> CreateOpportunity(
            [FromForm] Opportunity opportunity,
            IFormFile? CompanyLogo)
        {

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }


            var recruiterExists = await _context.Users
                .AnyAsync(u => u.Id == opportunity.RecruiterId);


            if (!recruiterExists)
            {
                return BadRequest("Recruiter does not exist");
            }



            // Upload Company Logo
            if (CompanyLogo != null && CompanyLogo.Length > 0)
            {
                var uploadsFolder = Path.Combine(
                    Directory.GetCurrentDirectory(),
                    "wwwroot/images"
                );


                if (!Directory.Exists(uploadsFolder))
                {
                    Directory.CreateDirectory(uploadsFolder);
                }


                var fileName = Guid.NewGuid().ToString()
                    + Path.GetExtension(CompanyLogo.FileName);


                var filePath = Path.Combine(
                    uploadsFolder,
                    fileName
                );


                using (var stream = new FileStream(
                    filePath,
                    FileMode.Create))
                {
                    await CompanyLogo.CopyToAsync(stream);
                }


                opportunity.CompanyLogo = "/images/" + fileName;
            }



            opportunity.CreatedAt = DateTime.UtcNow;


            opportunity.Recruiter = null;


            _context.Opportunities.Add(opportunity);

            await _context.SaveChangesAsync();

            // Send Email to Candidates
            var candidates = await _context.Users
                .Where(u => u.Role == "Candidate")
                .ToListAsync();


            foreach (var candidate in candidates)
            {
                string emailBody = $@"
    <h2>New Opportunity Available 🚀</h2>

    <p>Hello {candidate.FullName},</p>

    <p>A new opportunity has been posted on Oppora.</p>

    <h3>{opportunity.Title}</h3>

    <p>
    Company: {opportunity.CompanyName}<br/>
    Location: {opportunity.Location}
    </p>

    <p>
    Login to Oppora and apply now.
    </p>

    <br/>

    <p>
    Oppora Team
    </p>
    ";


                await _emailService.SendEmailAsync(
                    candidate.Email,
                    $"New Opportunity - {opportunity.Title}",
                    emailBody
                );
            }


            // Notify Candidates
            var candidateIds = await _context.Users
                .Where(u => u.Role == "Candidate")
                .Select(u => u.Id)
                .ToListAsync();



            foreach (var candidateId in candidateIds)
            {
                _context.Notifications.Add(new Notification
                {
                    UserId = candidateId,
                    Title = "New Job Opportunity! 🚀",
                    Message =
                    $"{opportunity.CompanyName} is hiring for '{opportunity.Title}' in {opportunity.Location}.",
                    Type = "JobPosted",
                    IsRead = false,
                    CreatedAt = DateTime.UtcNow
                });
            }


            await _context.SaveChangesAsync();



            return Ok(new
            {
                message = "Opportunity posted successfully",
                id = opportunity.Id
            });

        }


        // GET: api/Opportunities/{id}
        // Candidate View Details
        [HttpGet("{id}")]
        public async Task<IActionResult> GetOpportunityById(int id)
        {

            var opportunity = await _context.Opportunities
                .FirstOrDefaultAsync(x => x.Id == id);


            if (opportunity == null)
            {
                return NotFound("Opportunity not found");
            }


            return Ok(opportunity);

        }





        // GET: api/Opportunities/recruiter/{recruiterId}
        // Recruiter Manage Jobs
        [HttpGet("recruiter/{recruiterId}")]
        public async Task<IActionResult> GetRecruiterOpportunities(int recruiterId)
        {

            var opportunities = await _context.Opportunities
                .Where(o => o.RecruiterId == recruiterId)
                .OrderByDescending(o => o.CreatedAt)
                .ToListAsync();


            return Ok(opportunities);

        }





        // GET: api/Opportunities
        // Candidate Explore Jobs
        [HttpGet]
        public async Task<IActionResult> GetAllOpportunities()
        {

            var opportunities = await _context.Opportunities
                .Where(o => o.Deadline >= DateTime.UtcNow)
                .OrderByDescending(o => o.CreatedAt)
                .Select(o => new
                {
                    o.Id,
                    o.Title,
                    o.CompanyName,
                    o.CompanyLogo,
                    o.Type,
                    o.Location,
                    o.EmploymentType,
                    o.Experience,
                    o.Skills,
                   
                    o.Salary,
                    o.Openings,
                    o.Deadline,
                    o.Description
                })
                .ToListAsync();


            return Ok(opportunities);

        }





        // PUT: api/Opportunities/{id}
        // Recruiter Edit Job
        [HttpPut("{id}")]
        [Authorize(Roles = "Recruiter")]
        public async Task<IActionResult> UpdateOpportunity(
            int id,
            Opportunity updatedOpportunity)
        {

            var opportunity = await _context.Opportunities
                .FindAsync(id);


            if (opportunity == null)
            {
                return NotFound("Opportunity not found");
            }



            opportunity.Title = updatedOpportunity.Title;
            opportunity.CompanyName = updatedOpportunity.CompanyName;
            opportunity.Type = updatedOpportunity.Type;
            opportunity.Location = updatedOpportunity.Location;
            opportunity.EmploymentType = updatedOpportunity.EmploymentType;
            opportunity.Experience = updatedOpportunity.Experience;
            opportunity.Skills = updatedOpportunity.Skills;
            opportunity.Description = updatedOpportunity.Description;
            opportunity.Salary = updatedOpportunity.Salary;
            opportunity.Openings = updatedOpportunity.Openings;
            opportunity.Deadline = updatedOpportunity.Deadline;



            await _context.SaveChangesAsync();



            return Ok(new
            {
                message = "Opportunity updated successfully"
            });

        }






        // DELETE: api/Opportunities/{id}
        // Recruiter Delete Job
        [HttpDelete("{id}")]
        [Authorize(Roles = "Recruiter")]
        public async Task<IActionResult> DeleteOpportunity(int id)
        {

            var opportunity = await _context.Opportunities
                .FindAsync(id);


            if (opportunity == null)
            {
                return NotFound("Opportunity not found");
            }



            _context.Opportunities.Remove(opportunity);


            await _context.SaveChangesAsync();



            return Ok(new
            {
                message = "Opportunity deleted successfully"
            });

        }

    }
}