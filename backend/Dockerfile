# Build Stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy solution and project files first
COPY ["NaSede.sln", "./"]
COPY ["NaSede.Api/NaSede.Api.csproj", "NaSede.Api/"]
COPY ["NaSede.Application/NaSede.Application.csproj", "NaSede.Application/"]
COPY ["NaSede.Domain/NaSede.Domain.csproj", "NaSede.Domain/"]
COPY ["NaSede.Infrastructure/NaSede.Infrastructure.csproj", "NaSede.Infrastructure/"]

# Restore dependencies
RUN dotnet restore

# Copy the rest of the code
COPY . .

# Build and publish
WORKDIR "/src/NaSede.Api"
RUN dotnet publish -c Release --no-restore -o /app/publish

# Runtime Stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app

COPY --from=build /app/publish .

# Força o ASP.NET a usar a porta correta
ENV ASPNETCORE_URLS=http://+:8080

EXPOSE 8080

ENTRYPOINT ["dotnet", "NaSede.Api.dll"]
