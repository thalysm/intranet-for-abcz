# Guia de Deploy - Na Sede Backend

## Deploy no Railway/Heroku

### Preparação
1. Crie conta no Railway (railway.app) ou Heroku
2. Certifique-se que o PostgreSQL está acessível

### Configuração Railway
1. Crie novo projeto
2. Conecte seu repositório GitHub
3. Configure as variáveis de ambiente:
   - `ConnectionStrings__DefaultConnection`: String de conexão PostgreSQL
   - `Jwt__Key`: Chave secreta JWT
   - `Twilio__AccountSid`: Twilio Account SID
   - `Twilio__AuthToken`: Twilio Auth Token
   - `Frontend__Url`: URL do frontend

4. Configure o build:
   - Build Command: `dotnet publish NaSede.Api -c Release -o out`
   - Start Command: `cd out && dotnet NaSede.Api.dll`

## Deploy Manual (Linux/VPS)

### Instalação do .NET 9
\`\`\`bash
wget https://dot.net/v1/dotnet-install.sh
chmod +x dotnet-install.sh
./dotnet-install.sh --channel 9.0
\`\`\`

### Build e Deploy
\`\`\`bash
cd backend
dotnet publish NaSede.Api -c Release -o /var/www/nasede
\`\`\`

### Configuração com Systemd
Crie `/etc/systemd/system/nasede.service`:
\`\`\`ini
[Unit]
Description=Na Sede API

[Service]
WorkingDirectory=/var/www/nasede
ExecStart=/usr/bin/dotnet /var/www/nasede/NaSede.Api.dll
Restart=always
RestartSec=10
SyslogIdentifier=nasede
User=www-data
Environment=ASPNETCORE_ENVIRONMENT=Production

[Install]
WantedBy=multi-user.target
\`\`\`

Ative o serviço:
\`\`\`bash
sudo systemctl enable nasede
sudo systemctl start nasede
\`\`\`

### Nginx como Reverse Proxy
\`\`\`nginx
server {
    listen 80;
    server_name api.seu-dominio.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection keep-alive;
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
\`\`\`

## Migrações do Banco

Antes do deploy, execute:
\`\`\`bash
dotnet ef database update --project NaSede.Infrastructure --startup-project NaSede.Api
\`\`\`

## Checklist de Segurança

- [ ] Alterar senha do PostgreSQL
- [ ] Configurar HTTPS/SSL
- [ ] Atualizar Jwt:Key com valor seguro
- [ ] Configurar CORS para domínios específicos
- [ ] Habilitar rate limiting
- [ ] Configurar logs e monitoring
