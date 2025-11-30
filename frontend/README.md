# Na Sede - Frontend

Sistema de intranet para associados da ABCZ (Associação Brasileira de Criadores de Zebu).

## Tecnologias

- **Framework**: Angular 20 (Standalone Components)
- **Estilização**: Tailwind CSS
- **Gráficos**: ApexCharts (ng-apexcharts)
- **Linguagem**: TypeScript
- **Gerenciamento de Estado**: RxJS / Signals

## Design System "Stone"

A interface segue um padrão visual premium e minimalista:

- **Paleta de Cores**:
  - **Stone (Neutros)**: Base para fundos, bordas e textos (`bg-stone-50`, `text-stone-800`).
  - **Primary (Acento)**: Cor principal para ações e destaques.
  - **Feedback**: Cores semânticas suaves para sucesso (Green), erro (Red) e alerta (Amber).
- **Tipografia**:
  - **Títulos**: Fontes serifadas para elegância.
  - **Corpo**: Inter (Google Fonts) para legibilidade.
- **Componentes**:
  - Cards com sombras suaves (`shadow-sm`, `hover:shadow-lg`).
  - Botões com transições fluidas.
  - Modais com backdrop blur.

## Como Executar

1. Instale as dependências:
   ```bash
   npm install
   ```

2. Inicie o servidor de desenvolvimento:
   ```bash
   npm start
   ```

3. Acesse: `http://localhost:4200`

## Estrutura

- **/core**: Serviços (Auth, Api), guards e interceptors.
- **/pages**:
  - **/admin**: Dashboard, gestão de eventos, notícias, benefícios.
  - **/user**: Home, marketplace, notícias, empréstimos.
  - **/auth**: Login e recuperação de senha.
- **/shared**: Componentes reutilizáveis (Navbar, Cards, Modais).
- **/layouts**: Estruturas de layout (Main, Admin, Auth).

## Funcionalidades Implementadas

### Área Pública / Autenticação
- Login com redirecionamento inteligente (Admin vs User).
- Recuperação de acesso.

### Área do Associado
- **Dashboard**: Visão geral com atalhos e feed.
- **Notícias**: Leitura, curtidas e comentários responsivos.
- **Marketplace**: Listagem, criação e gestão de anúncios.
- **Empréstimos**: Simulação de crédito consignado.
- **Benefícios**: Clube de vantagens com parceiros.
- **Ouvidoria**: Botão flutuante para contato direto.

### Área Administrativa
- **Dashboard Unificado**: Analytics com gráficos interativos (ApexCharts).
- **Gestão de Conteúdo**: CRUD de notícias e eventos.
- **Gestão de Benefícios**: Administração de parceiros.
- **Relatórios**: Exportação de dados (CSV, XML, PDF).
