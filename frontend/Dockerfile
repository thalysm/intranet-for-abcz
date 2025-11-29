# Build Stage
FROM node:20-alpine AS build
WORKDIR /app

# Desabilita cache do npm para evitar erro ERESOLVE no Coolify
ENV npm_config_cache=/tmp/npm-cache

COPY package*.json ./
RUN npm ci --prefer-offline --no-audit --fund=false

COPY . .
RUN npm run build

# Runtime Stage
FROM nginx:alpine

# Copia build para o Nginx
COPY --from=build /app/dist/na-sede-frontend/browser /usr/share/nginx/html

# Copia config do nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
