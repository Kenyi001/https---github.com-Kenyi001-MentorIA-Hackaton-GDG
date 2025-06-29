# ExtMentor - Analizador de Prompts con Enfoque en Deuda Cognitiva

ExtMentor es una extensión de Chrome diseñada para analizar la calidad de prompts en herramientas de IA como Gemini Chat y ChatGPT, con un enfoque especial en reducir la deuda cognitiva y fomentar el pensamiento crítico y la autonomía intelectual.

## 🚀 Nuevas Funcionalidades Visuales

### 1. Indicador de Análisis Automático
- **Análisis en Tiempo Real**: Después de 7 segundos de inactividad, aparece automáticamente un indicador visual que muestra el progreso del análisis
- **Feedback Visual**: Spinner animado con mensajes de estado ("Analizando prompt...", "Evaluando con IA avanzada...")
- **Notificación de Completado**: Mensaje de confirmación cuando el análisis termina
- **Posición Estratégica**: El indicador aparece justo encima de la interfaz del popup para máxima visibilidad

### 2. Token de Uso Ilimitado
- **Diseño Atractivo**: Token visual con icono ∞ y gradiente de colores
- **Mensaje Claro**: "MentorIA: Uso ilimitado por ahora"
- **Preparado para Monetización**: Diseño pensado para futuras implementaciones de sistema de tokens
- **Posición Destacada**: Ubicado en la parte superior del popup para máxima visibilidad

### 3. Botón del Dashboard
- **Acceso Directo**: Botón prominente "🚀 Acceder al Dashboard"
- **Página de Próximamente**: Redirige a una página elegante que muestra las funcionalidades futuras
- **Diseño Responsivo**: Botón con efectos hover y animaciones suaves
- **Funcionalidad Completa**: Listo para cuando el dashboard esté implementado

## 🎯 Objetivo Principal

**Combatir la deuda cognitiva** que surge del uso excesivo de IA, fomentando:
- **Autonomía cognitiva** en la formulación de prompts
- **Reflexividad crítica** en el proceso de aprendizaje
- **Pensamiento independiente** vs dependencia de IA
- **Uso consciente** de herramientas de IA

## 🚀 Características Principales

### **1. Evaluación Automática de Inactividad (7 segundos)**
- **Detección automática**: Evalúa prompts después de 7 segundos sin actividad
- **Análisis cognitivo**: Identifica patrones de dependencia de IA
- **Feedback reflexivo**: Sugerencias que fomentan el pensamiento independiente
- **Notificaciones inteligentes**: Alertas sobre riesgo de deuda cognitiva

### **2. Análisis de Calidad Cognitiva**
- **Puntuación de Autonomía**: Evalúa independencia vs dependencia de IA
- **Nivel de Reflexividad**: Mide inclusión de contexto personal
- **Complejidad Cognitiva**: Analiza profundidad del pensamiento requerido
- **Riesgo de Deuda Cognitiva**: Detecta patrones problemáticos

### **3. Feedback Orientado a la Reflexión**
- **Sugerencias personalizadas**: Enfocadas en desarrollo cognitivo
- **Preguntas reflexivas**: Invitan a analizar el proceso de aprendizaje
- **Advertencias de complacencia**: Detectan uso automático vs reflexivo
- **Recomendaciones específicas**: Para mejorar autonomía académica

### **4. Interfaz Moderna con Métricas Cognitivas**
- **Dashboard cognitivo**: Visualización de métricas de autonomía
- **Barras de progreso**: Autonomía, reflexividad y complejidad
- **Indicadores visuales**: Riesgo de deuda cognitiva
- **Historial detallado**: Análisis completo de prompts

### **5. Integración con Vertex AI (Preparada)**
- **Evaluación avanzada**: Análisis profundo con IA (simulado por ahora)
- **Insights cognitivos**: Patrones y tendencias de aprendizaje
- **Recomendaciones personalizadas**: Basadas en comportamiento del usuario
- **Analytics avanzados**: Métricas científicas de impacto cognitivo

## 📊 Criterios de Evaluación

### **Puntuación de Autonomía (1-5)**
- **5 puntos**: Prompt altamente autónomo, específico y reflexivo
- **4 puntos**: Buen nivel de autonomía con contexto personal
- **3 puntos**: Autonomía moderada, necesita más especificidad
- **2 puntos**: Baja autonomía, dependencia de IA
- **1 punto**: Muy baja autonomía, prompts genéricos

### **Niveles de Reflexividad**
- **ALTO**: Incluye contexto personal, experiencias, conexiones previas
- **MEDIO**: Alguno contexto, preguntas complejas
- **BAJO**: Sin contexto personal, preguntas simples

### **Indicadores de Deuda Cognitiva**
- Prompts muy cortos o genéricos
- Uso excesivo de palabras vagas
- Falta de contexto personal
- Preguntas que no requieren pensamiento crítico
- Dependencia excesiva de la IA para formular preguntas

## 🛠️ Instalación

1. Descarga o clona este repositorio
2. Abre Chrome y ve a `chrome://extensions/`
3. Activa el "Modo desarrollador" en la esquina superior derecha
4. Haz clic en "Cargar descomprimida"
5. Selecciona la carpeta del proyecto
6. La extensión aparecerá en tu barra de herramientas

## 📖 Uso

### **Captura Automática con Evaluación Cognitiva**
1. Ve a [Gemini Chat](https://gemini.google.com)
2. Comienza a escribir un prompt
3. **Después de 7 segundos de inactividad**, la extensión:
   - Evalúa automáticamente la calidad cognitiva
   - Muestra notificación con análisis de autonomía
   - Proporciona feedback reflexivo
   - Detecta riesgo de deuda cognitiva

### **Análisis Manual Avanzado**
1. Haz clic en el icono de ExtMentor
2. Si hay un prompt en el campo de texto:
   - Haz clic en "Analizar Actual" para evaluación local
   - Haz clic en "Evaluar con IA" para análisis avanzado (simulado)
3. Revisa las métricas cognitivas y recomendaciones

### **Monitoreo de Progreso Cognitivo**
1. Abre el popup de ExtMentor
2. Revisa las estadísticas:
   - **Total de Prompts**: Número de prompts analizados
   - **Promedio de Autonomía**: Tendencia de independencia
   - **Promedio de Reflexividad**: Nivel de contexto personal
3. Observa las barras de progreso cognitivo
4. Revisa el historial con indicadores de calidad

## 🔧 Configuración

### **Configuraciones Disponibles**
- `autoAnalyze`: Análisis automático en tiempo real
- `showNotifications`: Notificaciones del sistema
- `saveToBackend`: Envío automático al backend
- `vertexAIEnabled`: Evaluación con Vertex AI (cuando esté disponible)
- `inactivityTimeout`: Tiempo de inactividad (default: 7000ms)
- `cognitiveRiskThreshold`: Umbral de riesgo cognitivo

### **Personalización de Criterios**
Puedes modificar los criterios de evaluación en `content.js`:
```javascript
// Ejemplo: Agregar detección de emojis como indicador positivo
const hasEmojis = /[\u{1F600}-\u{1F64F}]/u.test(prompt);
if (hasEmojis) {
  quality.reflexivityScore += 1;
  quality.feedback.push('Uso de emojis muestra personalización.');
}
```

## 🔗 Preparación para Backend y Vertex AI

### **Estructura de Datos para Backend**
```json
{
  "text": "El prompt completo",
  "quality": {
    "score": 4,
    "autonomyScore": 3.5,
    "reflexivityScore": 4.0,
    "cognitiveLevel": "ALTO",
    "category": "LARGO",
    "feedback": ["Excelente contexto personal", "Buen uso de especificidad"]
  },
  "vertexAI": {
    "cognitiveComplexity": 4.2,
    "reflexivityLevel": 3.8,
    "autonomyScore": 3.5,
    "cognitiveRisk": "BAJO",
    "suggestions": ["Considera agregar más contexto personal"],
    "learningImpact": {
      "memoryRetention": 75,
      "criticalThinking": 80,
      "autonomyLevel": 70
    }
  },
  "metadata": {
    "timestamp": "2024-01-01T12:00:00.000Z",
    "inactivityDuration": 7000,
    "submissionType": "automatic"
  }
}
```

### **Integración con Vertex AI**
1. Configura proyecto en Google Cloud Console
2. Habilitar Vertex AI API
3. Crear credenciales de servicio
4. Reemplazar configuración en `vertex-ai-integration-example.js`
5. Descomenta las funciones de Vertex AI en `background.js`

## 📈 Analytics y Métricas

### **Métricas Cognitivas Capturadas**
- **Autonomía Cognitiva**: Independencia vs dependencia de IA
- **Reflexividad Crítica**: Inclusión de contexto personal
- **Complejidad del Pensamiento**: Profundidad de las preguntas
- **Riesgo de Deuda Cognitiva**: Patrones problemáticos
- **Tendencias de Mejora**: Progreso a lo largo del tiempo

### **Datos para Dashboard**
- Promedios de autonomía y reflexividad
- Distribución de riesgo cognitivo
- Tendencias temporales
- Recomendaciones personalizadas
- Impacto en aprendizaje

## 🎨 Archivos del Proyecto

- `manifest.json`: Configuración de la extensión
- `background.js`: Script de fondo, maneja análisis cognitivo
- `content.js`: Captura prompts y evalúa inactividad
- `popup.html`: Interfaz con métricas cognitivas
- `popup.js`: Lógica del popup y análisis avanzado
- `icon.svg`: Icono personalizado
- `backend-integration-example.js`: Ejemplo de integración con backend
- `vertex-ai-integration-example.js`: Ejemplo de integración con Vertex AI

## 🔍 Desarrollo

### **Agregar Nuevos Indicadores Cognitivos**
```javascript
// En content.js, función analyzePromptQuality()
const hasAcademicContext = /(investigación|estudio|análisis|teoría|método)/i.test(prompt);
if (hasAcademicContext) {
  quality.reflexivityScore += 1;
  quality.feedback.push('Excelente: Incluyes contexto académico.');
}
```

### **Personalizar Feedback Reflexivo**
```javascript
// En content.js, función showReflectiveNotification()
if (quality.autonomyScore < 2) {
  feedbackText += `
    <div style="color: #FFD700; font-weight: bold;">
      ⚠️ Alto riesgo de dependencia de IA
    </div>
  `;
}
```

## 🚨 Solución de Problemas

### **La extensión no evalúa automáticamente**
1. Verifica que estés en `gemini.google.com`
2. Asegúrate de que `autoAnalyze` esté habilitado
3. Espera 7 segundos después de dejar de escribir
4. Revisa la consola del navegador para errores

### **No aparecen métricas cognitivas**
1. Verifica que hayas capturado al menos un prompt
2. Recarga la extensión en `chrome://extensions/`
3. Abre y cierra el popup para actualizar datos

### **Evaluación con IA no funciona**
1. La función está simulada por ahora
2. Para usar Vertex AI real, sigue las instrucciones en `vertex-ai-integration-example.js`
3. Verifica la configuración de Google Cloud

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature
3. Implementa mejoras en análisis cognitivo
4. Prueba con diferentes tipos de prompts
5. Documenta nuevos criterios de evaluación
6. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 📞 Contacto

Para preguntas sobre análisis cognitivo o integración con Vertex AI, abre un issue en el repositorio.

---

**ExtMentor** - Fomentando el uso consciente de IA para un aprendizaje autónomo y reflexivo. 