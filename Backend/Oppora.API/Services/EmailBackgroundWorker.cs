using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Oppora.API.Interfaces;

namespace Oppora.API.Services
{
    public class EmailBackgroundWorker : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<EmailBackgroundWorker> _logger;

        public EmailBackgroundWorker(
            IServiceProvider serviceProvider,
            ILogger<EmailBackgroundWorker> logger)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("Email Background Queue Worker is running.");

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    using (var scope = _serviceProvider.CreateScope())
                    {
                        var emailService = scope.ServiceProvider.GetRequiredService<IEmailQueueService>();
                        await emailService.ProcessPendingEmailsAsync();
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error occurred while processing email queue in background worker.");
                }

                // Poll every 30 seconds
                await Task.Delay(TimeSpan.FromSeconds(30), stoppingToken);
            }

            _logger.LogInformation("Email Background Queue Worker is stopping.");
        }
    }
}
