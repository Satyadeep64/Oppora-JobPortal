using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Oppora.API.Data;

namespace Oppora.API.Controllers
{

    [Route("api/[controller]")]
    [ApiController]
    public class DashboardController : ControllerBase
    {

        private readonly AppDbContext _context;


        public DashboardController(AppDbContext context)
        {
            _context = context;
        }







        // =========================================
        // RECRUITER DASHBOARD
        // =========================================


        [HttpGet("recruiter/{id}")]
        public async Task<IActionResult> GetRecruiterDashboard(int id)
        {


            var profile = await _context.Users
                .Where(x => x.Id == id)
                .Select(x => new
                {
                    x.FullName,
                    x.Email,
                    x.Role,
                    x.CreatedAt
                })
                .FirstOrDefaultAsync();



            if (profile == null)
            {
                return NotFound("Recruiter not found");
            }







            var opportunities = await _context.Opportunities

                .Where(x => x.RecruiterId == id)

                .OrderByDescending(x => x.CreatedAt)

                .ToListAsync();








            var applications = await _context.Applications

                .Where(x => x.Opportunity.RecruiterId == id)

                .Include(x => x.User)

                .Include(x => x.Opportunity)

                .OrderByDescending(x => x.AppliedAt)

                .Take(5)

                .Select(x => new
                {

                    x.Id,

                    Candidate = new
                    {
                        x.User.Id,
                        x.User.FullName,
                        x.User.Email
                    },


                    Opportunity = new
                    {
                        x.Opportunity.Id,
                        x.Opportunity.Title
                    },


                    x.Status,
                    x.AppliedAt

                })

                .ToListAsync();







            var dashboard = new
            {

                profile,


                statistics = new
                {

                    totalJobs = opportunities.Count,

                    totalApplications = applications.Count,


                    activeJobs = opportunities
                        .Count(x => x.Deadline >= DateTime.UtcNow),


                    shortlisted = applications
                        .Count(x => x.Status == "Shortlisted")

                },


                opportunities,


                applications

            };



            return Ok(dashboard);

        }













        // =========================================
        // CANDIDATE DASHBOARD
        // =========================================



        [HttpGet("candidate/{id}")]
        public async Task<IActionResult> GetCandidateDashboard(int id)
        {



            // Get complete user
            var user = await _context.Users
                .FirstOrDefaultAsync(x => x.Id == id);



            if (user == null)
            {
                return NotFound("Candidate not found");
            }








            // Applied Jobs Count

            var appliedJobs = await _context.Applications

                .CountAsync(x => x.UserId == id);









            // Recent Applications


            var recentApplications = await _context.Applications

                .Where(x => x.UserId == id)

                .Include(x => x.Opportunity)

                .OrderByDescending(x => x.AppliedAt)

                .Take(5)

                .Select(x => new
                {

                    x.Id,


                    Opportunity = new
                    {
                        x.Opportunity.Id,
                        x.Opportunity.Title,
                        x.Opportunity.CompanyName
                    },


                    x.Status,

                    x.AppliedAt


                })

                .ToListAsync();










            // Recommended Jobs


            var recommendedJobs = await _context.Opportunities

                .OrderByDescending(x => x.CreatedAt)

                .Take(6)

                .Select(x => new
                {

                    x.Id,

                    x.Title,

                    x.CompanyName,

                    x.Location,

                    x.EmploymentType,

                    x.Type


                })

                .ToListAsync();









            // SAME CALCULATION AS PROFILE PAGE

            var profileCompletion =
                CalculateProfileCompletion(user);








            var dashboard = new
            {

                profile = new
                {

                    user.Id,

                    user.FullName,

                    user.Email,

                    user.ProfileImage,

                    user.Resume,

                    user.Skills

                },



                statistics = new
                {

                    appliedJobs,

                    savedJobs = 0,

                    recommendedJobs = recommendedJobs.Count,

                    profileCompletion

                },



                recommendedJobs,


                recentApplications


            };





            return Ok(dashboard);


        }












        // =========================================
        // PROFILE COMPLETION
        // SAME AS Profile.jsx
        // =========================================


        private int CalculateProfileCompletion(Models.User user)
        {


            int completion = 0;



            if (!string.IsNullOrEmpty(user.FullName))
            {
                completion += 20;
            }



            if (!string.IsNullOrEmpty(user.Email))
            {
                completion += 20;
            }



            if (!string.IsNullOrEmpty(user.ProfileImage))
            {
                completion += 20;
            }



            if (!string.IsNullOrEmpty(user.Skills))
            {
                completion += 20;
            }



            if (!string.IsNullOrEmpty(user.Resume))
            {
                completion += 20;
            }



            return completion;


        }



    }

}