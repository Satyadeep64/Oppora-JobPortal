using DocumentFormat.OpenXml.Packaging;
using UglyToad.PdfPig;

namespace Oppora.API.Services
{
    public class ResumeTextExtractor
    {
        public async Task<string> ExtractTextAsync(IFormFile file)
        {
            if (file == null || file.Length == 0)
                throw new Exception("No file uploaded.");

            var extension = Path.GetExtension(file.FileName).ToLower();

            return extension switch
            {
                ".pdf" => await ExtractPdfText(file),
                ".docx" => await ExtractDocxText(file),
                _ => throw new Exception("Only PDF and DOCX files are supported.")
            };
        }

        private async Task<string> ExtractPdfText(IFormFile file)
        {
            using var stream = file.OpenReadStream();
            using var document = PdfDocument.Open(stream);

            var text = "";

            foreach (var page in document.GetPages())
            {
                text += page.Text + Environment.NewLine;
            }

            return await Task.FromResult(text);
        }

        private async Task<string> ExtractDocxText(IFormFile file)
        {
            using var stream = file.OpenReadStream();
            using var document = WordprocessingDocument.Open(stream, false);

            var body = document.MainDocumentPart?.Document.Body;

            if (body == null)
                return "";

            return await Task.FromResult(body.InnerText);
        }
    }
}