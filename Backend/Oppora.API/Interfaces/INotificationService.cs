using Oppora.API.DTOs;
using Oppora.API.Models;

namespace Oppora.API.Interfaces
{
    public interface INotificationService
    {
        Task CreateNotificationAsync(int interviewId, int recipientUserId, string title, string message, string type);
        Task<IEnumerable<InterviewNotificationResponseDto>> GetNotificationsByUserAsync(int userId);
        Task MarkAsReadAsync(int notificationId);
    }
}
