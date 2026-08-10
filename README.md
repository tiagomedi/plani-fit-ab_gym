# Automatización Creación PLanificación Rutina GYM 

Desarrollo de una solución integral para la digitalización de servicios de entrenamiento, optimizando el flujo de trabajo administrativo mediante la automatización de la creación y gestión de rutinas personalizadas.

Frontend en React + Vite, con generación de Excel corriendo como Netlify Function (`gym-planner/frontend/netlify/functions/generate-xlsx.mjs`, usando `exceljs`) — todo desplegado en Netlify, sin backend separado.

![Plantilla Plani ABGYM](plani-abgym.png)

## Desarrollo local

```bash
npm install -g netlify-cli   # una sola vez
netlify dev                  # desde la raíz del repo
```

Esto sirve el frontend de Vite y la Netlify Function juntas en un solo puerto (por defecto `http://localhost:8888`), igual que en producción.
