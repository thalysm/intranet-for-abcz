namespace NaSede.Application.Interfaces;

public interface ITwilioService
{
    Task<bool> SendWhatsAppMessageAsync(string toPhoneNumber, string message);
    Task<bool> SendEventNotificationAsync(string toPhoneNumber, string eventTitle, DateTime eventDate, string confirmationLink, string declineLink);
}
