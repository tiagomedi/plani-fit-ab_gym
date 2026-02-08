# AB Gym Studio - Sistema de Planificación Profesional

## 🚀 Inicio Rápido

### Opción 1: Iniciar Todo Automáticamente (RECOMENDADO)

```bash
./start_all.sh
```

Este script iniciará automáticamente:
- ✅ Backend en `http://localhost:8000`
- ✅ Frontend en `http://localhost:5173`
- ✅ Auto-reinicio si algún servicio se detiene
- ✅ Logs en `backend.log` y `frontend.log`

Para detener: presiona `Ctrl+C`

---

### Opción 2: Iniciar Manualmente

#### Backend:
```bash
cd gym-planner/backend
./start_backend.sh
```

#### Frontend:
```bash
cd gym-planner/frontend
npm run dev
```

---

## 📋 Requisitos

- Python 3.9+
- Node.js 16+
- Dependencias instaladas (ver secciones abajo)

## 🔧 Instalación

### Backend
```bash
cd gym-planner/backend
python -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### Frontend
```bash
cd gym-planner/frontend
npm install
```

## 🐛 Solución de Problemas

### Error de conexión:
1. Verifica que el backend esté corriendo: `lsof -ti :8000`
2. Si no está corriendo, usa `./start_all.sh`
3. Revisa los logs: `tail -f gym-planner/backend/backend.log`

### Puerto ocupado:
```bash
# Liberar puerto 8000
lsof -ti :8000 | xargs kill -9

# Liberar puerto 5173
lsof -ti :5173 | xargs kill -9
```

## 📁 Estructura del Proyecto

```
plani-fit-ab_gym/
├── start_all.sh              # Script principal de inicio
├── gym-planner/
│   ├── backend/
│   │   ├── main.py           # API FastAPI
│   │   ├── start_backend.sh  # Inicio backend individual
│   │   ├── requirements.txt
│   │   └── template_static.pdf
│   └── frontend/
│       ├── src/
│       │   └── App.jsx       # Aplicación principal React
│       └── package.json
└── README_STARTUP.md         # Este archivo
```

## 🎯 Uso

1. Ejecuta `./start_all.sh`
2. Abre `http://localhost:5173` en tu navegador
3. Llena el formulario de planificación
4. Descarga tu plan de entrenamiento en PDF

## 💡 Características

- ✨ Interfaz moderna y profesional
- 📊 Generación de PDFs personalizados
- 🎨 Diseño responsivo
- 💪 Sistema de planificación por días
- 📈 Seguimiento de ejercicios detallado
