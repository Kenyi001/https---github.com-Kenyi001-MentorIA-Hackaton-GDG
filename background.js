// background.js - ExtMentor con enfoque en deuda cognitiva

let capturedPrompts = [];

chrome.runtime.onInstalled.addListener(() => {
  console.log('ExtMentor instalado correctamente.');
  
  // Inicializar almacenamiento
  chrome.storage.local.set({
    capturedPrompts: [],
    settings: {
      autoAnalyze: true,
      showNotifications: true,
      saveToBackend: false,
      vertexAIEnabled: false,
      inactivityTimeout: 7000,
      cognitiveRiskThreshold: 0.7
    }
  });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Mensaje recibido:', message.action);
  
  switch (message.action) {
    case 'promptCaptured':
      handlePromptCaptured(message.data);
      break;
      
    case 'promptAnalysis':
      handlePromptAnalysis(message.data);
      break;
      
    case 'getCapturedPrompts':
      sendResponse({ prompts: capturedPrompts });
      break;
      
    case 'clearPrompts':
      clearCapturedPrompts();
      sendResponse({ success: true });
      break;
      
    case 'sendToBackend':
      sendPromptsToBackend();
      break;
      
    case 'evaluateWithVertexAI':
      evaluateWithVertexAI(message.prompt).then(result => {
        sendResponse({ result: result });
      });
      return true;
      
    case 'getSettings':
      chrome.storage.local.get(['settings'], (result) => {
        sendResponse({ settings: result.settings });
      });
      return true;
      
    case 'updateSettings':
      chrome.storage.local.set({ settings: message.settings }, () => {
        sendResponse({ success: true });
      });
      return true;
      
    case 'getCognitiveAnalytics':
      getCognitiveAnalytics().then(analytics => {
        sendResponse({ analytics: analytics });
      });
      return true;
      
    // Nuevos mensajes para el indicador de análisis
    case 'showAnalysisIndicator':
    case 'hideAnalysisIndicator':
    case 'updateAnalysisText':
      // Reenviar al popup si está abierto
      chrome.runtime.sendMessage(message);
      break;
  }
});

function handlePromptCaptured(promptData) {
  console.log('Prompt capturado con análisis cognitivo:', promptData);
  
  // Agregar metadatos adicionales
  const enrichedData = {
    ...promptData,
    metadata: {
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      language: navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      sessionId: generateSessionId(),
      version: '1.0'
    }
  };
  
  // Agregar a la lista local
  capturedPrompts.push(enrichedData);
  
  // Guardar en almacenamiento local
  chrome.storage.local.get(['capturedPrompts'], (result) => {
    const storedPrompts = result.capturedPrompts || [];
    storedPrompts.push(enrichedData);
    
    chrome.storage.local.set({ capturedPrompts: storedPrompts }, () => {
      console.log('Prompt guardado en almacenamiento local');
      
      // Mostrar notificación del sistema si está habilitado
      chrome.storage.local.get(['settings'], (settingsResult) => {
        if (settingsResult.settings?.showNotifications) {
          showSystemNotification(enrichedData);
        }
      });
    });
  });
  
  // Enviar al backend si está habilitado
  chrome.storage.local.get(['settings'], (result) => {
    if (result.settings?.saveToBackend) {
      sendPromptToBackend(enrichedData);
    }
  });
  
  // Actualizar badge con métricas cognitivas
  updateExtensionBadge(enrichedData);
}

function handlePromptAnalysis(analysisData) {
  console.log('Análisis de prompt en tiempo real:', analysisData);
  
  // Actualizar el badge con la puntuación de autonomía
  const autonomyScore = analysisData.quality?.autonomyScore || 0;
  updateExtensionBadge({ quality: { score: autonomyScore } });
}

function showSystemNotification(promptData) {
  const quality = promptData.quality;
  const vertexAI = promptData.vertexAI;
  
  let title = `Prompt ${quality.category}`;
  let message = `Puntuación: ${quality.score}/5 - Autonomía: ${quality.autonomyScore?.toFixed(1) || 'N/A'}/5`;
  
  // Agregar advertencia de riesgo cognitivo si aplica
  if (vertexAI && vertexAI.cognitiveRisk === 'ALTO') {
    title = `⚠️ Riesgo de Deuda Cognitiva`;
    message = `Tu prompt muestra signos de dependencia excesiva de la IA. Considera ser más específico y reflexivo.`;
  }
  
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'icon.svg',
    title: title,
    message: message
  });
}

function updateExtensionBadge(promptData) {
  const quality = promptData.quality;
  const autonomyScore = quality?.autonomyScore || quality?.score || 0;
  
  // Usar la puntuación de autonomía para el badge
  const badgeText = autonomyScore >= 4 ? '✓' : autonomyScore >= 3 ? '~' : '!';
  const badgeColor = autonomyScore >= 4 ? '#4CAF50' : autonomyScore >= 3 ? '#FF9800' : '#F44336';
  
  chrome.action.setBadgeText({ text: badgeText });
  chrome.action.setBadgeBackgroundColor({ color: badgeColor });
}

function clearCapturedPrompts() {
  capturedPrompts = [];
  chrome.storage.local.set({ capturedPrompts: [] }, () => {
    console.log('Prompts limpiados');
    chrome.action.setBadgeText({ text: '' });
  });
}

// Función para simular evaluación con Vertex AI
async function evaluateWithVertexAI(prompt) {
  console.log('Simulando evaluación con Vertex AI para:', prompt);
  
  // Simular delay de red
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Datos simulados de Vertex AI con enfoque en deuda cognitiva
  const vertexResponse = {
    cognitiveComplexity: Math.random() * 5 + 1,
    reflexivityLevel: Math.random() * 5 + 1,
    autonomyScore: Math.random() * 5 + 1,
    suggestions: [
      'Considera agregar más contexto personal a tu pregunta.',
      '¿Podrías relacionar esto con conceptos que ya has aprendido?',
      'Intenta ser más específico sobre qué aspecto quieres explorar.',
      'Reflexiona sobre cómo esta pregunta se conecta con tu aprendizaje previo.',
      'Evita depender demasiado de la IA para formular tus preguntas.'
    ],
    cognitiveRisk: Math.random() > 0.7 ? 'ALTO' : 'BAJO',
    recommendation: 'Este prompt podría beneficiarse de más reflexión personal y contexto específico.',
    learningImpact: {
      memoryRetention: Math.random() * 100,
      criticalThinking: Math.random() * 100,
      autonomyLevel: Math.random() * 100
    }
  };
  
  return vertexResponse;
}

function sendPromptToBackend(promptData) {
  // Aquí implementarías la lógica para enviar al backend
  console.log('Enviando prompt al backend con análisis cognitivo:', promptData);
  
  // Ejemplo de envío a un endpoint (descomenta cuando tengas el backend)
  /*
  fetch('https://tu-backend.com/api/prompts/cognitive', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer YOUR_API_KEY'
    },
    body: JSON.stringify({
      ...promptData,
      cognitiveAnalysis: {
        autonomyScore: promptData.quality?.autonomyScore,
        reflexivityScore: promptData.quality?.reflexivityScore,
        cognitiveLevel: promptData.quality?.cognitiveLevel,
        vertexAI: promptData.vertexAI
      }
    })
  })
  .then(response => response.json())
  .then(data => console.log('Prompt enviado al backend:', data))
  .catch(error => console.error('Error enviando al backend:', error));
  */
}

function sendPromptsToBackend() {
  chrome.storage.local.get(['capturedPrompts'], (result) => {
    const prompts = result.capturedPrompts || [];
    
    if (prompts.length === 0) {
      console.log('No hay prompts para enviar');
      return;
    }
    
    console.log('Enviando', prompts.length, 'prompts al backend con análisis cognitivo');
    
    // Ejemplo de envío masivo (descomenta cuando tengas el backend)
    /*
    fetch('https://tu-backend.com/api/prompts/cognitive/batch', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_API_KEY'
      },
      body: JSON.stringify({
        prompts: prompts,
        batchInfo: {
          batchSize: prompts.length,
          timestamp: new Date().toISOString(),
          source: 'extmentor',
          cognitiveAnalysis: true
        }
      })
    })
    .then(response => response.json())
    .then(data => {
      console.log('Prompts enviados al backend:', data);
      clearCapturedPrompts();
    })
    .catch(error => console.error('Error enviando prompts al backend:', error));
    */
  });
}

// Función para generar analytics cognitivos
async function getCognitiveAnalytics() {
  const prompts = capturedPrompts;
  
  if (prompts.length === 0) {
    return {
      totalPrompts: 0,
      averageScores: { quality: 0, autonomy: 0, reflexivity: 0 },
      cognitiveTrends: [],
      riskAnalysis: { high: 0, medium: 0, low: 0 }
    };
  }
  
  // Calcular promedios
  const totalPrompts = prompts.length;
  const avgQuality = prompts.reduce((sum, p) => sum + (p.quality?.score || 0), 0) / totalPrompts;
  const avgAutonomy = prompts.reduce((sum, p) => sum + (p.quality?.autonomyScore || 0), 0) / totalPrompts;
  const avgReflexivity = prompts.reduce((sum, p) => sum + (p.quality?.reflexivityScore || 0), 0) / totalPrompts;
  
  // Análisis de riesgo cognitivo
  const riskAnalysis = {
    high: prompts.filter(p => p.vertexAI?.cognitiveRisk === 'ALTO').length,
    medium: prompts.filter(p => p.vertexAI?.cognitiveRisk === 'MEDIO').length,
    low: prompts.filter(p => p.vertexAI?.cognitiveRisk === 'BAJO').length
  };
  
  // Tendencias cognitivas (últimos 10 prompts)
  const recentPrompts = prompts.slice(0, 10);
  const cognitiveTrends = recentPrompts.map(p => ({
    timestamp: p.timestamp,
    autonomy: p.quality?.autonomyScore || 0,
    reflexivity: p.quality?.reflexivityScore || 0,
    cognitiveLevel: p.quality?.cognitiveLevel || 'N/A'
  }));
  
  return {
    totalPrompts,
    averageScores: {
      quality: parseFloat(avgQuality.toFixed(2)),
      autonomy: parseFloat(avgAutonomy.toFixed(2)),
      reflexivity: parseFloat(avgReflexivity.toFixed(2))
    },
    cognitiveTrends,
    riskAnalysis,
    recommendations: generateCognitiveRecommendations(avgAutonomy, avgReflexivity, riskAnalysis)
  };
}

function generateCognitiveRecommendations(avgAutonomy, avgReflexivity, riskAnalysis) {
  const recommendations = [];
  
  if (avgAutonomy < 3) {
    recommendations.push('Tu autonomía cognitiva es baja. Intenta formular preguntas más específicas y personales.');
  }
  
  if (avgReflexivity < 3) {
    recommendations.push('Aumenta tu reflexividad incluyendo más contexto personal en tus prompts.');
  }
  
  if (riskAnalysis.high > riskAnalysis.low) {
    recommendations.push('Detectamos alto riesgo de deuda cognitiva. Considera reducir la dependencia de la IA.');
  }
  
  return recommendations;
}

function generateSessionId() {
  return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Cargar prompts guardados al iniciar
chrome.storage.local.get(['capturedPrompts'], (result) => {
  capturedPrompts = result.capturedPrompts || [];
  console.log('Prompts cargados:', capturedPrompts.length);
  
  if (capturedPrompts.length > 0) {
    const lastPrompt = capturedPrompts[capturedPrompts.length - 1];
    updateExtensionBadge(lastPrompt);
  }
});

// Enviar analytics periódicamente al backend
setInterval(() => {
  chrome.storage.local.get(['settings'], (result) => {
    if (result.settings?.saveToBackend) {
      getCognitiveAnalytics().then(analytics => {
        // Enviar analytics al backend
        console.log('Enviando analytics cognitivos:', analytics);
      });
    }
  });
}, 60 * 60 * 1000); // Cada hora
  