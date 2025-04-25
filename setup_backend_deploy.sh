#!/bin/bash
set -e

echo "========================================="
echo "Preparando backend para deploy no Railway (serviço isolado)"
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
    iputils-ping \
    net-tools \
    dnsutils \
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
echo "Atualizando o endpoint de health check no main.py para verificar IPv6"
cat > backend/health_check.py << 'EOF'
@app.get("/")
async def health_check():
    """Health check endpoint for monitoring"""
    import socket
    import subprocess
    import json
    from fastapi.responses import JSONResponse
    
    # Get basic host info
    hostname = socket.gethostname()
    
    # Check if IPv6 is available at the OS level
    has_ipv6 = False
    ipv6_addresses = []
    
    try:
        # Try to get all addresses including IPv6
        addrinfo = socket.getaddrinfo(hostname, None)
        
        # Filter for IPv6 addresses
        for addr in addrinfo:
            if addr[0] == socket.AF_INET6:
                has_ipv6 = True
                ipv6_addresses.append(addr[4][0])
    except Exception as e:
        pass
    
    # Try to get local IPv6 addresses
    try:
        # This will work on Linux
        output = subprocess.check_output("ip -6 addr show | grep inet6 | awk '{print $2}'", shell=True).decode('utf-8')
        if output.strip():
            has_ipv6 = True
            ipv6_addresses = output.strip().split('\n')
    except:
        pass
        
    return {
        "status": "ok", 
        "hostname": hostname,
        "ipv6_support": "Available" if has_ipv6 else "Not available",
        "ipv6_addresses": ipv6_addresses,
        "version": "1.0.0"
    }
EOF

# Inserir o código do health check no main.py
sed -i '/async def health_check/,/return {"status": "ok"}/d' backend/main.py
sed -i '/^# Initialize MediaPipe Face Mesh with error handling/r backend/health_check.py' backend/main.py
rm backend/health_check.py

# Criar config do Railway para o backend
echo "Criando configuração do Railway para o backend"
cat > backend/railway.json << 'EOF'
{
  "$schema": "https://railway.app/railway.schema.json",
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

echo "========================================="
echo "Configuração do backend completa!"
echo "========================================="
echo ""
echo "As configurações do backend foram atualizadas:"
echo " - Dockerfile atualizado com suporte a IPv6 e ferramentas de rede"
echo " - main.py configurado com healthcheck que verifica ativamente IPv6"
echo " - railway.json criado para configuração do serviço"
echo ""
echo "Para fazer o deploy do backend no Railway:"
echo "1. Navegue até a pasta backend: cd backend"
echo "2. Inicialize o projeto no Railway: railway init"
echo "3. Faça o deploy: railway up"
echo ""
echo "Importante: A rota / agora retorna informações detalhadas sobre o suporte a IPv6,"
echo "incluindo os endereços IPv6 disponíveis no container." 