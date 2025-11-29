# Na Sede - Backend

Sistema de intranet para associados da ABCZ (Associação Brasileira de Criadores de Zebu).

## Arquitetura

Este projeto segue os princípios da Clean Architecture:

- **NaSede.Domain**: Entidades e lógica de negócio
- **NaSede.Application**: Casos de uso e interfaces
- **NaSede.Infrastructure**: Implementações de infraestrutura (EF Core, Twilio)
- **NaSede.Api**: Controllers e configuração da API

## Tecnologias

- .NET 9
- PostgreSQL
- Entity Framework Core 9
- Twilio (WhatsApp)
- Swagger/OpenAPI

## Como Executar

1. Certifique-se de ter o .NET 9 SDK instalado
2. No diretório `backend`, execute:
   \`\`\`bash
   dotnet restore
   dotnet run --project NaSede.Api
   \`\`\`
3. Acesse o Swagger: `https://localhost:5001`

## Configuração

As credenciais do banco de dados e Twilio estão em `appsettings.json`.

## Migrações

Para criar migrações do banco de dados:
\`\`\`bash
dotnet ef migrations add InitialCreate --project NaSede.Infrastructure --startup-project NaSede.Api
dotnet ef database update --project NaSede.Infrastructure --startup-project NaSede.Api
