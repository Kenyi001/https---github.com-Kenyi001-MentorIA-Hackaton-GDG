// popup.js - ExtMentor con enfoque en deuda cognitiva

let capturedPrompts = [];
let currentPrompt = '';

// Inicializar cuando se carga el popup
document.addEventListener('DOMContentLoaded', () => {
  loadCapturedPrompts();
  setupEventListeners();
  checkCurrentPrompt();
  setupAnalysisIndicator();
  updatePlanStatus();
});

function setupEventListeners() {
  document.getElementById('analyzeCurrent').addEventListener('click', analyzeCurrentPrompt);
  document.getElementById('evaluateVertexAI').addEventListener('click', evaluateWithVertexAI);
  document.getElementById('sendToBackend').addEventListener('click', sendToBackend);
  document.getElementById('clearPrompts').addEventListener('click', clearPrompts);
  document.getElementById('dashboardBtn').addEventListener('click', openDashboard);
  document.getElementById('planStatusBtn').addEventListener('click', showPlanModal);
  document.getElementById('closePlanModal').addEventListener('click', hidePlanModal);
  document.getElementById('manageSubscription').addEventListener('click', manageSubscription);
  
  // Event listeners para los botones de cambio de plan
  document.addEventListener('click', (e) => {
    if (e.target.closest('#freePlan .plan-btn')) {
      handlePlanChange('free');
    } else if (e.target.closest('#proPlan .plan-btn')) {
      handlePlanChange('pro');
    }
  });
}

// Función para configurar el indicador de análisis automático
function setupAnalysisIndicator() {
  const analysisIndicator = document.getElementById('analysisIndicator');
  const analysisText = document.getElementById('analysisText');
  
  // Escuchar mensajes del content script sobre análisis automático
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'showAnalysisIndicator') {
      showAnalysisIndicator(message.text || 'Analizando prompt...');
    } else if (message.action === 'hideAnalysisIndicator') {
      hideAnalysisIndicator();
    } else if (message.action === 'updateAnalysisText') {
      updateAnalysisText(message.text);
    }
  });
}

function showAnalysisIndicator(text = 'Analizando prompt...') {
  const analysisIndicator = document.getElementById('analysisIndicator');
  const analysisText = document.getElementById('analysisText');
  
  analysisText.textContent = text;
  analysisIndicator.classList.remove('hidden');
  analysisIndicator.classList.remove('analysis-complete');
}

function hideAnalysisIndicator() {
  const analysisIndicator = document.getElementById('analysisIndicator');
  analysisIndicator.classList.add('hidden');
}

function updateAnalysisText(text) {
  const analysisText = document.getElementById('analysisText');
  analysisText.textContent = text;
}

function showAnalysisComplete() {
  const analysisIndicator = document.getElementById('analysisIndicator');
  const analysisText = document.getElementById('analysisText');
  
  analysisText.textContent = 'Análisis completado ✓';
  analysisIndicator.classList.add('analysis-complete');
  
  // Ocultar después de 3 segundos
  setTimeout(() => {
    hideAnalysisIndicator();
  }, 3000);
}

// Función para abrir el dashboard
function openDashboard() {
  // Por ahora, abrir una página de "próximamente"
  const dashboardUrl = 'https://mentoria-dashboard.vercel.app';
  
  // Intentar abrir el dashboard
  chrome.tabs.create({ url: dashboardUrl }, (tab) => {
    // Si falla, mostrar mensaje de próximamente
    chrome.tabs.onUpdated.addListener(function listener(tabId, changeInfo, tab) {
      if (tabId === tab.id && changeInfo.status === 'complete') {
        chrome.tabs.onUpdated.removeListener(listener);
        
        // Verificar si la página cargó correctamente
        chrome.tabs.executeScript(tab.id, {
          code: 'document.body.innerHTML.includes("404") || document.body.innerHTML.includes("not found")'
        }, (result) => {
          if (result && result[0]) {
            // Si hay error 404, mostrar página de próximamente
            chrome.tabs.update(tab.id, {
              url: 'data:text/html;charset=utf-8,' + encodeURIComponent(`
                <!DOCTYPE html>
                <html lang="es">
                <head>
                  <meta charset="UTF-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                  <title>MentorIA Dashboard - Próximamente</title>
                  <style>
                    * {
                      margin: 0;
                      padding: 0;
                      box-sizing: border-box;
                    }
                    
                    body {
                      font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                      background: linear-gradient(135deg, #0D5EA6 0%, #EAA64D 100%);
                      min-height: 100vh;
                      display: flex;
                      align-items: center;
                      justify-content: center;
                      color: white;
                    }
                    
                    .container {
                      text-align: center;
                      max-width: 600px;
                      padding: 40px;
                    }
                    
                    .logo {
                      font-size: 48px;
                      margin-bottom: 20px;
                    }
                    
                    h1 {
                      font-family: 'Poppins', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                      font-size: 36px;
                      margin-bottom: 20px;
                      color: white;
                      font-weight: bold;
                    }
                    
                    .subtitle {
                      font-size: 18px;
                      margin-bottom: 30px;
                      opacity: 0.9;
                    }
                    
                    .features {
                      background: rgba(255, 255, 255, 0.1);
                      padding: 30px;
                      border-radius: 15px;
                      margin: 30px 0;
                      backdrop-filter: blur(10px);
                    }
                    
                    .features h3 {
                      margin-bottom: 20px;
                      font-size: 24px;
                    }
                    
                    .feature-list {
                      list-style: none;
                      text-align: left;
                    }
                    
                    .feature-list li {
                      margin: 10px 0;
                      padding: 10px;
                      background: rgba(255, 255, 255, 0.1);
                      border-radius: 8px;
                      border-left: 4px solid #EAA64D;
                    }
                    
                    .coming-soon {
                      background: rgba(255, 255, 255, 0.2);
                      padding: 20px;
                      border-radius: 10px;
                      margin-top: 30px;
                    }
                    
                    .back-btn {
                      background: rgba(255, 255, 255, 0.2);
                      color: white;
                      border: 2px solid white;
                      padding: 12px 24px;
                      border-radius: 8px;
                      cursor: pointer;
                      font-size: 16px;
                      margin-top: 20px;
                      transition: all 0.3s ease;
                    }
                    
                    .back-btn:hover {
                      background: white;
                      color: #0D5EA6;
                    }
                  </style>
                </head>
                <body>
                  <div class="container">
                    <div class="logo">🚀</div>
                    <h1>MentorIA Dashboard</h1>
                    <p class="subtitle">Tu centro de control para el análisis cognitivo de prompts</p>
                    
                    <div class="features">
                      <h3>✨ Funcionalidades Próximas</h3>
                      <ul class="feature-list">
                        <li>📊 <strong>Analytics Avanzados:</strong> Métricas detalladas de tu uso de IA</li>
                        <li>🎯 <strong>Recomendaciones Personalizadas:</strong> Sugerencias basadas en tu historial</li>
                        <li>📈 <strong>Progreso Cognitivo:</strong> Seguimiento de tu desarrollo intelectual</li>
                        <li>🔍 <strong>Análisis de Patrones:</strong> Identificación de tendencias en tus prompts</li>
                        <li>🎨 <strong>Visualizaciones Interactivas:</strong> Gráficos y reportes detallados</li>
                        <li>📱 <strong>Dashboard Móvil:</strong> Acceso desde cualquier dispositivo</li>
                      </ul>
                    </div>
                    
                    <div class="coming-soon">
                      <h3>🚧 En Desarrollo</h3>
                      <p>Nuestro equipo está trabajando arduamente para traerte estas funcionalidades. ¡Mantente atento a las actualizaciones!</p>
                    </div>
                    
                    <button class="back-btn" onclick="window.close()">← Volver a MentorIA</button>
                  </div>
                </body>
                </html>
              `)
            });
          }
        });
      }
    });
  });
}

function loadCapturedPrompts() {
  chrome.runtime.sendMessage({ action: 'getCapturedPrompts' }, (response) => {
    if (response && response.prompts) {
      capturedPrompts = response.prompts;
      updateStats();
      updateCognitiveMetrics();
      renderPromptsList();
    }
  });
}

function checkCurrentPrompt() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0] && (tabs[0].url.includes('gemini.google.com') || tabs[0].url.includes('chat.openai.com'))) {
      chrome.tabs.sendMessage(tabs[0].id, { action: 'getCurrentPrompt' }, (response) => {
        if (response && response.prompt) {
          currentPrompt = response.prompt;
          showCurrentPrompt();
        }
      });
    }
  });
}

function showCurrentPrompt() {
  const promptsList = document.getElementById('promptsList');
  
  if (currentPrompt.trim()) {
    const currentPromptDiv = document.createElement('div');
    currentPromptDiv.className = 'current-prompt';
    currentPromptDiv.innerHTML = `
      <h3>Prompt Actual:</h3>
      <div class="prompt-text">${currentPrompt.substring(0, 100)}${currentPrompt.length > 100 ? '...' : ''}</div>
    `;
    
    // Insertar al principio de la lista
    promptsList.insertBefore(currentPromptDiv, promptsList.firstChild);
  }
}

function analyzeCurrentPrompt() {
  if (!currentPrompt.trim()) {
    alert('No hay un prompt actual para analizar. Ve a Gemini Chat y escribe algo.');
    return;
  }
  
  // Analizar el prompt actual
  const quality = analyzePromptQuality(currentPrompt);
  const promptData = {
    text: currentPrompt,
    quality: quality,
    timestamp: new Date().toISOString(),
    url: chrome.tabs.query({ active: true, currentWindow: true })[0]?.url || '',
    submissionType: 'manual'
  };
  
  // Agregar a la lista
  capturedPrompts.unshift(promptData);
  
  // Guardar en el background
  chrome.runtime.sendMessage({
    action: 'promptCaptured',
    data: promptData
  });
  
  // Actualizar la interfaz
  updateStats();
  updateCognitiveMetrics();
  renderPromptsList();
  
  // Mostrar resultado
  showAnalysisResult(quality);
}

async function evaluateWithVertexAI() {
  if (!currentPrompt.trim()) {
    alert('No hay un prompt actual para evaluar con IA. Ve a Gemini Chat y escribe algo.');
    return;
  }
  
  // Mostrar loading
  const button = document.getElementById('evaluateVertexAI');
  const originalText = button.textContent;
  button.textContent = 'Evaluando...';
  button.disabled = true;
  
  try {
    // Llamar a la evaluación con Vertex AI (simulada)
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { 
        action: 'evaluateWithVertexAI', 
        prompt: currentPrompt 
      }, (response) => {
        if (response && response.result) {
          showVertexAIResult(response.result);
        }
        button.textContent = originalText;
        button.disabled = false;
      });
    });
  } catch (error) {
    console.error('Error evaluando con Vertex AI:', error);
    button.textContent = originalText;
    button.disabled = false;
  }
}

function showVertexAIResult(vertexResult) {
  const resultDiv = document.createElement('div');
  resultDiv.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: white;
    padding: 25px;
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.3);
    z-index: 1000;
    max-width: 400px;
    text-align: left;
    font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  `;
  
  const riskColor = vertexResult.cognitiveRisk === 'ALTO' ? '#A16D28' : '#EAA64D';
  
  resultDiv.innerHTML = `
    <h3 style="color: #0D5EA6; margin-bottom: 15px; text-align: center;">
      🤖 Evaluación con IA
    </h3>
    
    <div style="margin-bottom: 15px;">
      <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
        <span style="font-weight: bold;">Complejidad Cognitiva:</span>
        <span style="color: #0D5EA6;">${vertexResult.cognitiveComplexity.toFixed(1)}/5</span>
      </div>
      <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
        <span style="font-weight: bold;">Nivel de Reflexividad:</span>
        <span style="color: #0D5EA6;">${vertexResult.reflexivityLevel.toFixed(1)}/5</span>
      </div>
      <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
        <span style="font-weight: bold;">Puntuación de Autonomía:</span>
        <span style="color: #0D5EA6;">${vertexResult.autonomyScore.toFixed(1)}/5</span>
      </div>
      <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
        <span style="font-weight: bold;">Riesgo Cognitivo:</span>
        <span style="color: ${riskColor}; font-weight: bold;">${vertexResult.cognitiveRisk}</span>
      </div>
    </div>
    
    <div style="background: #f8f9fa; padding: 12px; border-radius: 8px; margin-bottom: 15px;">
      <strong style="color: #0D5EA6;">Recomendación:</strong><br>
      ${vertexResult.recommendation}
    </div>
    
    <div style="margin-bottom: 15px;">
      <strong style="color: #0D5EA6;">Sugerencias:</strong>
      <ul style="margin-top: 8px; padding-left: 20px; font-size: 13px;">
        ${vertexResult.suggestions.map(s => `<li>${s}</li>`).join('')}
      </ul>
    </div>
    
    <button onclick="this.parentElement.remove()" style="
      background: #EAA64D;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 6px;
      cursor: pointer;
      width: 100%;
      font-size: 14px;
      transition: background-color 0.3s ease;
    ">Cerrar</button>
  `;
  
  document.body.appendChild(resultDiv);
  
  // Auto-remover después de 10 segundos
  setTimeout(() => {
    if (resultDiv.parentElement) {
      resultDiv.remove();
    }
  }, 10000);
}

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

function showAnalysisResult(quality) {
  const color = quality.score >= 4 ? '#EAA64D' : quality.score >= 3 ? '#C78A3B' : '#A16D28';
  
  const resultDiv = document.createElement('div');
  resultDiv.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.3);
    z-index: 1000;
    max-width: 300px;
    text-align: center;
  `;
  
  resultDiv.innerHTML = `
    <h3 style="color: ${color}; margin-bottom: 10px;">Calidad: ${quality.category}</h3>
    <div style="font-size: 24px; font-weight: bold; color: ${color}; margin-bottom: 15px;">
      ${quality.score}/5
    </div>
    <div style="margin-bottom: 10px;">
      <strong>Reflexividad:</strong> ${quality.reflexivityScore}/5<br>
      <strong>Autonomía:</strong> ${quality.autonomyScore.toFixed(1)}/5
    </div>
    <div style="font-size: 12px; color: #666; margin-bottom: 15px;">
      ${quality.feedback.slice(0, 2).join('<br>')}
    </div>
    <button onclick="this.parentElement.remove()" style="
      background: #EAA64D;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
      transition: background-color 0.3s ease;
    ">Cerrar</button>
  `;
  
  document.body.appendChild(resultDiv);
  
  // Auto-remover después de 5 segundos
  setTimeout(() => {
    if (resultDiv.parentElement) {
      resultDiv.remove();
    }
  }, 5000);
}

function updateStats() {
  const totalPrompts = capturedPrompts.length;
  const avgScore = totalPrompts > 0 
    ? (capturedPrompts.reduce((sum, p) => sum + (p.quality?.score || p.score || 0), 0) / totalPrompts).toFixed(1)
    : '0';
  const avgAutonomy = totalPrompts > 0 
    ? (capturedPrompts.reduce((sum, p) => sum + (p.quality?.autonomyScore || p.autonomyScore || 0), 0) / totalPrompts).toFixed(1)
    : '0';
  const avgReflexivity = totalPrompts > 0 
    ? (capturedPrompts.reduce((sum, p) => sum + (p.quality?.reflexivityScore || p.reflexivityScore || 0), 0) / totalPrompts).toFixed(1)
    : '0';
  
  document.getElementById('totalPrompts').textContent = totalPrompts;
  document.getElementById('avgScore').textContent = avgScore;
  document.getElementById('avgAutonomy').textContent = avgAutonomy;
  document.getElementById('avgReflexivity').textContent = avgReflexivity;
}

function updateCognitiveMetrics() {
  if (capturedPrompts.length === 0) return;
  
  const latestPrompt = capturedPrompts[0];
  const quality = latestPrompt.quality || latestPrompt;
  
  const autonomyScore = quality.autonomyScore || 0;
  const reflexivityScore = quality.reflexivityScore || 0;
  const cognitiveScore = quality.score || 0;
  
  // Actualizar valores
  document.getElementById('autonomyScore').textContent = `${autonomyScore.toFixed(1)}/5`;
  document.getElementById('reflexivityScore').textContent = `${reflexivityScore.toFixed(1)}/5`;
  document.getElementById('cognitiveScore').textContent = `${cognitiveScore}/5`;
  
  // Actualizar barras
  document.getElementById('autonomyBar').style.width = `${(autonomyScore / 5) * 100}%`;
  document.getElementById('reflexivityBar').style.width = `${(reflexivityScore / 5) * 100}%`;
  document.getElementById('cognitiveBar').style.width = `${(cognitiveScore / 5) * 100}%`;
}

function renderPromptsList() {
  const promptsList = document.getElementById('promptsList');
  
  if (capturedPrompts.length === 0) {
    promptsList.innerHTML = `
      <div class="empty-state">
        <div style="font-size: 48px; margin-bottom: 15px;">📝</div>
        <h3>No hay prompts capturados</h3>
        <p>Ve a Gemini Chat y escribe algunos prompts para analizarlos.</p>
      </div>
    `;
    return;
  }
  
  let html = '';
  
  capturedPrompts.forEach((prompt, index) => {
    const quality = prompt.quality || prompt;
    const qualityClass = getQualityClass(quality.score);
    const truncatedText = prompt.text.length > 150 
      ? prompt.text.substring(0, 150) + '...' 
      : prompt.text;
    
    const cognitiveIndicators = [];
    if (quality.cognitiveLevel) cognitiveIndicators.push(`🧠 ${quality.cognitiveLevel}`);
    if (quality.autonomyScore > 3) cognitiveIndicators.push('🎯 Autónomo');
    if (quality.reflexivityScore > 3) cognitiveIndicators.push('💭 Reflexivo');
    
    html += `
      <div class="prompt-item">
        <div class="prompt-header">
          <span class="quality-badge ${qualityClass}">${quality.category}</span>
          <span class="score-display">${quality.score}/5</span>
        </div>
        <div class="prompt-text">${truncatedText}</div>
        <div class="prompt-feedback">${quality.feedback.slice(0, 2).join(' • ')}</div>
        ${cognitiveIndicators.length > 0 ? `
          <div class="cognitive-indicators">
            ${cognitiveIndicators.map(indicator => `<span class="indicator">${indicator}</span>`).join('')}
          </div>
        ` : ''}
      </div>
    `;
  });
  
  promptsList.innerHTML = html;
}

function getQualityClass(score) {
  if (score >= 4) return 'quality-excellent';
  if (score >= 3) return 'quality-good';
  if (score >= 2) return 'quality-medium';
  if (score >= 1) return 'quality-poor';
  return 'quality-very-poor';
}

function sendToBackend() {
  if (capturedPrompts.length === 0) {
    alert('No hay prompts para enviar al backend.');
    return;
  }
  
  chrome.runtime.sendMessage({ action: 'sendToBackend' }, (response) => {
    alert(`Enviando ${capturedPrompts.length} prompts al backend...`);
    // En una implementación real, aquí manejarías la respuesta del backend
  });
}

function clearPrompts() {
  if (capturedPrompts.length === 0) {
    alert('No hay prompts para limpiar.');
    return;
  }
  
  if (confirm(`¿Estás seguro de que quieres eliminar todos los ${capturedPrompts.length} prompts capturados?`)) {
    chrome.runtime.sendMessage({ action: 'clearPrompts' }, (response) => {
      if (response && response.success) {
        capturedPrompts = [];
        updateStats();
        updateCognitiveMetrics();
        renderPromptsList();
        alert('Prompts eliminados correctamente.');
      }
    });
  }
}

// Escuchar mensajes del content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'promptAnalysis') {
    // Actualizar el prompt actual si es diferente
    if (message.data.text !== currentPrompt) {
      currentPrompt = message.data.text;
      showCurrentPrompt();
    }
  }
});

// Funciones para manejar la pantalla flotante de planes
function showPlanModal() {
  const modal = document.getElementById('planModal');
  modal.classList.add('show');
  
  // Cerrar modal al hacer clic fuera de él
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      hidePlanModal();
    }
  });
  
  // Cerrar modal con ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      hidePlanModal();
    }
  });
}

function hidePlanModal() {
  const modal = document.getElementById('planModal');
  modal.classList.remove('show');
}

function manageSubscription() {
  // Aquí puedes agregar la lógica para gestionar la suscripción
  // Por ejemplo, abrir una página de gestión de suscripción
  const subscriptionUrl = 'https://mentoria-subscription.vercel.app';
  
  chrome.tabs.create({ url: subscriptionUrl }, (tab) => {
    // Si falla, mostrar mensaje de próximamente
    chrome.tabs.onUpdated.addListener(function listener(tabId, changeInfo, tab) {
      if (tabId === tab.id && changeInfo.status === 'complete') {
        chrome.tabs.onUpdated.removeListener(listener);
        
        // Verificar si la página cargó correctamente
        chrome.tabs.executeScript(tab.id, {
          code: 'document.body.innerHTML.includes("404") || document.body.innerHTML.includes("not found")'
        }, (result) => {
          if (result && result[0]) {
            // Si hay error 404, mostrar página de próximamente
            chrome.tabs.update(tab.id, {
              url: 'data:text/html;charset=utf-8,' + encodeURIComponent(`
                <!DOCTYPE html>
                <html lang="es">
                <head>
                  <meta charset="UTF-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                  <title>Gestión de Suscripción - Próximamente</title>
                  <style>
                    * {
                      margin: 0;
                      padding: 0;
                      box-sizing: border-box;
                    }
                    
                    body {
                      font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                      background: linear-gradient(135deg, #0D5EA6 0%, #EAA64D 100%);
                      min-height: 100vh;
                      display: flex;
                      align-items: center;
                      justify-content: center;
                      color: white;
                    }
                    
                    .container {
                      text-align: center;
                      max-width: 600px;
                      padding: 40px;
                    }
                    
                    .logo {
                      font-size: 48px;
                      margin-bottom: 20px;
                    }
                    
                    h1 {
                      font-family: 'Poppins', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                      font-size: 36px;
                      margin-bottom: 20px;
                      color: white;
                      font-weight: bold;
                    }
                    
                    .subtitle {
                      font-size: 18px;
                      margin-bottom: 30px;
                      opacity: 0.9;
                    }
                    
                    .features {
                      background: rgba(255, 255, 255, 0.1);
                      padding: 30px;
                      border-radius: 15px;
                      margin: 30px 0;
                      backdrop-filter: blur(10px);
                    }
                    
                    .features h3 {
                      margin-bottom: 20px;
                      font-size: 24px;
                    }
                    
                    .feature-list {
                      list-style: none;
                      text-align: left;
                    }
                    
                    .feature-list li {
                      margin: 10px 0;
                      padding: 10px;
                      background: rgba(255, 255, 255, 0.1);
                      border-radius: 8px;
                      border-left: 4px solid #EAA64D;
                    }
                    
                    .coming-soon {
                      background: rgba(255, 255, 255, 0.2);
                      padding: 20px;
                      border-radius: 10px;
                      margin-top: 30px;
                    }
                    
                    .back-btn {
                      background: rgba(255, 255, 255, 0.2);
                      color: white;
                      border: 2px solid white;
                      padding: 12px 24px;
                      border-radius: 8px;
                      cursor: pointer;
                      font-size: 16px;
                      margin-top: 20px;
                      transition: all 0.3s ease;
                    }
                    
                    .back-btn:hover {
                      background: white;
                      color: #0D5EA6;
                    }
                  </style>
                </head>
                <body>
                  <div class="container">
                    <div class="logo">💳</div>
                    <h1>Gestión de Suscripción</h1>
                    <p class="subtitle">Tu centro de control para gestionar tu plan MentorIA</p>
                    
                    <div class="features">
                      <h3>🔧 Funcionalidades Próximas</h3>
                      <ul class="feature-list">
                        <li>💳 <strong>Gestión de Pagos:</strong> Actualizar método de pago</li>
                        <li>📅 <strong>Historial de Facturación:</strong> Ver facturas anteriores</li>
                        <li>🔄 <strong>Cambio de Plan:</strong> Actualizar o cancelar suscripción</li>
                        <li>📊 <strong>Uso del Servicio:</strong> Estadísticas de uso detalladas</li>
                        <li>🎁 <strong>Promociones:</strong> Códigos de descuento y ofertas</li>
                        <li>📧 <strong>Notificaciones:</strong> Alertas de renovación y cambios</li>
                      </ul>
                    </div>
                    
                    <div class="coming-soon">
                      <h3>🚧 En Desarrollo</h3>
                      <p>Nuestro equipo está implementando el sistema de gestión de suscripciones. ¡Mantente atento a las actualizaciones!</p>
                    </div>
                    
                    <button class="back-btn" onclick="window.close()">← Volver a MentorIA</button>
                  </div>
                </body>
                </html>
              `)
            });
          }
        });
      }
    });
  });
  
  // Cerrar el modal después de abrir la página
  hidePlanModal();
}

function updatePlanStatus() {
  // Por ahora, asumimos que el usuario tiene plan Pro
  // En una implementación real, esto vendría del backend o storage local
  const currentPlan = 'pro'; // 'free' o 'pro'
  const planStatusBtn = document.getElementById('planStatusBtn');
  const planIcon = planStatusBtn.querySelector('.plan-icon');
  const planText = planStatusBtn.querySelector('.plan-text');
  
  if (currentPlan === 'pro') {
    planIcon.textContent = '💎';
    planText.textContent = 'Plan Pro Activo';
    planStatusBtn.style.background = '#EAA64D';
  } else {
    planIcon.textContent = '🔓';
    planText.textContent = 'Plan Free';
    planStatusBtn.style.background = '#6c757d';
  }
  
  // También actualizar el modal para reflejar el plan actual
  updatePlanModal(currentPlan);
}

function updatePlanModal(currentPlan) {
  const freePlan = document.getElementById('freePlan');
  const proPlan = document.getElementById('proPlan');
  
  if (currentPlan === 'pro') {
    freePlan.classList.remove('active');
    proPlan.classList.add('active');
    
    // Actualizar botones
    freePlan.querySelector('.plan-btn').textContent = 'Cambiar a Free';
    freePlan.querySelector('.plan-btn').classList.remove('disabled');
    freePlan.querySelector('.plan-btn').disabled = false;
    
    proPlan.querySelector('.plan-btn').textContent = 'Plan Actual';
    proPlan.querySelector('.plan-btn').classList.add('disabled');
    proPlan.querySelector('.plan-btn').disabled = true;
  } else {
    freePlan.classList.add('active');
    proPlan.classList.remove('active');
    
    // Actualizar botones
    freePlan.querySelector('.plan-btn').textContent = 'Plan Actual';
    freePlan.querySelector('.plan-btn').classList.add('disabled');
    freePlan.querySelector('.plan-btn').disabled = true;
    
    proPlan.querySelector('.plan-btn').textContent = 'Actualizar a Pro';
    proPlan.querySelector('.plan-btn').classList.remove('disabled');
    proPlan.querySelector('.plan-btn').disabled = false;
  }
}

function handlePlanChange(newPlan) {
  const currentPlan = 'pro'; // En una implementación real, esto vendría del estado actual
  
  if (newPlan === currentPlan) {
    // No hacer nada si ya está en ese plan
    return;
  }
  
  if (newPlan === 'pro') {
    // Mostrar confirmación para actualizar a Pro
    if (confirm('¿Estás seguro de que quieres actualizar a MentorIA Pro por $10/mes?')) {
      // Aquí iría la lógica de pago
      alert('Redirigiendo a la página de pago...');
      // En una implementación real, aquí abrirías la página de pago
    }
  } else if (newPlan === 'free') {
    // Mostrar confirmación para cambiar a Free
    if (confirm('¿Estás seguro de que quieres cambiar a MentorIA Free? Perderás acceso a las funciones Pro.')) {
      // Aquí iría la lógica para cambiar a Free
      alert('Plan cambiado a Free. Los cambios se aplicarán en tu próxima sesión.');
      // En una implementación real, aquí actualizarías el estado del usuario
    }
  }
} 