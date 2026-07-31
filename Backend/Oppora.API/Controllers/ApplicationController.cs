
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Oppora.API.Data;
using Oppora.API.DTOs;
using Oppora.API.Models;
using Oppora.API.Services;

namespace Oppora.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ApplicationController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IEmailService _emailService;


        public ApplicationController(
            AppDbContext context,
            IEmailService emailService)
        {
            _context = context;
            _emailService = emailService;
        }



        // Candidate Apply Opportunity
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
                return BadRequest("Already applied for this opportunity");
            }



            var opp = await _context.Opportunities
                .FindAsync(dto.OpportunityId);


            if (opp == null)
            {
                return NotFound("Opportunity not found");
            }



            var candidateUser = await _context.Users
                .FindAsync(dto.UserId);



            var application = new Application
            {
                UserId = dto.UserId,
                OpportunityId = dto.OpportunityId,
                Status = "Applied",
                AppliedAt = DateTime.UtcNow
            };



            _context.Applications.Add(application);

            await _context.SaveChangesAsync();



            // Recruiter Notification + Email

            if (opp.RecruiterId > 0)
            {

                var recruiterUser = await _context.Users
                    .FindAsync(opp.RecruiterId);



                // In App Notification

                _context.Notifications.Add(new Notification
                {
                    UserId = opp.RecruiterId,

                    Title = "New Applicant! 📄",

                    Message =
                    $"{candidateUser?.FullName ?? "A candidate"} applied for '{opp.Title}'",

                    Type = "ApplicationSubmitted",

                    IsRead = false,

                    CreatedAt = DateTime.UtcNow
                });



                await _context.SaveChangesAsync();





                // Email recruiter

                if(recruiterUser != null &&
                   !string.IsNullOrEmpty(recruiterUser.Email))
                {


                    string recruiterBody = $@"

                    <h2>New Candidate Application Received</h2>

                    <p>
                    Dear {recruiterUser.FullName},
                    </p>

                    <p>
                    Candidate 
                    <strong>{candidateUser?.FullName}</strong>
                    ({candidateUser?.Email})
                    has applied for:
                    </p>


                    <h3>
                    {opp.Title}
                    </h3>


                    <p>
                    Login to Oppora dashboard to review candidate profile.
                    </p>


                    <br/>

                    <p>
                    Oppora Hiring Team
                    </p>

                    ";



                    await _emailService.SendEmailAsync(
                        recruiterUser.Email,
                        $"[New Applicant] {opp.Title}",
                        recruiterBody
                    );

                }

            }





            // Candidate Confirmation Email

            if(candidateUser != null &&
               !string.IsNullOrEmpty(candidateUser.Email))
            {


                string candidateBody = $@"

                <h2>
                Application Submitted Successfully 🚀
                </h2>


                <p>
                Dear {candidateUser.FullName},
                </p>


                <p>
                Your application for 
                <strong>{opp.Title}</strong>
                at
                <strong>{opp.CompanyName}</strong>
                has been submitted successfully.
                </p>


                <p>
                You will receive updates through Oppora.
                </p>


                <br/>

                <p>
                Oppora Career Team
                </p>

                ";



                await _emailService.SendEmailAsync(
                    candidateUser.Email,
                    $"[Application Confirmed] {opp.Title}",
                    candidateBody
                );

            }




            return Ok(new
            {
                message="Application submitted successfully"
            });

        }








        // Get Applicants For Opportunity

        [HttpGet("opportunity/{opportunityId}")]

        public async Task<IActionResult> GetApplicantsByOpportunity(
            int opportunityId)
        {


            var applicants = await _context.Applications

                .Where(a=>a.OpportunityId==opportunityId)

                .Include(a=>a.User)

                .Include(a=>a.Opportunity)

                .Select(a=>new ApplicantDto
                {

                    ApplicationId=a.Id,

                    UserId=a.UserId,

                    FullName=a.User!=null?
                    a.User.FullName:
                    "User Not Found",


                    Email=a.User!=null?
                    a.User.Email:
                    "Email Not Found",


                    Status=a.Status,


                    AppliedAt=a.AppliedAt,


                    OpportunityTitle=
                    a.Opportunity!=null?
                    a.Opportunity.Title:
                    "Not Found",


                    CompanyName=
                    a.Opportunity!=null?
                    a.Opportunity.CompanyName:
                    "Not Found"


                })

                .OrderByDescending(x=>x.AppliedAt)

                .ToListAsync();



            return Ok(applicants);

        }









        // Recruiter updates application status

        [HttpPut("{id}/status")]

        public async Task<IActionResult> UpdateStatus(
            int id,
            [FromBody]string status)
        {


            var application = await _context.Applications

                .Include(a=>a.User)

                .Include(a=>a.Opportunity)

                .FirstOrDefaultAsync(x=>x.Id==id);



            if(application==null)
            {
                return NotFound("Application not found");
            }



            application.Status=status;


            await _context.SaveChangesAsync();




            string oppTitle =
            application.Opportunity?.Title ??
            "Job Application";


            string company =
            application.Opportunity?.CompanyName ??
            "Company";




            string message =
            status=="Shortlisted"

            ?

            $"Congratulations! You are shortlisted for {oppTitle} at {company}"

            :

            status=="Rejected"

            ?

            $"Your application for {oppTitle} at {company} was not selected."

            :

            $"Your application status changed to {status}";






            _context.Notifications.Add(new Notification
            {

                UserId=application.UserId,

                Title="Application Status Updated",

                Message=message,

                Type="StatusChanged",

                IsRead=false,

                CreatedAt=DateTime.UtcNow

            });



            await _context.SaveChangesAsync();







            // Status email

            if(application.User!=null &&
               !string.IsNullOrEmpty(application.User.Email))
            {


                string emailBody=$@"

                <h2>
                Application Status Update
                </h2>


                <p>
                Dear {application.User.FullName},
                </p>


                <p>
                {message}
                </p>


                <br/>

                <p>
                Oppora Talent Team
                </p>


                ";



                await _emailService.SendEmailAsync(

                    application.User.Email,

                    $"[{status}] Application Update",

                    emailBody

                );


            }





            return Ok(new
            {
                message="Status updated successfully",
                status=status
            });

        }








        // Recruiter All Applicants

        [HttpGet("recruiter/{recruiterId}")]

        public async Task<IActionResult> GetRecruiterApplicants(
            int recruiterId)
        {


            var applicants = await _context.Applications

            .Include(a=>a.User)

            .Include(a=>a.Opportunity)

            .Where(a=>
            a.Opportunity!=null &&
            a.Opportunity.RecruiterId==recruiterId)

            .Select(a=>new
            {

                applicationId=a.Id,

                userId=a.UserId,

                fullName=a.User!=null?
                a.User.FullName:
                "Not Available",

                email=a.User!=null?
                a.User.Email:
                "Not Available",

                opportunityTitle=a.Opportunity!.Title,

                companyName=a.Opportunity.CompanyName,

                status=a.Status,

                appliedAt=a.AppliedAt


            })

            .OrderByDescending(x=>x.appliedAt)

            .ToListAsync();



            return Ok(applicants);

        }


    }
}
