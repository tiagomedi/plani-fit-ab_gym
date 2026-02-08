#!/bin/bash

# Script para iniciar frontend y backend automáticamente
# Este script inicia ambos servicios y los mantiene corriendo

echo "🚀 Iniciando AB Gym Studio..."
echo ""

# Obtener el directorio del script
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Función para manejar la señal de salida
cleanup() {
    echo ""
    echo "🛑 Deteniendo servicios..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit 0
}

trap cleanup SIGINT SIGTERM

# Iniciar Backend
echo "📦 Iniciando Backend en http://localhost:8000..."
cd "$SCRIPT_DIR/gym-planner/backend"
export PYTHONPATH="$PWD"
./venv/bin/uvicorn main:app --host 0.0.0.0 --port 8000 > backend.log 2>&1 &
BACKEND_PID=$!

# Esperar a que el backend esté listo
sleep 3

# Verificar que el backend se inició correctamente
if ! kill -0 $BACKEND_PID 2>/dev/null; then
    echo "❌ Error: El backend no se pudo iniciar"
    echo "Ver backend.log para más detalles"
    exit 1
fi

echo "✅ Backend iniciado correctamente (PID: $BACKEND_PID)"
echo ""

# Iniciar Frontend
echo "🎨 Iniciando Frontend en http://localhost:5173..."
cd "$SCRIPT_DIR/gym-planner/frontend"
npm run dev > frontend.log 2>&1 &
FRONTEND_PID=$!

# Esperar a que el frontend esté listo
sleep 3

# Verificar que el frontend se inició correctamente
if ! kill -0 $FRONTEND_PID 2>/dev/null; then
    echo "❌ Error: El frontend no se pudo iniciar"
    echo "Ver frontend.log para más detalles"
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

echo "✅ Frontend iniciado correctamente (PID: $FRONTEND_PID)"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "💪 AB GYM STUDIO ESTÁ LISTO 💪"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🌐 Frontend: http://localhost:5173"
echo "🔧 Backend:  http://localhost:8000"
echo ""
echo "Presiona Ctrl+C para detener ambos servicios"
echo ""

# Mantener el script corriendo y monitorear los procesos
while true; do
    # Verificar si el backend sigue corriendo
    if ! kill -0 $BACKEND_PID 2>/dev/null; then
        echo "❌ Backend se detuvo inesperadamente. Reiniciando..."
        cd "$SCRIPT_DIR/gym-planner/backend"
        export PYTHONPATH="$PWD"
        ./venv/bin/uvicorn main:app --host 0.0.0.0 --port 8000 >> backend.log 2>&1 &
        BACKEND_PID=$!
        sleep 2
    fi
    
    # Verificar si el frontend sigue corriendo
    if ! kill -0 $FRONTEND_PID 2>/dev/null; then
        echo "❌ Frontend se detuvo inesperadamente. Reiniciando..."
        cd "$SCRIPT_DIR/gym-planner/frontend"
        npm run dev >> frontend.log 2>&1 &
        FRONTEND_PID=$!
        sleep 2
    fi
    
    sleep 5
done
