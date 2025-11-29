using NaSede.Application.Interfaces;
using Twilio;
using Twilio.Rest.Api.V2010.Account;
using Twilio.Types;

namespace NaSede.Infrastructure.Services;

public class TwilioService : ITwilioService
{
    private readonly string _accountSid;
    private readonly string _authToken;
    private readonly string _fromNumber;

    public TwilioService(IConfiguration configuration)
    {
        _accountSid = configuration["Twilio:AccountSid"] ?? "";
        _authToken = configuration["Twilio:AuthToken"] ?? "";
        _fromNumber = configuration["Twilio:FromNumber"] ?? "";
        
        TwilioClient.Init(_accountSid, _authToken);
    }

    public async Task<bool> SendWhatsAppMessageAsync(string toPhoneNumber, string message)
    {
        try
        {
            var formattedNumber = toPhoneNumber.StartsWith("whatsapp:") 
                ? toPhoneNumber 
                : $"whatsapp:{toPhoneNumber}";

            var messageResource = await MessageResource.CreateAsync(
                body: message,
                from: new PhoneNumber(_fromNumber),
                to: new PhoneNumber(formattedNumber)
            );

            return messageResource.ErrorCode == null;
        }
        catch (Exception)
        {
            return false;
        }
    }

    public async Task<bool> SendEventNotificationAsync(
        string toPhoneNumber, 
        string eventTitle, 
        DateTime eventDate, 
        string confirmationLink, 
        string declineLink)
    {
        var message = $"🗓️ *Novo Evento - ABCZ*\n\n" +
                     $"*{eventTitle}*\n" +
                     $"📅 Data: {eventDate:dd/MM/yyyy HH:mm}\n\n" +
                     $"Confirmar presença: {confirmationLink}\n" +
                     $"Declinar: {declineLink}";

        return await SendWhatsAppMessageAsync(toPhoneNumber, message);
    }
}
