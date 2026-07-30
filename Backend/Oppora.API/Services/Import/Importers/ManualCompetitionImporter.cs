using System.Text.Json;
using Oppora.API.Services.Import.Models;

namespace Oppora.API.Services.Import.Importers
{
    public class ManualCompetitionImporter : ICompetitionImporter
    {
        public ImportSourceType SourceType => ImportSourceType.Manual;

        public async Task<IEnumerable<NormalizedCompetitionDto>> ImportAsync(Stream dataStream)
        {
            using var reader = new StreamReader(dataStream);
            string json = await reader.ReadToEndAsync();

            var item = JsonSerializer.Deserialize<NormalizedCompetitionDto>(json, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            if (item != null)
            {
                item.SourceType = ImportSourceType.Manual;
                return new[] { item };
            }

            return Enumerable.Empty<NormalizedCompetitionDto>();
        }
    }
}
