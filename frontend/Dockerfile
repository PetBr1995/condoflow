# ==========================================
# CondoFlow Frontend - Multi-Stage Dockerfile
# ==========================================

# Estágio 1: Build do Angular
FROM node:20-alpine AS builder

WORKDIR /app

# Instala dependências do projeto
COPY package*.json ./
RUN npm ci

# Copia código-fonte e compila para produção
COPY . .
RUN npm run build -- --configuration production

# Estágio 2: Servidor Web Nginx ultra-leve
FROM nginx:alpine

# Remove página padrão do Nginx
RUN rm -rf /usr/share/nginx/html/*

# Copia build compilado do Angular
COPY --from=builder /app/dist/condoflow-frontend/browser /usr/share/nginx/html

# Copia configuração de rotas e cache do Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
