# Na Sede - Backend

Sistema de intranet para associados da ABCZ (Associação Brasileira de Criadores de Zebu).

## Arquitetura

Este projeto segue os princípios da Clean Architecture e Domain-Driven Design (DDD):

- **NaSede.Domain**: Entidades, Value Objects e lógica de negócio.
  - *Domínios*: Auth, News, Events, Marketplace, Loans, Benefits.
- **NaSede.Application**: Casos de uso (Services), DTOs e Interfaces.
- **NaSede.Infrastructure**: Implementações de infraestrutura.
  - *Data*: Entity Framework Core 9, PostgreSQL.
  - *External*: Twilio (WhatsApp), Storage.
- **NaSede.Api**: Controllers, Middlewares e configuração Swagger.

## Funcionalidades da API

- **Autenticação**: JWT, Login por Matrícula/WhatsApp.
- **Notícias**: CRUD completo, comentários e curtidas.
- **Eventos**: Gestão de agenda e confirmação de presença.
- **Marketplace**: Anúncios de produtos e serviços entre associados.
- **Empréstimos**: Simulação e solicitação de crédito.
- **Benefícios**: Gestão de parceiros e ofertas.
- **Comunicação**: Integração com WhatsApp para notificações.

## Tecnologias

- .NET 9
- PostgreSQL
- Entity Framework Core 9
- Twilio (WhatsApp)
- Swagger/OpenAPI
- Docker Support

## Como Executar

1. Certifique-se de ter o .NET 9 SDK instalado
2. No diretório `backend`, execute:
   ```bash
   dotnet restore
   dotnet run --project NaSede.Api
   ```
3. Acesse o Swagger: `https://localhost:5001`

## Configuração

As credenciais do banco de dados e Twilio estão em `appsettings.json`.

## Migrações

Para criar migrações do banco de dados:
```bash
dotnet ef migrations add InitialCreate --project NaSede.Infrastructure --startup-project NaSede.Api
dotnet ef database update --project NaSede.Infrastructure --startup-project NaSede.Api
```
