# Build Stage
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copy solution and project files first for caching
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
RUN dotnet publish -c Release -o /app/publish

# Runtime Stage
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app
COPY --from=build /app/publish .
EXPOSE 8080
ENTRYPOINT ["dotnet", "NaSede.Api.dll"]
