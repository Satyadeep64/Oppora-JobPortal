using System.Text;
using Oppora.API.Services.Import.Models;

namespace Oppora.API.Services.Import.Importers
{
    public class CsvCompetitionImporter : ICompetitionImporter
    {
        public ImportSourceType SourceType => ImportSourceType.Csv;

        public async Task<IEnumerable<NormalizedCompetitionDto>> ImportAsync(Stream dataStream)
        {
            var results = new List<NormalizedCompetitionDto>();
            using var reader = new StreamReader(dataStream, Encoding.UTF8);

            string? headerLine = await reader.ReadLineAsync();
            if (string.IsNullOrWhiteSpace(headerLine))
                return results;

            string? line;
            while ((line = await reader.ReadLineAsync()) != null)
            {
                if (string.IsNullOrWhiteSpace(line)) continue;
                var parts = line.Split(',');

                if (parts.Length >= 2)
                {
                    results.Add(new NormalizedCompetitionDto
                    {
                        Title = parts[0].Trim(),
                        OrganizationName = parts.Length > 1 ? parts[1].Trim() : "Oppora Host",
                        CategoryName = parts.Length > 2 ? parts[2].Trim() : "Competitions",
                        OfficialRegistrationUrl = parts.Length > 3 ? parts[3].Trim() : "https://google.com",
                        RegistrationFee = parts.Length > 4 ? parts[4].Trim() : "Free",
                        SourceType = ImportSourceType.Csv
                    });
                }
            }

            return results;
        }
    }
}
