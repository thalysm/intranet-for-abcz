using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using NaSede.Application.Interfaces;
using NaSede.Infrastructure.Data;
using NaSede.Infrastructure.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() { 
        Title = "Na Sede API - ABCZ", 
        Version = "v1",
        Description = "API da Intranet para Associados da ABCZ"
    });
    
    // Add JWT Authentication
    c.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Example: \"Bearer {token}\"",
        Name = "Authorization",
        In = Microsoft.OpenApi.Models.ParameterLocation.Header,
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    c.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
    {
        {
            new Microsoft.OpenApi.Models.OpenApiSecurityScheme
            {
                Reference = new Microsoft.OpenApi.Models.OpenApiReference
                {
                    Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

// Database configuration
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") 
    ?? "Host=189.101.61.152;Port=5432;Database=postgres;Username=postgres;Password=q5kXIuKhpUoC4chVVWUrarFTRNMIUoTII8D75AYLJUckMYtjU9N175MQ3PNxZ9rg";

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(connectionString, npgsqlOptions =>
        npgsqlOptions.EnableRetryOnFailure(
            maxRetryCount: 5,
            maxRetryDelay: TimeSpan.FromSeconds(30),
            errorCodesToAdd: null)));

// JWT Authentication
var jwtKey = builder.Configuration["Jwt:Key"] ?? "NaSedeABCZSecretKeyForJWT2024MinimumLength32Characters";
var jwtIssuer = builder.Configuration["Jwt:Issuer"] ?? "NaSede";
var jwtAudience = builder.Configuration["Jwt:Audience"] ?? "NaSedeUsers";

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtIssuer,
        ValidAudience = jwtAudience,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
    };
});

builder.Services.AddAuthorization();

// Register services
builder.Services.AddScoped<ITwilioService, TwilioService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IUserService, UserService>();

// CORS configuration
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngular", policy =>
    {
        policy.WithOrigins("http://localhost:4200")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline
// Configure the HTTP request pipeline
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "Na Sede API v1");
    c.RoutePrefix = "swagger";
});


// app.UseHttpsRedirection();
app.UseCors(x => x.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

// Ensure database is created and Benefits table exists
using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    
    try
    {
        await dbContext.Database.EnsureCreatedAsync();
        
        // Check if Benefits table exists and create it if not
        var connection = dbContext.Database.GetDbConnection();
        await connection.OpenAsync();
        
        var command = connection.CreateCommand();
        command.CommandText = @"
            CREATE TABLE IF NOT EXISTS ""Benefits"" (
                ""Id"" uuid NOT NULL,
                ""Name"" character varying(200) NOT NULL,
                ""Description"" text NOT NULL,
                ""IsActive"" boolean NOT NULL DEFAULT true,
                ""ImageUrl"" character varying(500),
                ""ButtonAction"" character varying(500),
                ""CreatedAt"" timestamp with time zone NOT NULL,
                ""UpdatedAt"" timestamp with time zone,
                ""CreatedByUserId"" uuid NOT NULL,
                CONSTRAINT ""PK_Benefits"" PRIMARY KEY (""Id""),
                CONSTRAINT ""FK_Benefits_Users_CreatedByUserId"" FOREIGN KEY (""CreatedByUserId"") REFERENCES ""Users"" (""Id"") ON DELETE RESTRICT
            );
            
            CREATE INDEX IF NOT EXISTS ""IX_Benefits_CreatedByUserId"" ON ""Benefits"" (""CreatedByUserId"");
        ";
        
        await command.ExecuteNonQueryAsync();
        await connection.CloseAsync();
        
        Console.WriteLine("✅ Database and Benefits table created successfully!");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"❌ Error creating database/table: {ex.Message}");
    }
}

app.Run();
