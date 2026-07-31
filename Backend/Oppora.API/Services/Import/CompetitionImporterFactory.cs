using Oppora.API.Services.Import.Models;

namespace Oppora.API.Services.Import
{
    public class CompetitionImporterFactory
    {
        private readonly IEnumerable<ICompetitionImporter> _importers;

        public CompetitionImporterFactory(IEnumerable<ICompetitionImporter> importers)
        {
            _importers = importers;
        }

        public ICompetitionImporter GetImporter(ImportSourceType sourceType)
        {
            var importer = _importers.FirstOrDefault(i => i.SourceType == sourceType);
            if (importer == null)
            {
                throw new NotSupportedException($"No importer registered for source type: '{sourceType}'.");
            }
            return importer;
        }
    }
}
