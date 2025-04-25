#!/bin/bash
set -e

echo "========================================="
echo "Preparando configuração para Railway com suporte a IPv6"
echo "========================================="

# Backend setup
echo "Copiando Dockerfile mínimo para o backend (com suporte a IPv6)"
cp backend/Dockerfile.minimal backend/Dockerfile
cp railway.config.json backend/railway.json

# Frontend setup
echo "Copiando Dockerfile mínimo para o frontend (com suporte a IPv6)"
cp frontend/Dockerfile.minimal frontend/Dockerfile
cp railway.config.frontend.json frontend/railway.json

echo "========================================="
echo "Configuração completa!"
echo "========================================="
echo ""
echo "Para o backend:"
echo " - Dockerfile.minimal copiado para Dockerfile"
echo " - railway.config.json copiado para railway.json"
echo " - Configurado para escutar em '::' (todas as interfaces IPv6)"
echo ""
echo "Para o frontend:"
echo " - Dockerfile.minimal copiado para Dockerfile"
echo " - railway.config.frontend.json copiado para railway.json"
echo " - Nginx configurado para escutar em [::]:80 (todas as interfaces IPv6)"
echo ""
echo "Instruções de deploy:"
echo "1. Faça commit e push das alterações"
echo "2. No Railway, certifique-se de que a configuração está usando os seguintes parâmetros:"
echo "   - Backend: porta 5000, comando start: uvicorn main:app --host '::' --port 5000"
echo "   - Frontend: porta 80, sem comando start específico (usa o do Dockerfile)"
echo "   - Ambos marcados com ipv6: true na configuração"
echo ""
echo "Importante: Se o deployment falhar, verifique os logs e garanta que"
echo "o healthcheck está acessando corretamente o serviço." 