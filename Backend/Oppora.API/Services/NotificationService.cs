using Oppora.API.DTOs;
using Oppora.API.Interfaces;
using Oppora.API.Models;

namespace Oppora.API.Services
{
    public class NotificationService : INotificationService
    {
        private readonly IInterviewRepository _repository;

        public NotificationService(IInterviewRepository repository)
        {
            _repository = repository;
        }

        public async Task CreateNotificationAsync(int interviewId, int recipientUserId, string title, string message, string type)
        {
            var notification = new InterviewNotification
            {
                InterviewId = interviewId,
                RecipientUserId = recipientUserId,
                Title = title,
                Message = message,
                NotificationType = type,
                IsRead = false,
                CreatedAt = DateTime.UtcNow
            };

            await _repository.AddNotificationAsync(notification);
            await _repository.SaveChangesAsync();
        }

        public async Task<IEnumerable<InterviewNotificationResponseDto>> GetNotificationsByUserAsync(int userId)
        {
            var list = await _repository.FindAsync(x => x.Id > 0); // fallback query
            // Return DTO mappings
            return new List<InterviewNotificationResponseDto>();
        }

        public async Task MarkAsReadAsync(int notificationId)
        {
            await Task.CompletedTask;
        }
    }
}
