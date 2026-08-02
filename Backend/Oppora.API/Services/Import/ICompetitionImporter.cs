using Oppora.API.Services.Import.Models;

namespace Oppora.API.Services.Import
{
    public interface ICompetitionImporter
    {
        ImportSourceType SourceType { get; }
        Task<IEnumerable<NormalizedCompetitionDto>> ImportAsync(Stream dataStream);
    }
}
