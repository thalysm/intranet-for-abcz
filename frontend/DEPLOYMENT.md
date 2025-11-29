# Guia de Deploy - Na Sede Frontend

## Deploy no Vercel (Recomendado)

### Preparação
1. Certifique-se que o projeto está no GitHub
2. Crie uma conta no Vercel (vercel.com)

### Configuração
1. Importe o repositório no Vercel
2. Configure o build:
   - Build Command: `cd frontend && npm install && npm run build`
   - Output Directory: `frontend/dist/na-sede-frontend/browser`
   - Install Command: `npm install`

3. Configure as variáveis de ambiente:
   - `PRODUCTION_API_URL`: URL da API em produção

### Build Local
\`\`\`bash
cd frontend
npm run build
\`\`\`

## Deploy Manual

### Build de Produção
\`\`\`bash
npm run build
\`\`\`

Os arquivos estarão em `dist/na-sede-frontend/browser`

### Servidor Web
Configure seu servidor (Nginx, Apache) para servir os arquivos da pasta `dist`.

Exemplo de configuração Nginx:
\`\`\`nginx
server {
    listen 80;
    server_name seu-dominio.com;
    root /caminho/para/dist/na-sede-frontend/browser;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
\`\`\`

## Variáveis de Ambiente

Certifique-se de atualizar `src/environments/environment.prod.ts` com a URL da API em produção.
