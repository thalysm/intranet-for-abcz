# Build Stage
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Runtime Stage
FROM nginx:alpine
# Copy the build output to replace the default nginx contents.
# Note: Angular 17+ 'application' builder outputs to dist/project-name/browser by default.
COPY --from=build /app/dist/na-sede-frontend/browser /usr/share/nginx/html

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
