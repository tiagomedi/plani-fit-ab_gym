#!/bin/bash
set -e

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

clear
echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║${GREEN}     🏋️  AB GYM PLANNER - INICIO COMPLETO 🏋️          ${BLUE}║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

# netlify dev necesita correr desde la raíz del repo (donde vive netlify.toml)
cd "$(dirname "$0")"

if [ ! -d "gym-planner" ]; then
    echo -e "${RED}❌ Error: no se encontró gym-planner/ junto a este script${NC}"
    exit 1
fi

if ! command -v netlify &> /dev/null; then
    echo -e "${YELLOW}⚠️  Netlify CLI no está instalada. Instalando...${NC}"
    npm install -g netlify-cli
fi

echo -e "${CYAN}🚀 Iniciando frontend + función de Excel (Netlify Dev)...${NC}"
echo -e "${YELLOW}   Esto sirve el frontend de Vite y la Netlify Function juntos${NC}"
echo -e "${YELLOW}   en un solo puerto (por defecto http://localhost:8888).${NC}"
echo ""

netlify dev
