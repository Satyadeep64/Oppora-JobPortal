using CloudinaryDotNet;
using CloudinaryDotNet.Actions;

namespace Oppora.API.Services
{
    public class CloudinaryService
    {
        private readonly Cloudinary _cloudinary;

           public CloudinaryService(IConfiguration configuration)
        {
            Account account = new Account(
                "xfx2d9ks",
                "175753969278864",
                "wWAhSJvr8yjSolQrBJtMDfj5enU"
            );

            _cloudinary = new Cloudinary(account);
        }




        public async Task<string> UploadImage(IFormFile file)
        {

            if (file == null)
            {
                throw new Exception("Image file is null");
            }


            using var stream = file.OpenReadStream();


            var uploadParams = new ImageUploadParams
            {
                File = new FileDescription(
                    file.FileName,
                    stream
                )
            };


            var result = await _cloudinary.UploadAsync(uploadParams);


            if (result.Error != null)
            {
                throw new Exception(result.Error.Message);
            }


            return result.SecureUrl.ToString();

        }




        public async Task<string> UploadResume(IFormFile file)
        {

            if (file == null)
            {
                throw new Exception("Resume file is null");
            }


            using var stream = file.OpenReadStream();


            var uploadParams = new RawUploadParams
            {
                File = new FileDescription(
                    file.FileName,
                    stream
                )
            };


            var result = await _cloudinary.UploadAsync(uploadParams);


            if (result.Error != null)
            {
                throw new Exception(result.Error.Message);
            }


            return result.SecureUrl.ToString();

        }

    }
}