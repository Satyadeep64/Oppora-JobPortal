using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Oppora.API.Data;
using Oppora.API.DTOs;
using Oppora.API.Models;


namespace Oppora.API.Controllers
{

    [Route("api/[controller]")]
    [ApiController]
    public class ApplicationController : ControllerBase
    {

        private readonly AppDbContext _context;


        public ApplicationController(AppDbContext context)
        {
            _context = context;
        }





        // ==========================
        // Candidate Apply Opportunity
        // ==========================

        [HttpPost("apply")]
        public async Task<IActionResult> Apply(ApplyDto dto)
        {

            var alreadyApplied = await _context.Applications
                .AnyAsync(x =>
                    x.UserId == dto.UserId &&
                    x.OpportunityId == dto.OpportunityId
                );


            if (alreadyApplied)
            {
                return BadRequest(
                    "Already applied for this opportunity"
                );
            }



            var application = new Application
            {

                UserId = dto.UserId,

                OpportunityId = dto.OpportunityId,

                Status = "Applied",

                AppliedAt = DateTime.UtcNow

            };



            _context.Applications.Add(application);


            await _context.SaveChangesAsync();



            return Ok(new
            {
                message = "Application submitted successfully"
            });

        }









        // ==================================
        // Get Applicants For Single Opportunity
        // ==================================

        [HttpGet("opportunity/{opportunityId}")]
        public async Task<IActionResult> GetApplicantsByOpportunity(
            int opportunityId
        )
        {


            var applicants = await _context.Applications

                .Where(a =>
                    a.OpportunityId == opportunityId
                )

                .Include(a => a.User)

                .Include(a => a.Opportunity)


                .Select(a => new ApplicantDto
                {

                    ApplicationId = a.Id,


                    UserId = a.UserId,


                    FullName =
                        a.User != null
                        ? a.User.FullName
                        : "User Not Found",



                    Email =
                        a.User != null
                        ? a.User.Email
                        : "Email Not Found",




                    Status = a.Status,


                    AppliedAt = a.AppliedAt,




                    OpportunityTitle =
                        a.Opportunity != null
                        ? a.Opportunity.Title
                        : "Opportunity Not Found",





                    CompanyName =
                        a.Opportunity != null
                        ? a.Opportunity.CompanyName
                        : "Company Not Found"


                })


                .OrderByDescending(
                    x => x.AppliedAt
                )


                .ToListAsync();



            return Ok(applicants);

        }









        // ==========================
        // Update Application Status
        // ==========================

        [HttpPut("{id}/status")]
        public async Task<IActionResult> UpdateStatus(
            int id,
            [FromBody] string status
        )
        {


            var application =
                await _context.Applications
                .FirstOrDefaultAsync(
                    x => x.Id == id
                );



            if (application == null)
            {
                return NotFound(
                    "Application not found"
                );
            }



            application.Status = status;



            await _context.SaveChangesAsync();



            return Ok(new
            {
                message = "Status updated successfully",

                status = application.Status
            });

        }









        // ==================================
        // Recruiter All Applicants
        // ==================================

        [HttpGet("recruiter/{recruiterId}")]
        public async Task<IActionResult> GetRecruiterApplicants(
            int recruiterId
        )
        {


            var applicants = await _context.Applications

                .Include(a => a.User)

                .Include(a => a.Opportunity)



                .Where(a =>
                    a.Opportunity != null &&
                    a.Opportunity.RecruiterId == recruiterId
                )



                .Select(a => new
                {


                    applicationId = a.Id,


                    userId = a.UserId,



                    // IMPORTANT
                    // React expects fullName

                    fullName =
                        a.User != null
                        ? a.User.FullName
                        : "Name Not Available",




                    email =
                        a.User != null
                        ? a.User.Email
                        : "Email Not Available",





                    opportunityTitle =
                        a.Opportunity != null
                        ? a.Opportunity.Title
                        : "Opportunity Not Available",





                    companyName =
                        a.Opportunity != null
                        ? a.Opportunity.CompanyName
                        : "Company Not Available",





                    status = a.Status,




                    appliedAt = a.AppliedAt



                })


                .OrderByDescending(
                    x => x.appliedAt
                )


                .ToListAsync();



            return Ok(applicants);

        }



    }

}