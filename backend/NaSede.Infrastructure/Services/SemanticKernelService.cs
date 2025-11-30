using Microsoft.SemanticKernel;
using Microsoft.Extensions.Configuration;
using NaSede.Application.Interfaces;
using NaSede.Application.DTOs.Events;
using System.Text.Json;

namespace NaSede.Infrastructure.Services;

public class SemanticKernelService : IAIService
{
    private readonly Kernel _kernel;

    public SemanticKernelService(IConfiguration configuration)
    {
        var apiKey = configuration["Gemini:ApiKey"];
        var modelId = configuration["Gemini:ModelId"] ?? "gemini-1.5-flash";

        if (string.IsNullOrEmpty(apiKey))
        {
            throw new ArgumentException("Gemini ApiKey is missing in configuration.");
        }

        var builder = Kernel.CreateBuilder();
        builder.AddGoogleAIGeminiChatCompletion(
            modelId: modelId,
            apiKey: apiKey);

        _kernel = builder.Build();
    }

    private class AiEventResponse
    {
        public string? Title { get; set; }
        public string? Description { get; set; }
        public string? EventDate { get; set; }
        public string? Location { get; set; }
    }

    public async Task<CreateEventRequest> GenerateEventDetailsAsync(string prompt)
    {
        var systemPrompt = @"You are an event planning assistant. 
        Extract event details from the user's input and return them as a JSON object.
        The JSON object must have the following properties:
        - Title (string)
        - Description (string)
        - EventDate (string, ISO 8601 format, e.g., 2024-12-31T20:00:00)
        - Location (string)
        
        IMPORTANT: All text fields (Title, Description, Location) MUST be in Portuguese (pt-BR).
        
        If a piece of information is missing, try to infer it or leave it null.
        Do not include markdown formatting (like ```json). Return only the raw JSON string.";

        var result = await _kernel.InvokePromptAsync($"{systemPrompt}\n\nUser Input: {prompt}");
        
        var json = result.GetValue<string>();
        
        if (string.IsNullOrEmpty(json))
            return new CreateEventRequest { Description = "AI returned empty response." };

        // Clean up markdown if present
        json = json.Replace("```json", "").Replace("```", "").Trim();
        
        // Find the first { and last } to extract JSON object if there is extra text
        var startIndex = json.IndexOf('{');
        var endIndex = json.LastIndexOf('}');
        if (startIndex >= 0 && endIndex > startIndex)
        {
            json = json.Substring(startIndex, endIndex - startIndex + 1);
        }

        var options = new JsonSerializerOptions 
        { 
            PropertyNameCaseInsensitive = true,
            AllowTrailingCommas = true,
            ReadCommentHandling = JsonCommentHandling.Skip
        };
        
        try 
        {
            var aiResponse = JsonSerializer.Deserialize<AiEventResponse>(json, options);
            
            if (aiResponse == null) 
                return new CreateEventRequest { Description = "Deserialized object was null." };

            var request = new CreateEventRequest
            {
                Title = aiResponse.Title ?? string.Empty,
                Description = aiResponse.Description ?? string.Empty,
                Location = aiResponse.Location ?? string.Empty
            };

            if (DateTime.TryParse(aiResponse.EventDate, out var date))
            {
                request.EventDate = date;
            }
            else
            {
                request.EventDate = DateTime.UtcNow.AddDays(1);
            }

            return request;
        }
        catch (JsonException ex)
        {
            Console.WriteLine($"JSON Parse Error: {ex.Message}");
            Console.WriteLine($"Raw JSON: {json}");
            return new CreateEventRequest { Description = $"Failed to parse AI response. Raw: {json}" };
        }
    }
}
