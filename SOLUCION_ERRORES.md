# 🏋️ AB GYM PLANNER - Guía de Solución de Problemas

## 🔴 ERROR: "Error de conexión"

### Causas más comunes:

1. **Backend no está ejecutándose**
   - El servidor FastAPI no está corriendo
   - Se detuvo inesperadamente

2. **Puerto 8000 bloqueado**
   - Otra aplicación está usando el puerto
   - El proceso anterior no se cerró correctamente

3. **Problemas de red/firewall**
   - El firewall está bloqueando la conexión
   - Problemas de permisos

---

## ✅ SOLUCIÓN RÁPIDA

### Opción 1: Script Automático (RECOMENDADO)
```bash
cd /ruta/al/proyecto
./start_all.sh
```
Este script:
- ✓ Verifica dependencias
- ✓ Libera puertos ocupados
- ✓ Inicia backend y frontend automáticamente
- ✓ Verifica que todo esté funcionando
- ✓ Abre el navegador

### Opción 2: Manual

#### 1. Iniciar Backend:
```bash
cd gym-planner/backend
./start_backend.sh
```

Espera ver:
```
🚀 Iniciando servidor en http://localhost:8000
📊 Health check: http://localhost:8000/health
```

#### 2. Verificar Backend (en otra terminal):
```bash
curl http://localhost:8000/health
```

Deberías ver: `{"status":"healthy",...}`

#### 3. Iniciar Frontend:
```bash
cd gym-planner/frontend
./start_frontend.sh
```

---

## 🔧 DIAGNÓSTICO AVANZADO

### Verificar si el backend está corriendo:
```bash
lsof -i :8000
```

Si ves procesos, el backend está corriendo.

### Liberar puerto 8000 manualmente:
```bash
lsof -ti:8000 | xargs kill -9
```

### Liberar puerto 5173 (frontend):
```bash
lsof -ti:5173 | xargs kill -9
```

### Ver logs del backend:
Los logs aparecerán en la terminal donde ejecutaste `start_backend.sh`

Busca mensajes como:
- ✓ "Health check solicitado" - Backend funcionando
- 📊 "Generando PDF para cliente..." - Procesando solicitud
- ❌ Errores con traceback - Problema específico

---

## 🐛 ERRORES ESPECÍFICOS

### "template_static.pdf no encontrado"
```bash
cd gym-planner/backend
# Verifica que existe:
ls -la template_static.pdf
```

### "ModuleNotFoundError" o problemas con dependencias:
```bash
cd gym-planner/backend
source venv/bin/activate
pip install -r requirements.txt
```

### El frontend no se conecta:
1. Verifica que el backend esté en puerto 8000
2. Abre http://localhost:8000/health en el navegador
3. Si no responde, reinicia el backend

---

## 📋 CHECKLIST DE VERIFICACIÓN

Antes de generar un PDF, verifica:

- [ ] Backend corriendo en puerto 8000
- [ ] Frontend corriendo en puerto 5173
- [ ] http://localhost:8000/health devuelve status "healthy"
- [ ] Archivo template_static.pdf existe en gym-planner/backend
- [ ] No hay errores en la consola del navegador (F12)
- [ ] No hay errores en la terminal del backend

---

## 🆘 SI TODO FALLA

1. **Detén todos los procesos:**
   ```bash
   lsof -ti:8000 | xargs kill -9
   lsof -ti:5173 | xargs kill -9
   ```

2. **Limpia y reinstala dependencias:**
   
   Backend:
   ```bash
   cd gym-planner/backend
   rm -rf venv
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```
   
   Frontend:
   ```bash
   cd gym-planner/frontend
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Reinicia usando el script automático:**
   ```bash
   ./start_all.sh
   ```

---

## 💡 MEJORAS IMPLEMENTADAS

El sistema ahora incluye:

✅ **Verificación automática de conexión** - El frontend verifica que el backend esté disponible antes de enviar datos

✅ **Mensajes de error detallados** - Sabrás exactamente qué salió mal y cómo solucionarlo

✅ **Health check endpoint** - `/health` para verificar el estado del servidor

✅ **Logging mejorado** - Logs con emojis y colores para facilitar el diagnóstico

✅ **Scripts robustos** - Verifican dependencias, liberan puertos, manejan errores

✅ **Reintentos automáticos** - Los scripts esperan a que los servicios estén listos

---

## 📞 SOPORTE

Si el problema persiste:
1. Revisa los logs en ambas terminales
2. Copia el mensaje de error completo
3. Verifica que Python 3 y Node.js estén instalados
4. Asegúrate de estar en el directorio correcto del proyecto
