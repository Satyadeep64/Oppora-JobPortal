using Microsoft.AspNetCore.Mvc;
using Oppora.API.Data;
using Oppora.API.Models;
using Oppora.API.Services;
using Microsoft.EntityFrameworkCore;
namespace Oppora.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProfileController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly CloudinaryService _cloudinary;


        public ProfileController(
            AppDbContext context,
            CloudinaryService cloudinary)
        {
            _context = context;
            _cloudinary = cloudinary;
        }



        [HttpGet("{id}")]
        public async Task<IActionResult> GetProfile(int id)
        {
            var user = await _context.Users.FindAsync(id);

            if (user == null)
            {
                return NotFound();
            }


            return Ok(new
            {
                user.Id,
                user.FullName,
                user.Email,
                user.Role,
                user.ProfileImage,
                user.Resume,
                user.Skills
            });
        }



        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateProfile(
            int id,
            User userData)
        {

            var user = await _context.Users.FindAsync(id);


            if (user == null)
            {
                return NotFound();
            }


            user.FullName = userData.FullName;
            user.Email = userData.Email;
            user.Skills = userData.Skills;


            await _context.SaveChangesAsync();


            return Ok(user);
        }




        [HttpPost("upload-image/{id}")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> UploadImage(
            int id,
             IFormFile file)
        {

            var user = await _context.Users.FindAsync(id);


            if (user == null)
            {
                return NotFound();
            }


            if (file == null)
            {
                return BadRequest("No image selected");
            }



            var imageUrl =
                await _cloudinary.UploadImage(file);



            user.ProfileImage = imageUrl;


            await _context.SaveChangesAsync();



            return Ok(new
            {
                image = imageUrl
            });

        }




        [HttpPost("upload-resume/{id}")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> UploadResume(
            int id,
             IFormFile file)
        {

            var user = await _context.Users.FindAsync(id);


            if (user == null)
            {
                return NotFound();
            }



            if (file == null)
            {
                return BadRequest("No resume selected");
            }



            var resumeUrl =
                await _cloudinary.UploadResume(file);



            user.Resume = resumeUrl;


            await _context.SaveChangesAsync();



            return Ok(new
            {
                resume = resumeUrl
            });

        }
        //[HttpPut("change-password/{id}")]
        //public async Task<IActionResult> ChangePassword(int id, ChangePasswordDto model)
        //{
        //    var user = await _context.Users
        //        .FirstOrDefaultAsync(x => x.Id == id);

        //    if (user == null)
        //    {
        //        return NotFound("User not found");
        //    }

        //    bool isMatch = BCrypt.Net.BCrypt.Verify(
        //        model.OldPassword,
        //        user.PasswordHash
        //    );

        //    if (!isMatch)
        //    {
        //        return BadRequest("Old password is incorrect");
        //    }

        //    user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(model.NewPassword);

        //    await _context.SaveChangesAsync();

        //    return Ok("Password changed successfully");
        //}

        [HttpPut("change-password/{id}")]
        public async Task<IActionResult> ChangePassword(int id, ChangePasswordDto model)
        {
            var user = await _context.Users.FirstOrDefaultAsync(x => x.Id == id);

            if (user == null)
                return NotFound("User not found");

            Console.WriteLine("Entered Old Password: " + model.OldPassword);
            Console.WriteLine("Stored Hash: " + user.PasswordHash);

            bool isMatch = BCrypt.Net.BCrypt.Verify(
                model.OldPassword,
                user.PasswordHash
            );

            Console.WriteLine("Password Match: " + isMatch);

            if (!isMatch)
                return BadRequest("Old password is incorrect");

            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(model.NewPassword);

            user.Password = model.NewPassword;

            var entry = _context.Entry(user);

            _context.Entry(user).Property(x => x.PasswordHash).IsModified = true;
            _context.Entry(user).Property(x => x.Password).IsModified = true;


            Console.WriteLine(
                "Password Modified: " +
                _context.Entry(user)
                .Property(x => x.Password)
                .IsModified
            );


            await _context.Database.ExecuteSqlRawAsync(
     "UPDATE Users SET Password = {0} WHERE Id = {1}",
     model.NewPassword,
     id
 );

            return Ok("Password changed successfully");
        }

    }
}