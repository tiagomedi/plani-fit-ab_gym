#!/bin/bash
set -e

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🏋️  AB GYM PLANNER - FRONTEND STARTUP${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

cd "$(dirname "$0")"

# Verificar Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js no está instalado${NC}"
    exit 1
fi

echo -e "${GREEN}✓${NC} Node.js encontrado: $(node --version)"
echo -e "${GREEN}✓${NC} npm encontrado: $(npm --version)"

# Instalar dependencias si no existen
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}⚙️  Instalando dependencias...${NC}"
    npm install
    echo -e "${GREEN}✓${NC} Dependencias instaladas"
else
    echo -e "${GREEN}✓${NC} Dependencias ya instaladas"
fi

# Verificar puerto disponible
if lsof -Pi :5173 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Puerto 5173 en uso. Liberando...${NC}"
    lsof -ti:5173 | xargs kill -9 2>/dev/null || true
    sleep 1
fi

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🚀 Iniciando frontend en http://localhost:5173${NC}"
echo -e "${YELLOW}⚠️  IMPORTANTE: Asegúrate de que el backend esté corriendo en el puerto 8000${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

npm run dev
