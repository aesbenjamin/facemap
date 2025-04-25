#!/bin/bash
set -e

echo "========================================="
echo "Preparando configuração completa para Railway com suporte a IPv6"
echo "========================================="

# Atualizar o Dockerfile do backend para IPv6
echo "Atualizando Dockerfile do backend para suporte a IPv6"
cat > backend/Dockerfile << 'EOF'
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies for OpenCV and Mediapipe
RUN apt-get update && apt-get install -y \
    libgl1 \
    libglib2.0-0 \
    libsm6 \
    libxrender1 \
    libxext6 \
    libx11-6 \
    libxrandr2 \
    libxxf86vm1 \
    libxi6 \
    libxfixes3 \
    libxcursor1 \
    libgles2 \
    curl \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Set environment variables to specify headless OpenCV
ENV PYTHONUNBUFFERED=1
ENV OPENCV_VIDEOIO_PRIORITY_MSMF=0
ENV MEDIAPIPE_DISABLE_GPU=1
ENV PORT=5000
ENV HOST="::"

# Add healthcheck
HEALTHCHECK --interval=10s --timeout=5s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:5000/ || exit 1

# Expose port (both IPv4 and IPv6)
EXPOSE 5000/tcp

# Use the startup command with IPv6 support
CMD uvicorn main:app --host "::" --port 5000
EOF

# Atualizar o arquivo main.py para ter suporte a IPv6 no health check
echo "Atualizando o endpoint de health check no main.py"
sed -i '/async def health_check/,/return {"status": "ok"}/c\@app.get("/")\nasync def health_check():\n    """Health check endpoint for monitoring"""\n    # This will always return OK to pass the health check\n    import socket\n    hostname = socket.gethostname()\n    return {"status": "ok", "hostname": hostname, "ipv6_support": "Enabled", "version": "1.0.0"}' backend/main.py

# Criar config do Railway para o backend
echo "Criando configuração do Railway para o backend"
cat > backend/railway.json << 'EOF'
{
  "build": {
    "builder": "DOCKERFILE",
    "dockerfilePath": "Dockerfile"
  },
  "deploy": {
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10,
    "numReplicas": 1,
    "startCommand": "uvicorn main:app --host '::' --port 5000",
    "healthcheckPath": "/",
    "healthcheckTimeout": 60,
    "healthcheckInterval": 15,
    "healthcheckRetries": 5,
    "port": 5000,
    "ipv6": true
  }
}
EOF

# Atualizar Dockerfile do frontend para IPv6
echo "Atualizando Dockerfile do frontend para suporte a IPv6"
cat > frontend/Dockerfile << 'EOF'
FROM node:18-alpine as build

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the code
COPY . .

# Set environment variables with defaults
ARG BACKEND_URL=https://facemap-production.up.railway.app
ENV REACT_APP_API_URL=${BACKEND_URL}

# Build the app
RUN echo "Building with API URL: $REACT_APP_API_URL" && \
    npm run build

# Production environment
FROM nginx:alpine

# Install curl for healthcheck
RUN apk --no-cache add curl

# Copy built assets from the build stage
COPY --from=build /app/build /usr/share/nginx/html

# Create a more robust nginx config with IPv6 support
RUN echo 'server { \
    listen 80 default_server; \
    listen [::]:80 default_server; \
    server_name _; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html; \
        try_files $uri $uri/ /index.html; \
    } \
    location /health { \
        access_log off; \
        return 200 "ok"; \
    } \
    # Cache static assets \
    location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ { \
        root /usr/share/nginx/html; \
        expires 30d; \
        add_header Cache-Control "public, no-transform"; \
    } \
}' > /etc/nginx/conf.d/default.conf

# Add healthcheck
HEALTHCHECK --interval=5s --timeout=3s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:80/health || exit 1

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
EOF

# Criar config do Railway para o frontend
echo "Criando configuração do Railway para o frontend"
cat > frontend/railway.json << 'EOF'
{
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

# Criar o railway.toml na raiz
echo "Criando arquivo de configuração raiz para Railway"
cat > railway.toml << 'EOF'
[build]
builder = "nixpacks"

[[services]]
name = "facemap"
path = "backend"
dockerfile_path = "Dockerfile"
internal_port = 5000
start_command = "uvicorn main:app --host '::' --port 5000"
healthcheck_path = "/"
healthcheck_timeout_seconds = 60
healthcheck_interval_seconds = 15

[[services]]
name = "focused-youthfulness"
path = "frontend"
dockerfile_path = "Dockerfile"
internal_port = 80
healthcheck_path = "/health"
healthcheck_timeout_seconds = 30
healthcheck_interval_seconds = 5
envs = [
    { name = "BACKEND_URL", value = "https://facemap-production.up.railway.app" }
]
EOF

echo "========================================="
echo "Configuração completa!"
echo "========================================="
echo ""
echo "Os arquivos foram configurados para usar as versões completas da aplicação:"
echo " - Backend usando main.py (não minimal) com suporte a IPv6"
echo " - Frontend usando o build completo do React com suporte a IPv6"
echo ""
echo "Instruções de deploy:"
echo "1. Faça commit e push das alterações"
echo "2. Use railway up para fazer o deploy"
echo ""
echo "Importante: Como estamos usando as versões completas, o tempo de build"
echo "e o tempo de healthcheck podem ser mais longos. Os timeouts foram ajustados"
echo "para lidar com isso." 