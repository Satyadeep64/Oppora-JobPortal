using Oppora.API.Services.Import.Models;

namespace Oppora.API.Services.Import
{
    public interface ICompetitionIngestionService
    {
        Task<ImportResultDto> IngestAsync(ImportSourceType sourceType, Stream dataStream);
    }
}
