# Na Sede - Frontend

Sistema de intranet para associados da ABCZ (Associação Brasileira de Criadores de Zebu).

## Tecnologias

- Angular 20 (Standalone Components)
- Tailwind CSS
- TypeScript
- RxJS

## Design System

- **Cores primárias**: 
  - Azul: #39f
  - Creme: #f2f1ec
- **Tipografia**: Inter (Google Fonts)

## Como Executar

1. Instale as dependências:
   \`\`\`bash
   npm install
   \`\`\`

2. Inicie o servidor de desenvolvimento:
   \`\`\`bash
   npm start
   \`\`\`

3. Acesse: `http://localhost:4200`

## Estrutura

- **/core**: Serviços, guards, interceptors e models
- **/pages**: Componentes de páginas (lazy-loaded)
- **/shared**: Componentes compartilhados
- **/layouts**: Layouts da aplicação

## Funcionalidades

- Autenticação com matrícula ou WhatsApp
- Dashboard de usuário e admin
- Gerenciamento de eventos
- Feed de notícias
- Marketplace
- Prestação de contas
- Integração com WhatsApp via Twilio
