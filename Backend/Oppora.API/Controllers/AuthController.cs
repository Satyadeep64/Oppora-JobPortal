using Microsoft.AspNetCore.Mvc;
using Oppora.API.Data;
using Oppora.API.DTOs;
using Oppora.API.Models;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using BCrypt.Net;
using Oppora.API.Services;

namespace Oppora.API.Controllers
{
    [ApiController]
    [Route("api/auth")]

    public class AuthController : ControllerBase
    {
        private readonly AppDbContext db;
        private readonly IConfiguration config;
        private readonly IEmailService _emailService;


        public AuthController(
            AppDbContext context,
            IConfiguration configuration, IEmailService emailService
        )
        {
            db = context;
            config = configuration;
            _emailService = emailService;
        }



        // REGISTER

        [HttpPost("register")]
        public async Task<IActionResult> Register(RegisterDto request)
        {

            var existingUser = db.Users
                .FirstOrDefault(x => x.Email == request.Email);


            if (existingUser != null)
            {
                return BadRequest("Email already exists");
            }



            var user = new User
            {

                FullName = request.FullName,

                Email = request.Email,


                PasswordHash =
                BCrypt.Net.BCrypt.HashPassword(
                    request.Password
                ),
                Password=request.Password,


                Role = request.Role,


                CreatedAt = DateTime.Now,


                IsActive = true

            };



            db.Users.Add(user);

          db.SaveChanges();

            string body = $@"
<h2>Welcome to Oppora 🎉</h2>

<p>Hello {user.FullName},</p>

<p>Your Oppora account has been created successfully.</p>

<p>You can now explore jobs, internships and apply for opportunities.</p>

<br/>

<p>
Regards,<br/>
Oppora Team
</p>
";


            await _emailService.SendEmailAsync(
                user.Email,
                "Welcome to Oppora",
                body
            );

            return Ok(new
            {
                message = "User Registered Successfully"
            });

        }





        // LOGIN

        [HttpPost("login")]
        public IActionResult Login(LoginDto request)
        {


            var user = db.Users
                .FirstOrDefault(
                    x => x.Email == request.Email
                );



            if (user == null)
            {
                return BadRequest("Invalid Email");
            }



            bool passwordValid =
            BCrypt.Net.BCrypt.Verify(
                request.Password,
                user.PasswordHash
            );



            if (!passwordValid)
            {
                return BadRequest("Invalid Password");
            }





            var claims = new[]
            {

                new Claim(
                    ClaimTypes.Name,
                    user.FullName
                ),


                new Claim(
                    ClaimTypes.Email,
                    user.Email
                ),


                new Claim(
                    ClaimTypes.Role,
                    user.Role
                ),
                new Claim(
                   "UserId",
                 user.Id.ToString()
    )

            };





            var key =
            new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(
                    config["Jwt:Key"]!
                )
            );




            var credentials =
            new SigningCredentials(
                key,
                SecurityAlgorithms.HmacSha256
            );
            var token =
            new JwtSecurityToken(

                issuer:
                config["Jwt:Issuer"],


                audience:
                config["Jwt:Audience"],


                claims: claims,


                expires:
                DateTime.Now.AddHours(2),


                signingCredentials:
                credentials

            );






            return Ok(new
            {

                token =
                new JwtSecurityTokenHandler()
                .WriteToken(token),


                role = user.Role,


                name = user.FullName,

                userId = user.Id

            });


        }


    }

}