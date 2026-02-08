#!/bin/bash

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

# Verificar si estamos en el directorio correcto
if [ ! -d "gym-planner" ]; then
    echo -e "${RED}❌ Error: Ejecuta este script desde la raíz del proyecto${NC}"
    exit 1
fi

# Función para verificar si un puerto está en uso
check_port() {
    lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null 2>&1
}

# Limpiar puertos si están en uso
echo -e "${YELLOW}🔍 Verificando puertos...${NC}"
if check_port 8000; then
    echo -e "${YELLOW}⚠️  Liberando puerto 8000...${NC}"
    lsof -ti:8000 | xargs kill -9 2>/dev/null || true
    sleep 1
fi

if check_port 5173; then
    echo -e "${YELLOW}⚠️  Liberando puerto 5173...${NC}"
    lsof -ti:5173 | xargs kill -9 2>/dev/null || true
    sleep 1
fi

echo -e "${GREEN}✓${NC} Puertos disponibles"
echo ""

# Función para abrir una nueva terminal y ejecutar un comando
open_terminal_and_run() {
    local title=$1
    local command=$2
    
    osascript <<EOF
tell application "Terminal"
    do script "echo '${title}' && cd '$PWD' && $command"
    activate
end tell
EOF
}

# Iniciar backend
echo -e "${CYAN}🚀 Iniciando BACKEND...${NC}"
open_terminal_and_run "AB GYM - BACKEND" "cd gym-planner/backend && ./start_backend.sh"
echo -e "${GREEN}✓${NC} Backend iniciando en nueva terminal"
echo ""

# Esperar a que el backend esté listo
echo -e "${YELLOW}⏳ Esperando a que el backend esté listo...${NC}"
sleep 3

max_attempts=15
attempt=0
backend_ready=false

while [ $attempt -lt $max_attempts ]; do
    if curl -s http://localhost:8000/health > /dev/null 2>&1; then
        backend_ready=true
        break
    fi
    echo -e "${YELLOW}   Intento $((attempt + 1))/$max_attempts...${NC}"
    sleep 2
    ((attempt++))
done

if [ "$backend_ready" = true ]; then
    echo -e "${GREEN}✓${NC} Backend listo en http://localhost:8000"
    echo ""
    
    # Iniciar frontend
    echo -e "${CYAN}🚀 Iniciando FRONTEND...${NC}"
    open_terminal_and_run "AB GYM - FRONTEND" "cd gym-planner/frontend && ./start_frontend.sh"
    echo -e "${GREEN}✓${NC} Frontend iniciando en nueva terminal"
    echo ""
    
    # Esperar y abrir navegador
    sleep 3
    echo -e "${CYAN}🌐 Abriendo navegador...${NC}"
    open http://localhost:5173
    
    echo ""
    echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║${GREEN}                  ✅ SISTEMA LISTO ✅                   ${BLUE}║${NC}"
    echo -e "${BLUE}╠════════════════════════════════════════════════════════╣${NC}"
    echo -e "${BLUE}║${NC}  🔹 Frontend: ${CYAN}http://localhost:5173${NC}                   ${BLUE}║${NC}"
    echo -e "${BLUE}║${NC}  🔹 Backend:  ${CYAN}http://localhost:8000${NC}                   ${BLUE}║${NC}"
    echo -e "${BLUE}║${NC}  🔹 API Docs: ${CYAN}http://localhost:8000/docs${NC}              ${BLUE}║${NC}"
    echo -e "${BLUE}║${NC}  🔹 Health:   ${CYAN}http://localhost:8000/health${NC}            ${BLUE}║${NC}"
    echo -e "${BLUE}╠════════════════════════════════════════════════════════╣${NC}"
    echo -e "${BLUE}║${YELLOW}  Para detener: Cierra las terminales del backend      ${BLUE}║${NC}"
    echo -e "${BLUE}║${YELLOW}                 y frontend, o presiona Ctrl+C         ${BLUE}║${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
    echo ""
    
else
    echo -e "${RED}❌ Error: El backend no se inició correctamente${NC}"
    echo -e "${YELLOW}   Verifica los logs en la terminal del backend${NC}"
    exit 1
fi
