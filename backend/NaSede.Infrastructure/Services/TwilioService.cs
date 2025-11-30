using NaSede.Application.Interfaces;
using Twilio;
using Twilio.Rest.Api.V2010.Account;
using Twilio.Types;
using Microsoft.Extensions.Configuration;
using System.Text.Json;

namespace NaSede.Infrastructure.Services;

public class TwilioService : ITwilioService
{
    private readonly string _accountSid;
    private readonly string _authToken;
    private readonly string _fromNumber;
    private readonly IConfiguration _configuration;

    public TwilioService(IConfiguration configuration)
    {
        _configuration = configuration;
        _accountSid = configuration["Twilio:AccountSid"] ?? "";
        _authToken = configuration["Twilio:AuthToken"] ?? "";
        _fromNumber = configuration["Twilio:FromNumber"] ?? "whatsapp:+14155238886";

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
        var templateSid = _configuration["Twilio:EventTemplateSid"] ?? "HX7afb82fe431e556db7684ba208540f9f";

        if (!string.IsNullOrEmpty(templateSid))
        {
            try
            {
                var formattedNumber = toPhoneNumber.StartsWith("whatsapp:")
                    ? toPhoneNumber
                    : $"whatsapp:{toPhoneNumber}";

                // Extract suffixes for buttons
                // Assuming template has buttons with type "URL" and value "https://[DOMAIN]/{{3}}" and "https://[DOMAIN]/{{4}}"
                // Variables:
                // 1: Title
                // 2: Date
                // 3: Confirm Link Suffix
                // 4: Decline Link Suffix
                
                var confirmUri = new Uri(confirmationLink);
                var declineUri = new Uri(declineLink);
                
                // Extract suffix starting with /id (last segment + query)
                // confirmationLink: .../events/confirm/{id}?token={token}
                // Suffix: /{id}?token={token}
                
                // We want everything after "/events/confirm" and "/events/decline"
                var confirmPathAndQuery = confirmUri.PathAndQuery;
                var declinePathAndQuery = declineUri.PathAndQuery;
                
                var confirmSuffix = confirmPathAndQuery.Substring(confirmPathAndQuery.IndexOf("/events/confirm") + "/events/confirm".Length);
                var declineSuffix = declinePathAndQuery.Substring(declinePathAndQuery.IndexOf("/events/decline") + "/events/decline".Length);

                var variables = new Dictionary<string, string>
                {
                    {"1", eventTitle},
                    {"2", eventDate.ToString("dd/MM/yyyy HH:mm")},
                    {"3", confirmSuffix},
                    {"4", declineSuffix}
                };

                var jsonOptions = new JsonSerializerOptions
                {
                    Encoder = System.Text.Encodings.Web.JavaScriptEncoder.UnsafeRelaxedJsonEscaping
                };

                var messageResource = await MessageResource.CreateAsync(
                    contentSid: templateSid,
                    from: new PhoneNumber(_fromNumber),
                    contentVariables: JsonSerializer.Serialize(variables, jsonOptions),
                    to: new PhoneNumber(formattedNumber)
                );

                return messageResource.ErrorCode == null;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error sending template message: {ex.Message}");
                // Fallback to text message if template fails
            }
        }

        var message = $"🗓️ *Novo Evento - ABCZ*\n\n" +
                     $"*{eventTitle}*\n" +
                     $"📅 Data: {eventDate:dd/MM/yyyy HH:mm}\n\n" +
                     $"Confirmar presença: {confirmationLink}\n\n" +
                     $"Declinar: {declineLink}";

        return await SendWhatsAppMessageAsync(toPhoneNumber, message);
    }
}
