# Na Sede - Sistema de Intranet ABCZ

Sistema completo de intranet para a Associação Brasileira de Criadores de Zebu (ABCZ).

## Funcionalidades

### Para Associados
- **Feed de Notícias**: Acompanhe as novidades com interações (curtidas e comentários).
- **Eventos**: Visualização de agenda e confirmação de presença.
- **Marketplace**: Compre e venda produtos e serviços entre associados.
- **Prestação de Contas**: Transparência financeira com acesso a documentos.
- **Simulação de Empréstimos**: Simule e solicite empréstimos consignados.
- **Clube de Benefícios**: Acesse descontos e vantagens exclusivas de parceiros.
- **Ouvidoria**: Canal direto via WhatsApp.

### Para Administradores
- **Dashboard Unificado**: Visão analítica com gráficos de comunicação, empréstimos e benefícios.
- **Gestão de Conteúdo**: Publicação de notícias e eventos.
- **Comunicação em Massa**: Disparos de mensagens via WhatsApp.
- **Gestão de Benefícios**: Cadastro de parceiros e ofertas.
- **Relatórios**: Acompanhamento de presença e engajamento.

## Design System "Stone"

O projeto utiliza um Design System moderno e minimalista, apelidado de "Stone", focado em:
- **Estética Premium**: Uso de cores neutras (Stone/Cinza) com acentos elegantes.
- **Tipografia**: Combinação de fontes serifadas (títulos) e sans-serif (corpo) para sofisticação.
- **Componentes**: Cards, modais e formulários padronizados com sombras suaves e bordas arredondadas.
- **Responsividade**: Layouts fluidos que se adaptam a qualquer dispositivo.

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
- Tailwind CSS (Estilização)
- ApexCharts (Visualização de Dados)
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

### Docker (Recomendado)

Para executar todo o ambiente (Frontend + Backend + Banco de Dados) via Docker:

```bash
docker-compose up --build
```

O sistema estará disponível em:
- Frontend: `http://localhost:80`
- Backend API: `http://localhost:8080`
- Swagger: `http://localhost:8080/swagger`

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

### Autenticação Inteligente
- Login por matrícula ou número de WhatsApp
- Redirecionamento automático baseado no perfil (Admin -> Dashboard / User -> Home)
- Autenticação automática via links do WhatsApp

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
