using System.Xml.Linq;
using Oppora.API.Services.Import.Models;

namespace Oppora.API.Services.Import.Importers
{
    public class RssCompetitionImporter : ICompetitionImporter
    {
        public ImportSourceType SourceType => ImportSourceType.Rss;

        public async Task<IEnumerable<NormalizedCompetitionDto>> ImportAsync(Stream dataStream)
        {
            var results = new List<NormalizedCompetitionDto>();
            var doc = await XDocument.LoadAsync(dataStream, LoadOptions.None, CancellationToken.None);

            var items = doc.Descendants("item");
            foreach (var item in items)
            {
                string title = item.Element("title")?.Value ?? string.Empty;
                string link = item.Element("link")?.Value ?? "https://google.com";
                string description = item.Element("description")?.Value ?? string.Empty;

                if (!string.IsNullOrWhiteSpace(title))
                {
                    results.Add(new NormalizedCompetitionDto
                    {
                        Title = title,
                        Description = description,
                        OfficialRegistrationUrl = link,
                        SourceType = ImportSourceType.Rss
                    });
                }
            }

            return results;
        }
    }
}
