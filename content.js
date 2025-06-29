// Este archivo se inyecta en la página activa.
const promptElement = document.querySelector('textarea, input'); // Ajusta el selector según el campo de texto

if (promptElement) {
  promptElement.addEventListener('input', () => {
    const prompt = promptElement.value;
    console.log("Prompt capturado en la página:", prompt);
  });
}

// Content script para capturar prompts de Gemini Chat con enfoque en deuda cognitiva
let capturedPrompts = [];
let isGemini = window.location.hostname.includes('gemini.google.com');
let inactivityTimer = null;
let currentPrompt = '';
let lastActivityTime = Date.now();
let userId = generateUserId();
let pusher = null;
let channel = null;

// Inicializar Pusher
function initializePusher() {
  try {
    // Configuración de Pusher desde config.js
    pusher = new Pusher(MENTORIA_CONFIG.PUSHER.KEY, {
      cluster: MENTORIA_CONFIG.PUSHER.CLUSTER
    });

    // Suscribirse al canal del usuario
    const userId = generateUserId();
    channel = pusher.subscribe(`user-${userId}`);

    // Escuchar eventos del backend
    channel.bind('prompt-feedback', function(data) {
      console.log('Feedback recibido:', data);
      showPoapMessage(data.feedback, 5000);
    });

    channel.bind('analysis-complete', function(data) {
      console.log('Análisis completado:', data);
      showPromptEvaluation(data.evaluation);
    });

    channel.bind('analysis-error', function(data) {
      console.log('Error en análisis:', data);
      showPoapMessage('Error en el análisis. Usando análisis local.', 3000);
    });

    console.log('✅ Pusher inicializado correctamente');
  } catch (error) {
    console.error('❌ Error inicializando Pusher:', error);
  }
}

// Generar ID único para el usuario
function generateUserId() {
  let userId = localStorage.getItem('mentoria_user_id');
  if (!userId) {
    userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('mentoria_user_id', userId);
  }
  return userId;
}

// Función para crear y mostrar la ventana emergente POAPS
function showPoapMessage(message, duration = 5000) {
  // Remover POAPS existente si hay uno
  const existingPoap = document.getElementById('mentoria-poap');
  if (existingPoap) {
    existingPoap.remove();
  }

  const poap = document.createElement('div');
  poap.id = 'mentoria-poap';
  poap.style.cssText = `
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 15px 25px;
    border-radius: 10px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    z-index: 10000;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    font-size: 14px;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 10px;
    animation: poapSlideIn 0.3s ease-out;
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
  `;

  // Agregar spinner
  const spinner = document.createElement('div');
  spinner.style.cssText = `
    width: 16px;
    height: 16px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top: 2px solid white;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  `;

  poap.appendChild(spinner);
  poap.appendChild(document.createTextNode(message));

  // Agregar estilos CSS para animaciones
  const style = document.createElement('style');
  style.textContent = `
    @keyframes poapSlideIn {
      from {
        opacity: 0;
        transform: translateX(-50%) translateY(-20px);
      }
      to {
        opacity: 1;
        transform: translateX(-50%) translateY(0);
      }
    }
    
    @keyframes poapSlideOut {
      from {
        opacity: 1;
        transform: translateX(-50%) translateY(0);
      }
      to {
        opacity: 0;
        transform: translateX(-50%) translateY(-20px);
      }
    }
    
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);

  document.body.appendChild(poap);

  // Auto-remover después del tiempo especificado
  setTimeout(() => {
    if (poap.parentElement) {
      poap.style.animation = 'poapSlideOut 0.3s ease-in';
      setTimeout(() => {
        if (poap.parentElement) {
          poap.remove();
        }
      }, 300);
    }
  }, duration);

  return poap;
}

// Función para actualizar el mensaje del POAPS
function updatePoapMessage(message) {
  const poap = document.getElementById('mentoria-poap');
  if (poap) {
    const textNode = poap.childNodes[1];
    if (textNode && textNode.nodeType === Node.TEXT_NODE) {
      textNode.textContent = message;
    }
  }
}

// Función para cerrar el POAPS manualmente
function hidePoapMessage() {
  const poap = document.getElementById('mentoria-poap');
  if (poap) {
    poap.style.animation = 'poapSlideOut 0.3s ease-in';
    setTimeout(() => {
      if (poap.parentElement) {
        poap.remove();
      }
    }, 300);
  }
}

// Función para enviar prompt al servidor
function sendPromptToServer(prompt, analysisData) {
  const message = {
    user_id: userId,
    prompt: prompt,
    timestamp: new Date().toISOString(),
    local_analysis: analysisData,
    user_agent: navigator.userAgent,
    language: navigator.language,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    url: window.location.href,
    session_data: {
      session_start: sessionStorage.getItem('mentoria_session_start') || new Date().toISOString(),
      typing_speed: calculateTypingSpeed(),
      focus_time: calculateFocusTime(),
      inactivity_duration: Date.now() - lastActivityTime
    }
  };

  // Enviar al backend local usando configuración
  fetch(`${MENTORIA_CONFIG.BACKEND.URL}${MENTORIA_CONFIG.BACKEND.ENDPOINTS.PROMPT_ANALYZE}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(message)
  })
  .then(response => response.json())
  .then(data => {
    console.log('📤 Prompt enviado al servidor:', data);
    if (data.status === 'processing') {
      showPoapMessage('Procesando con IA avanzada...', 3000);
    }
  })
  .catch(error => {
    console.error('❌ Error enviando prompt al servidor:', error);
    // Fallback: usar análisis local
    showPoapMessage('Usando análisis local (servidor no disponible)', 3000);
  });
}

// Función para manejar feedback del prompt
function handlePromptFeedback(data) {
  const { feedback, color, score, cognitive_risk } = data;
  
  // Actualizar POAPS con feedback
  updatePoapMessage(`💡 ${feedback}`);
  
  // Mostrar evaluación visual
  showPromptEvaluation(data);
}

// Función para mostrar evaluación visual del prompt
function showPromptEvaluation(evaluation) {
  const { feedback, color, score, cognitive_risk } = evaluation;
  
  // Remover evaluación existente si hay una
  const existingEval = document.getElementById('mentoria-evaluation');
  if (existingEval) {
    existingEval.remove();
  }
  
  // Crear elemento de evaluación visual
  const evalElement = document.createElement('div');
  evalElement.id = 'mentoria-evaluation';
  evalElement.style.cssText = `
    position: fixed;
    top: 80px;
    right: 20px;
    background: ${getColorBackground(color)};
    color: white;
    padding: 20px;
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    z-index: 9999;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    max-width: 350px;
    animation: evaluationSlideIn 0.4s ease-out;
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
  `;

  const riskIcon = cognitive_risk === 'ALTO' ? '⚠️' : cognitive_risk === 'MEDIO' ? '⚡' : '✅';
  
  evalElement.innerHTML = `
    <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 15px;">
      <div style="font-size: 24px;">${riskIcon}</div>
      <div>
        <div style="font-weight: bold; font-size: 16px;">Puntuación: ${score}/5</div>
        <div style="font-size: 12px; opacity: 0.8;">Riesgo: ${cognitive_risk}</div>
      </div>
    </div>
    <div style="font-size: 14px; line-height: 1.5; margin-bottom: 15px;">
      ${feedback}
    </div>
    <div style="display: flex; justify-content: space-between; align-items: center;">
      <div style="font-size: 12px; opacity: 0.8;">
        Color: ${color.toUpperCase()}
      </div>
      <button onclick="this.parentElement.parentElement.remove()" style="
        background: rgba(255, 255, 255, 0.2);
        border: none;
        color: white;
        padding: 8px 12px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 12px;
      ">Cerrar</button>
    </div>
  `;

  // Agregar estilos CSS para animación
  const style = document.createElement('style');
  style.textContent = `
    @keyframes evaluationSlideIn {
      from {
        opacity: 0;
        transform: translateX(100%);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }
  `;
  document.head.appendChild(style);

  document.body.appendChild(evalElement);

  // Auto-remover después de 10 segundos
  setTimeout(() => {
    if (evalElement.parentElement) {
      evalElement.style.animation = 'evaluationSlideOut 0.4s ease-in';
      setTimeout(() => {
        if (evalElement.parentElement) {
          evalElement.remove();
        }
      }, 400);
    }
  }, 10000);
}

// Función para obtener color de fondo basado en evaluación
function getColorBackground(color) {
  switch (color.toLowerCase()) {
    case 'green':
      return 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)';
    case 'yellow':
      return 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)';
    case 'red':
      return 'linear-gradient(135deg, #F44336 0%, #D32F2F 100%)';
    default:
      return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
  }
}

// Funciones auxiliares para calcular métricas del usuario
function calculateTypingSpeed() {
  // Implementar cálculo de velocidad de escritura
  return Math.random() * 100 + 50; // Simulado por ahora
}

function calculateFocusTime() {
  // Implementar cálculo de tiempo de enfoque
  return Date.now() - lastActivityTime;
}

// Función para manejar la inactividad (7 segundos)
function handleInactivity() {
  const currentPromptText = captureCurrentPrompt();
  
  if (currentPromptText && currentPromptText !== currentPrompt) {
    currentPrompt = currentPromptText;
    
    // Mostrar POAPS de análisis en progreso
    showPoapMessage('🔍 Analizando prompt automáticamente...');
    
    // Mostrar indicador de análisis en el popup
    chrome.runtime.sendMessage({
      action: 'showAnalysisIndicator',
      text: 'Analizando prompt automáticamente...'
    });
    
    // Evaluación local inmediata
    const localQuality = analyzePromptQuality(currentPrompt);
    
    // Actualizar POAPS con progreso
    updatePoapMessage('🤖 Enviando al servidor...');
    
    // Actualizar texto del indicador
    chrome.runtime.sendMessage({
      action: 'updateAnalysisText',
      text: 'Enviando al servidor...'
    });
    
    // Enviar al servidor via API REST
    sendPromptToServer(currentPrompt, localQuality);
    
    // Guardar para envío al backend
    capturedPrompts.push({
      ...localQuality,
      timestamp: new Date().toISOString(),
      inactivityDuration: 7000,
      url: window.location.href
    });
    
    // Enviar al background script
    chrome.runtime.sendMessage({
      action: 'promptCaptured',
      data: {
        ...localQuality,
        timestamp: new Date().toISOString(),
        inactivityDuration: 7000,
        url: window.location.href
      }
    });
  }
}

// Inicializar Pusher al cargar la página
document.addEventListener('DOMContentLoaded', () => {
  // Cargar Pusher desde CDN si no está disponible
  if (typeof Pusher === 'undefined') {
    const script = document.createElement('script');
    script.src = 'https://js.pusher.com/8.2.0/pusher.min.js';
    script.onload = () => {
      initializePusher();
    };
    document.head.appendChild(script);
  } else {
    initializePusher();
  }
  
  // Inicializar sesión
  if (!sessionStorage.getItem('mentoria_session_start')) {
    sessionStorage.setItem('mentoria_session_start', new Date().toISOString());
  }
});

// Función para analizar la calidad del prompt con enfoque en deuda cognitiva
function analyzePromptQuality(prompt) {
  const words = prompt.trim().split(/\s+/).length;
  const characters = prompt.trim().length;
  
  let quality = {
    score: 0,
    category: '',
    feedback: [],
    cognitiveLevel: '',
    reflexivityScore: 0,
    autonomyScore: 0
  };
  
  // Análisis de longitud mejorado - sin restricciones problemáticas
  if (words < 3) {
    quality.category = 'MUY CORTO';
    quality.score = 1;
    quality.cognitiveLevel = 'BAJO';
    quality.feedback.push('El prompt es muy corto. Considera agregar más contexto para obtener mejores respuestas.');
  } else if (words < 10) {
    quality.category = 'CORTO';
    quality.score = 2;
    quality.cognitiveLevel = 'BAJO-MEDIO';
    quality.feedback.push('El prompt podría ser más específico. Reflexiona sobre qué aspectos específicos del tema te gustaría explorar más profundamente.');
  } else if (words < 30) {
    quality.category = 'MEDIO';
    quality.score = 3;
    quality.cognitiveLevel = 'MEDIO';
    quality.feedback.push('Longitud adecuada. Considera agregar más contexto personal o conexiones con tu aprendizaje previo.');
  } else if (words < 100) {
    quality.category = 'LARGO';
    quality.score = 4;
    quality.cognitiveLevel = 'ALTO';
    quality.feedback.push('Prompt detallado. Buen trabajo al proporcionar contexto específico.');
  } else {
    // Prompts muy largos también son válidos
    quality.category = 'MUY LARGO';
    quality.score = 4;
    quality.cognitiveLevel = 'ALTO';
    quality.feedback.push('Prompt muy detallado. Excelente nivel de especificidad y contexto.');
  }
  
  // Análisis de complejidad cognitiva
  const hasQuestion = /\?/.test(prompt);
  const hasContext = /(explica|describe|analiza|compara|crea|genera|evalúa|investiga|explora|examina|revisa|considera)/i.test(prompt);
  const hasSpecificity = /(específicamente|en detalle|con ejemplos|incluye|particularmente|específico|detalladamente|concretamente)/i.test(prompt);
  const hasPersonalContext = /(mi|yo|nuestra|nuestro|clase|profesor|lectura|investigación|experiencia|estudio|aprendizaje|curso)/i.test(prompt);
  const hasComplexThinking = /(por qué|cómo|cuál|cuáles|relaciona|conecta|implica|significa|impacta|influye|afecta|determina)/i.test(prompt);
  
  // Evaluación de reflexividad
  if (hasPersonalContext) {
    quality.reflexivityScore += 2;
    quality.feedback.push('Excelente: Incluyes contexto personal. Esto demuestra reflexión sobre tu aprendizaje.');
  }
  
  if (hasComplexThinking) {
    quality.reflexivityScore += 2;
    quality.feedback.push('Buen uso de preguntas complejas que requieren pensamiento crítico.');
  }
  
  if (!hasQuestion && !hasContext) {
    quality.score = Math.max(1, quality.score - 1);
    quality.autonomyScore -= 1;
    quality.feedback.push('Falta contexto o instrucción clara. ¿Qué es lo que realmente quieres aprender? Piensa en cómo podrías integrar más de lo que aprendiste de tus lecturas y discusiones de clase.');
  }
  
  if (hasSpecificity) {
    quality.score = Math.min(5, quality.score + 1);
    quality.autonomyScore += 1;
    quality.feedback.push('Buen uso de especificidad. Esto muestra que has pensado en los detalles importantes.');
  }
  
  // Análisis de vaguedad y dependencia de IA
  const vagueWords = /\b(cosa|algo|cosas|algunos|varios|muchos|pocos|bueno|malo|todo|nada)\b/gi;
  const vagueMatches = prompt.match(vagueWords);
  if (vagueMatches && vagueMatches.length > 3) {
    quality.score = Math.max(1, quality.score - 1);
    quality.autonomyScore -= 1;
    quality.feedback.push('Demasiadas palabras vagas. ¿Estás evitando el esfuerzo de ser específico? Sé más preciso para obtener respuestas más útiles.');
  }
  
  // Detección de prompts copiados o muy genéricos
  const isGeneric = /^(qué es|qué son|habla de|explica|describe)$/i.test(prompt.trim());
  if (isGeneric) {
    quality.score = Math.max(1, quality.score - 1);
    quality.autonomyScore -= 2;
    quality.feedback.push('Este prompt es muy genérico. ¿Por qué no te enfocas en un aspecto específico que te gustaría explorar? ¿Cómo podrías integrar tus ideas o debates recientes?');
  }
  
  // Evaluación final de autonomía cognitiva
  quality.autonomyScore = Math.max(0, Math.min(5, quality.autonomyScore + quality.reflexivityScore / 2));
  
  return quality;
}

// Función para simular evaluación con Vertex AI (datos falsos por ahora)
async function evaluateWithVertexAI(prompt) {
  // Simulación de llamada a Vertex AI
  console.log('Simulando evaluación con Vertex AI para:', prompt);
  
  // Simular delay de red
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Datos simulados de Vertex AI
  const vertexResponse = {
    cognitiveComplexity: Math.random() * 5 + 1,
    reflexivityLevel: Math.random() * 5 + 1,
    autonomyScore: Math.random() * 5 + 1,
    suggestions: [
      'Considera agregar más contexto personal a tu pregunta.',
      '¿Podrías relacionar esto con conceptos que ya has aprendido?',
      'Intenta ser más específico sobre qué aspecto quieres explorar.',
      'Reflexiona sobre cómo esta pregunta se conecta con tu aprendizaje previo.'
    ],
    cognitiveRisk: Math.random() > 0.7 ? 'ALTO' : 'BAJO',
    recommendation: 'Este prompt podría beneficiarse de más reflexión personal y contexto específico.'
  };
  
  return vertexResponse;
}

// Función para capturar el prompt actual
function captureCurrentPrompt() {
  let promptText = '';
  
  if (isGemini) {
    // Selectores específicos para Gemini Chat
    const textarea = document.querySelector('textarea[placeholder*="Message"], textarea[aria-label*="Message"], .ql-editor');
    if (textarea) {
      promptText = textarea.textContent || textarea.value || '';
    }
  } else {
    // Selectores para ChatGPT
    const textarea = document.querySelector('textarea[placeholder*="Message"], textarea[data-id="root"]');
    if (textarea) {
      promptText = textarea.value || '';
    }
  }
  
  return promptText.trim();
}

// Función para mostrar notificación reflexiva
function showReflectiveNotification(analysis) {
  const quality = analysis.quality || analysis;
  const vertexAI = analysis.vertexAI;
  
  const color = quality.score >= 4 ? '#EAA64D' : quality.score >= 3 ? '#C78A3B' : '#A16D28';
  
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${color};
    color: white;
    padding: 20px;
    border-radius: 12px;
    z-index: 10000;
    font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    font-size: 14px;
    max-width: 350px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.3);
    border-left: 4px solid rgba(255,255,255,0.3);
  `;
  
  let feedbackText = '';
  if (vertexAI && vertexAI.cognitiveRisk === 'ALTO') {
    feedbackText = `
      <div style="margin-bottom: 10px; font-weight: bold; color: #FFD700;">
        ⚠️ Riesgo de Deuda Cognitiva Detectado
      </div>
    `;
  }
  
  feedbackText += `
    <div style="margin-bottom: 8px;">
      <strong>Reflexión Cognitiva:</strong> ${quality.cognitiveLevel}
    </div>
    <div style="margin-bottom: 8px;">
      <strong>Autonomía:</strong> ${quality.autonomyScore.toFixed(1)}/5
    </div>
    <div style="margin-bottom: 12px; font-size: 12px; opacity: 0.9;">
      ${quality.feedback.slice(0, 2).join('<br>')}
    </div>
    <div style="font-size: 12px; font-style: italic; opacity: 0.8;">
      💡 Recuerda: El mejor aprendizaje viene de la reflexión personal
    </div>
  `;
  
  notification.innerHTML = feedbackText;
  
  document.body.appendChild(notification);
  
  // Remover después de 8 segundos
  setTimeout(() => {
    if (notification.parentNode) {
      notification.parentNode.removeChild(notification);
    }
  }, 8000);
}

// Función para detectar cuando se envía un prompt
function detectPromptSubmission() {
  if (isGemini) {
    // Observar cambios en el DOM para detectar envío
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          // Buscar si se agregó un nuevo mensaje del usuario
          const userMessages = document.querySelectorAll('[data-message-author-role="user"]');
          if (userMessages.length > 0) {
            const lastUserMessage = userMessages[userMessages.length - 1];
            const promptText = lastUserMessage.textContent || '';
            
            if (promptText.trim()) {
              const quality = analyzePromptQuality(promptText);
              const promptData = {
                text: promptText,
                quality: quality,
                timestamp: new Date().toISOString(),
                url: window.location.href,
                submissionType: 'manual'
              };
              
              capturedPrompts.push(promptData);
              
              // Enviar al background script
              chrome.runtime.sendMessage({
                action: 'promptCaptured',
                data: promptData
              });
              
              // Mostrar notificación visual
              showQualityNotification(quality);
            }
          }
        }
      });
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
}

// Función para mostrar notificación de calidad (versión original)
function showQualityNotification(quality) {
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${quality.score >= 4 ? '#EAA64D' : quality.score >= 3 ? '#C78A3B' : '#A16D28'};
    color: white;
    padding: 15px;
    border-radius: 8px;
    z-index: 10000;
    font-family: 'Inter', Arial, sans-serif;
    font-size: 14px;
    max-width: 300px;
    box-shadow: 0 4px 8px rgba(0,0,0,0.2);
  `;
  
  notification.innerHTML = `
    <strong>Calidad del Prompt: ${quality.category}</strong><br>
    Puntuación: ${quality.score}/5<br>
    ${quality.feedback.join('<br>')}
  `;
  
  document.body.appendChild(notification);
  
  // Remover después de 5 segundos
  setTimeout(() => {
    if (notification.parentNode) {
      notification.parentNode.removeChild(notification);
    }
  }, 5000);
}

// Función para monitorear el campo de texto con inactividad
function monitorTextInput() {
  let currentPrompt = '';
  
  const checkForTextarea = () => {
    let textarea = null;
    
    if (isGemini) {
      textarea = document.querySelector('textarea[placeholder*="Message"], textarea[aria-label*="Message"], .ql-editor');
    } else {
      textarea = document.querySelector('textarea[placeholder*="Message"], textarea[data-id="root"]');
    }
    
    if (textarea && !textarea.dataset.monitored) {
      textarea.dataset.monitored = 'true';
      
      // Monitorear cambios en tiempo real
      textarea.addEventListener('input', (e) => {
        currentPrompt = e.target.value || e.target.textContent || '';
        lastActivityTime = Date.now();
        
        // Resetear timer de inactividad
        if (inactivityTimer) {
          clearTimeout(inactivityTimer);
        }
        
        // Iniciar nuevo timer de 7 segundos
        inactivityTimer = setTimeout(handleInactivity, 7000);
        
        // Analizar calidad en tiempo real
        if (currentPrompt.length > 10) {
          const quality = analyzePromptQuality(currentPrompt);
          
          // Enviar análisis al popup si está abierto
          chrome.runtime.sendMessage({
            action: 'promptAnalysis',
            data: {
              text: currentPrompt,
              quality: quality
            }
          });
        }
      });
      
      // Detectar envío con Enter
      textarea.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          const promptText = e.target.value || e.target.textContent || '';
          if (promptText.trim()) {
            // Cancelar timer de inactividad
            if (inactivityTimer) {
              clearTimeout(inactivityTimer);
            }
            
            const quality = analyzePromptQuality(promptText);
            const promptData = {
              text: promptText,
              quality: quality,
              timestamp: new Date().toISOString(),
              url: window.location.href,
              submissionType: 'enter'
            };
            
            capturedPrompts.push(promptData);
            
            chrome.runtime.sendMessage({
              action: 'promptCaptured',
              data: promptData
            });
            
            showQualityNotification(quality);
          }
        }
      });
      
      // Detectar cuando el usuario deja de escribir
      textarea.addEventListener('blur', () => {
        // Iniciar timer de inactividad si hay texto
        if (currentPrompt.trim()) {
          inactivityTimer = setTimeout(handleInactivity, 7000);
        }
      });
    }
  };
  
  // Verificar periódicamente por nuevos campos de texto
  setInterval(checkForTextarea, 1000);
  checkForTextarea();
}

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    monitorTextInput();
    detectPromptSubmission();
    initializePusher(); // Inicializar Pusher
  });
} else {
  monitorTextInput();
  detectPromptSubmission();
  initializePusher(); // Inicializar Pusher
}

// Escuchar mensajes del popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'getCurrentPrompt') {
    const currentPrompt = captureCurrentPrompt();
    sendResponse({ prompt: currentPrompt });
  } else if (message.action === 'getCapturedPrompts') {
    sendResponse({ prompts: capturedPrompts });
  } else if (message.action === 'evaluateWithVertexAI') {
    evaluateWithVertexAI(message.prompt).then(result => {
      sendResponse({ result: result });
    });
    return true; // Indica respuesta asíncrona
  }
});

console.log('ExtMentor: Content script cargado para', isGemini ? 'Gemini Chat' : 'ChatGPT');
console.log('Funcionalidades activas: Evaluación automática (7s), Feedback reflexivo, Análisis de deuda cognitiva');
