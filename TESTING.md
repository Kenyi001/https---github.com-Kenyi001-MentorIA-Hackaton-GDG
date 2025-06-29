# 🧪 Guía de Testing - MentorIA Extension

Esta guía te ayudará a probar todas las funcionalidades de la extensión MentorIA.

## 📋 Prerrequisitos

1. **Backend ejecutándose**: Asegúrate de que tu servidor esté corriendo en `http://localhost:3001`
2. **Dashboard ejecutándose**: Asegúrate de que tu dashboard esté corriendo en `http://localhost:3001/dashboard`
3. **Extensión cargada**: La extensión debe estar instalada en Chrome

## 🚀 Pasos de Testing

### 1. Verificar Configuración

1. Abre el archivo `test-mentoria.html` en tu navegador
2. Verifica que la configuración se cargue correctamente
3. Confirma que las URLs del backend y Pusher sean correctas

### 2. Probar Conexión Backend

1. En la página de test, haz clic en "Test Backend"
2. Verifica que el endpoint `/health` responda correctamente
3. Confirma que muestre el estado del servidor y usuarios conectados

### 3. Probar Pusher

1. Haz clic en "Test Pusher" en la página de test
2. Verifica que se conecte al cluster correcto
3. Confirma que la suscripción al canal sea exitosa

### 4. Probar Dashboard

1. Haz clic en "Abrir Dashboard" o "Test Dashboard"
2. Verifica que se abra correctamente en `http://localhost:3001/dashboard`
3. Confirma que la página cargue sin errores

### 5. Probar Envío de Prompts

1. Haz clic en "Enviar Prompt Test"
2. Verifica que el prompt se envíe al backend
3. Confirma que recibas una respuesta válida

## 🔧 Testing de la Extensión

### 1. Cargar la Extensión

1. Abre Chrome y ve a `chrome://extensions/`
2. Activa el "Modo desarrollador"
3. Haz clic en "Cargar descomprimida" y selecciona la carpeta de la extensión
4. Verifica que aparezca en la lista de extensiones

### 2. Probar en Gemini Chat

1. Ve a `https://gemini.google.com/`
2. Abre la extensión haciendo clic en el ícono
3. Verifica que se muestre la interfaz correctamente
4. Escribe un prompt y haz clic en "Analizar Prompt Actual"
5. Verifica que se muestre el análisis de calidad

### 3. Probar en ChatGPT

1. Ve a `https://chat.openai.com/`
2. Repite los mismos pasos que en Gemini
3. Verifica que funcione correctamente

### 4. Probar Funciones Avanzadas

1. **Análisis con Vertex AI**: Haz clic en "Evaluar con IA"
2. **Dashboard**: Haz clic en "Dashboard" para abrir la página local
3. **Plan de Suscripción**: Haz clic en el botón de estado del plan
4. **Captura Automática**: Escribe prompts y verifica que se capturen automáticamente

## 🐛 Solución de Problemas

### Backend No Disponible

```
Error: Backend no disponible
```

**Solución:**
1. Verifica que el servidor esté ejecutándose en el puerto 3001
2. Ejecuta `npm run dev` en tu backend
3. Verifica que no haya errores en la consola

### Pusher No Conecta

```
Error: Error en Pusher
```

**Solución:**
1. Verifica que la clave de Pusher sea correcta en `config.js`
2. Confirma que el cluster sea `us2`
3. Verifica tu conexión a internet

### Dashboard No Carga

```
Error: Dashboard no disponible
```

**Solución:**
1. Verifica que el dashboard esté ejecutándose en el puerto 3001
2. Confirma que la ruta `/dashboard` exista
3. Verifica que no haya errores CORS

### Extensión No Funciona

**Solución:**
1. Recarga la extensión en `chrome://extensions/`
2. Verifica que los permisos estén correctos en `manifest.json`
3. Revisa la consola del navegador para errores

## 📊 Verificación de Funcionalidades

### ✅ Checklist de Testing

- [ ] Configuración carga correctamente
- [ ] Backend responde en puerto 3001
- [ ] Pusher se conecta correctamente
- [ ] Dashboard es accesible en puerto 3001
- [ ] Extensión se carga sin errores
- [ ] Análisis de prompts funciona
- [ ] Evaluación con Vertex AI funciona
- [ ] Captura automática de prompts funciona
- [ ] Modal de planes funciona
- [ ] Dashboard se abre correctamente
- [ ] Logs muestran información útil

### 🔍 Verificación de Logs

Revisa la consola del navegador para:
- Errores de conexión
- Mensajes de Pusher
- Respuestas del backend
- Errores de la extensión

## 🎯 Testing Específico por Función

### Análisis de Prompts

1. Escribe un prompt corto (< 10 palabras)
2. Verifica que se marque como "CORTO"
3. Escribe un prompt largo (> 50 palabras)
4. Verifica que se marque como "LARGO"
5. Escribe un prompt con preguntas complejas
6. Verifica que aumente la puntuación de reflexividad

### Captura Automática

1. Escribe un prompt en Gemini/ChatGPT
2. Espera 7 segundos sin enviar
3. Verifica que aparezca el indicador de análisis
4. Envía el prompt
5. Verifica que se capture en la lista

### Planes de Suscripción

1. Haz clic en el botón de estado del plan
2. Verifica que se abra el modal
3. Prueba cambiar entre planes
4. Verifica que se muestren las confirmaciones

## 📝 Notas Importantes

- El backend y dashboard deben estar en puerto **3001**
- La extensión requiere permisos para `localhost`
- Pusher requiere conexión a internet
- Los logs se muestran en tiempo real en la página de test

## 🆘 Contacto

Si encuentras problemas, revisa:
1. Los logs en la página de test
2. La consola del navegador
3. Los logs del servidor backend
4. La documentación de Pusher 