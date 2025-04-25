#!/bin/bash
set -e

echo "========================================="
echo "Preparando frontend para deploy no Railway (serviço isolado)"
echo "========================================="

# Verificar se o usuário forneceu a URL do backend
BACKEND_URL=${1:-"https://facemap-production.up.railway.app"}
echo "Usando URL do backend: $BACKEND_URL"

# Atualizar Dockerfile do frontend para IPv6
echo "Atualizando Dockerfile do frontend para suporte a IPv6"
cat > frontend/Dockerfile << EOF
FROM node:18-alpine as build

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the code
COPY . .

# Set environment variables with defaults
ARG BACKEND_URL=${BACKEND_URL}
ENV REACT_APP_API_URL=\${BACKEND_URL}

# Build the app
RUN echo "Building with API URL: \$REACT_APP_API_URL" && \\
    npm run build

# Production environment
FROM nginx:alpine

# Install curl for healthcheck
RUN apk --no-cache add curl

# Copy built assets from the build stage
COPY --from=build /app/build /usr/share/nginx/html

# Create a more robust nginx config with IPv6 support
RUN echo 'server { \\
    listen 80 default_server; \\
    listen [::]:80 default_server; \\
    server_name _; \\
    location / { \\
        root /usr/share/nginx/html; \\
        index index.html; \\
        try_files \$uri \$uri/ /index.html; \\
    } \\
    location /health { \\
        access_log off; \\
        return 200 "ok"; \\
    } \\
    # Cache static assets \\
    location ~* \\.(jpg|jpeg|png|gif|ico|css|js)\$ { \\
        root /usr/share/nginx/html; \\
        expires 30d; \\
        add_header Cache-Control "public, no-transform"; \\
    } \\
}' > /etc/nginx/conf.d/default.conf

# Add healthcheck
HEALTHCHECK --interval=5s --timeout=3s --start-period=10s --retries=3 \\
  CMD curl -f http://localhost:80/health || exit 1

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
EOF

# Criar config do Railway para o frontend
echo "Criando configuração do Railway para o frontend"
cat > frontend/railway.json << EOF
{
  "\$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "DOCKERFILE",
    "dockerfilePath": "Dockerfile"
  },
  "deploy": {
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10,
    "numReplicas": 1,
    "healthcheckPath": "/health",
    "healthcheckTimeout": 30,
    "healthcheckInterval": 5,
    "healthcheckRetries": 3,
    "port": 80,
    "ipv6": true
  }
}
EOF

# Criar um .env para o frontend
echo "Criando arquivo .env para o frontend"
cat > frontend/.env << EOF
REACT_APP_API_URL=${BACKEND_URL}
EOF

echo "========================================="
echo "Configuração do frontend completa!"
echo "========================================="
echo ""
echo "As configurações do frontend foram atualizadas:"
echo " - Dockerfile atualizado com suporte a IPv6"
echo " - railway.json criado para configuração do serviço"
echo " - Configurado para usar a URL do backend: ${BACKEND_URL}"
echo ""
echo "Para fazer o deploy do frontend no Railway:"
echo "1. Navegue até a pasta frontend: cd frontend"
echo "2. Inicialize o projeto no Railway: railway init"
echo "3. Faça o deploy: railway up"
echo ""
echo "Dica: Se precisar usar uma URL de backend diferente, execute o script"
echo "com a URL como parâmetro:"
echo "  ./setup_frontend_deploy.sh https://sua-url-backend.up.railway.app" 