# Na Sede - Sistema de Intranet ABCZ

Sistema completo de intranet para a Associação Brasileira de Criadores de Zebu (ABCZ).

## Funcionalidades

### Para Associados
- Feed de notícias com comentários
- Visualização e confirmação de eventos
- Marketplace para anunciar produtos e serviços
- Acesso à prestação de contas
- Notificações via WhatsApp
- Ouvidoria integrada

### Para Administradores
- Gerenciamento de eventos com notificações automáticas
- Criação e publicação de notícias
- Envio de mensagens em massa via WhatsApp
- Upload de prestação de contas
- Relatórios de presença em eventos

## Tecnologias

### Backend
- .NET 9
- Clean Architecture
- PostgreSQL
- Entity Framework Core 9
- Twilio (WhatsApp API)
- Swagger/OpenAPI
- JWT Authentication

### Frontend
- Angular 20 (Standalone Components)
- Tailwind CSS
- TypeScript
- RxJS
- Responsive Design

## Estrutura do Projeto

\`\`\`
/backend
  /NaSede.Api          - Controllers e configuração
  /NaSede.Application  - DTOs e interfaces
  /NaSede.Domain       - Entidades e lógica de negócio
  /NaSede.Infrastructure - Implementações (EF Core, Twilio)

/frontend
  /src
    /app
      /core           - Serviços, guards, interceptors
      /pages          - Componentes de páginas
      /shared         - Componentes compartilhados
\`\`\`

## Como Executar

### Backend
\`\`\`bash
cd backend
dotnet restore
dotnet run --project NaSede.Api
\`\`\`

Acesse o Swagger: `https://localhost:5001`

### Frontend
\`\`\`bash
cd frontend
npm install
npm start
\`\`\`

Acesse: `http://localhost:4200`

## Configuração

### Banco de Dados
O sistema já está configurado com PostgreSQL. As credenciais estão em `appsettings.json`.

### Twilio WhatsApp
Configure suas credenciais do Twilio em `appsettings.json`:
- AccountSid
- AuthToken
- FromNumber

## Funcionalidades Especiais

### Regionalização
- Suporte a múltiplos fusos horários
- Conversão automática de datas para o fuso do usuário
- Notificações personalizadas por região

### Autenticação
- Login por matrícula ou número de WhatsApp
- Autenticação automática via links do WhatsApp
- Sistema de roles (Admin/Associado)

### Notificações WhatsApp
- Notificações de eventos com links de confirmação
- Mensagens personalizadas
- Envio em massa ou individual

## Segurança

- JWT tokens com expiração
- Guards de autenticação e autorização
- Validação de roles
- CORS configurado

## Licença

Propriedade da ABCZ - Associação Brasileira de Criadores de Zebu.
