using System.Text.Json;
using Oppora.API.Services.Import.Models;

namespace Oppora.API.Services.Import.Importers
{
    public class ApiCompetitionImporter : ICompetitionImporter
    {
        public ImportSourceType SourceType => ImportSourceType.Api;

        public async Task<IEnumerable<NormalizedCompetitionDto>> ImportAsync(Stream dataStream)
        {
            var results = new List<NormalizedCompetitionDto>();
            using var reader = new StreamReader(dataStream);
            string json = await reader.ReadToEndAsync();

            if (string.IsNullOrWhiteSpace(json))
                return results;

            var items = JsonSerializer.Deserialize<List<NormalizedCompetitionDto>>(json, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            if (items != null)
            {
                foreach (var item in items)
                {
                    item.SourceType = ImportSourceType.Api;
                    results.Add(item);
                }
            }

            return results;
        }
    }
}
