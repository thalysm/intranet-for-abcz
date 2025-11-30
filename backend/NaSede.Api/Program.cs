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
builder.Services.AddScoped<IAIService, SemanticKernelService>();

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

            CREATE TABLE IF NOT EXISTS ""LoanSimulations"" (
                ""Id"" uuid NOT NULL,
                ""Wage"" bigint NOT NULL,
                ""LoanAmount"" bigint NOT NULL,
                ""NumberInstallments"" integer NOT NULL,
                ""CreatedAt"" timestamp with time zone NOT NULL,
                ""UserId"" uuid NOT NULL,
                CONSTRAINT ""PK_LoanSimulations"" PRIMARY KEY (""Id""),
                CONSTRAINT ""FK_LoanSimulations_Users_UserId"" FOREIGN KEY (""UserId"") REFERENCES ""Users"" (""Id"") ON DELETE CASCADE
            );
            
            CREATE INDEX IF NOT EXISTS ""IX_LoanSimulations_UserId"" ON ""LoanSimulations"" (""UserId"");

            CREATE TABLE IF NOT EXISTS ""RequestTypes"" (
                ""Id"" uuid NOT NULL,
                ""Name"" character varying(100) NOT NULL,
                ""CreatedAt"" timestamp with time zone NOT NULL,
                ""UpdatedAt"" timestamp with time zone,
                CONSTRAINT ""PK_RequestTypes"" PRIMARY KEY (""Id"")
            );
            
            CREATE UNIQUE INDEX IF NOT EXISTS ""IX_RequestTypes_Name"" ON ""RequestTypes"" (""Name"");

            CREATE TABLE IF NOT EXISTS ""Requests"" (
                ""Id"" uuid NOT NULL,
                ""TypeId"" uuid NOT NULL,
                ""Status"" integer NOT NULL DEFAULT 0,
                ""UserId"" uuid NOT NULL,
                ""Title"" text,
                ""Description"" text,
                ""Response"" character varying(1000),
                ""CreatedAt"" timestamp with time zone NOT NULL,
                ""UpdatedAt"" timestamp with time zone,
                CONSTRAINT ""PK_Requests"" PRIMARY KEY (""Id""),
                CONSTRAINT ""FK_Requests_RequestTypes_TypeId"" FOREIGN KEY (""TypeId"") REFERENCES ""RequestTypes"" (""Id"") ON DELETE RESTRICT,
                CONSTRAINT ""FK_Requests_Users_UserId"" FOREIGN KEY (""UserId"") REFERENCES ""Users"" (""Id"") ON DELETE CASCADE
            );
            
            CREATE INDEX IF NOT EXISTS ""IX_Requests_TypeId"" ON ""Requests"" (""TypeId"");
            CREATE INDEX IF NOT EXISTS ""IX_Requests_UserId"" ON ""Requests"" (""UserId"");

            -- Adicionar campos Title e Description se não existirem
            ALTER TABLE ""Requests"" 
            ADD COLUMN IF NOT EXISTS ""Title"" text,
            ADD COLUMN IF NOT EXISTS ""Description"" text;

            -- Insert default request types
            INSERT INTO ""RequestTypes"" (""Id"", ""Name"", ""CreatedAt"")
            SELECT gen_random_uuid(), 'Empréstimo', NOW()
            WHERE NOT EXISTS (SELECT 1 FROM ""RequestTypes"" WHERE ""Name"" = 'Empréstimo');

            INSERT INTO ""RequestTypes"" (""Id"", ""Name"", ""CreatedAt"")
            SELECT gen_random_uuid(), 'Benefício', NOW()
            WHERE NOT EXISTS (SELECT 1 FROM ""RequestTypes"" WHERE ""Name"" = 'Benefício');

            INSERT INTO ""RequestTypes"" (""Id"", ""Name"", ""CreatedAt"")
            SELECT '550e8400-e29b-41d4-a716-446655440000', 'Sugestões', NOW()
            WHERE NOT EXISTS (SELECT 1 FROM ""RequestTypes"" WHERE ""Name"" = 'Sugestões');
        ";
        
        await command.ExecuteNonQueryAsync();
        await connection.CloseAsync();
        
        Console.WriteLine("✅ Database and Benefits table created successfully!");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"❌ Error creating database/table: {ex.Message}");
    }

    // Execute SQL to add SimulationId column if needed
    try
    {
        // Check if columns exist by trying to query them
        await dbContext.Database.ExecuteSqlRawAsync(
            "SELECT \"SimulationId\", \"LoanSimulationId\" FROM \"Requests\" LIMIT 1");
        Console.WriteLine("✅ Both SimulationId and LoanSimulationId columns already exist");
    }
    catch
    {
        Console.WriteLine("⚡ Adding SimulationId and LoanSimulationId columns to Requests table...");
        
        try
        {
            // Add SimulationId column
            await dbContext.Database.ExecuteSqlRawAsync(
                "ALTER TABLE \"Requests\" ADD COLUMN IF NOT EXISTS \"SimulationId\" uuid NULL");
            
            // Add LoanSimulationId column (for EF navigation property)
            await dbContext.Database.ExecuteSqlRawAsync(
                "ALTER TABLE \"Requests\" ADD COLUMN IF NOT EXISTS \"LoanSimulationId\" uuid NULL");
            
            // Add foreign key constraints (with proper PostgreSQL syntax)
            try 
            {
                await dbContext.Database.ExecuteSqlRawAsync(
                    "ALTER TABLE \"Requests\" ADD CONSTRAINT \"FK_Requests_LoanSimulations_SimulationId\" FOREIGN KEY (\"SimulationId\") REFERENCES \"LoanSimulations\" (\"Id\") ON DELETE SET NULL");
            }
            catch 
            {
                // Constraint might already exist, ignore
            }
            
            try 
            {
                await dbContext.Database.ExecuteSqlRawAsync(
                    "ALTER TABLE \"Requests\" ADD CONSTRAINT \"FK_Requests_LoanSimulations_LoanSimulationId\" FOREIGN KEY (\"LoanSimulationId\") REFERENCES \"LoanSimulations\" (\"Id\") ON DELETE SET NULL");
            }
            catch 
            {
                // Constraint might already exist, ignore
            }
            
            Console.WriteLine("✅ SimulationId and LoanSimulationId columns added successfully!");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"❌ Error adding columns: {ex.Message}");
        }
    }
}

app.Run();
