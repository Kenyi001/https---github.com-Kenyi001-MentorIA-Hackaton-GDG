// Servidor MentorIA con Pusher para comunicación en tiempo real
const express = require('express');
const cors = require('cors');
const Pusher = require('pusher');
const { PredictionServiceClient } = require('@google-cloud/aiplatform');
require('dotenv').config();

class MentorIAServer {
  constructor() {
    this.app = express();
    this.pusher = null;
    this.vertexClient = null;
    this.users = new Map(); // user_id -> userData
    this.setupExpress();
    this.setupPusher();
    this.setupVertexAI();
  }

  setupExpress() {
    this.app.use(cors());
    this.app.use(express.json());
    
    // Health check
    this.app.get('/health', (req, res) => {
      res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        users_connected: this.users.size
      });
    });

    // Identificación de usuario
    this.app.post('/api/user/identify', (req, res) => {
      try {
        const { user_id, user_agent, language, timezone, url, timestamp } = req.body;
        
        // Guardar datos del usuario
        this.users.set(user_id, {
          user_id,
          user_agent,
          language,
          timezone,
          url,
          first_seen: timestamp,
          last_seen: timestamp,
          prompts_count: 0
        });

        console.log(`👤 Usuario identificado: ${user_id}`);
        
        res.json({
          status: 'success',
          user_id: user_id,
          message: 'Usuario identificado correctamente'
        });
      } catch (error) {
        console.error('❌ Error identificando usuario:', error);
        res.status(500).json({ error: error.message });
      }
    });

    // Análisis de prompt
    this.app.post('/api/prompt/analyze', async (req, res) => {
      try {
        const { user_id, prompt, local_analysis, session_data } = req.body;
        
        console.log(`📝 Procesando prompt de usuario ${user_id}:`, prompt.substring(0, 50) + '...');
        
        // Actualizar datos del usuario
        const userData = this.users.get(user_id) || {};
        userData.last_seen = new Date().toISOString();
        userData.prompts_count = (userData.prompts_count || 0) + 1;
        this.users.set(user_id, userData);
        
        // Guardar prompt en base de datos (simulado)
        await this.savePromptData(req.body);
        
        // Responder inmediatamente que se está procesando
        res.json({
          status: 'processing',
          user_id: user_id,
          message: 'Prompt recibido y enviado para análisis'
        });

        // Procesar con Vertex AI en background
        this.processPromptWithVertexAI(user_id, prompt, local_analysis, session_data);
        
      } catch (error) {
        console.error('❌ Error procesando prompt:', error);
        res.status(500).json({ error: error.message });
      }
    });

    // Analytics del usuario
    this.app.get('/api/analytics/:userId', (req, res) => {
      try {
        const { userId } = req.params;
        const userData = this.users.get(userId);
        
        if (!userData) {
          return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        const analytics = {
          total_prompts: userData.prompts_count || 0,
          average_score: this.calculateAverageScore(userId),
          improvement_trend: this.calculateImprovementTrend(userId),
          cognitive_risk_distribution: this.getRiskDistribution(userId),
          session_data: {
            first_seen: userData.first_seen,
            last_seen: userData.last_seen,
            total_sessions: this.getTotalSessions(userId)
          }
        };

        res.json(analytics);
      } catch (error) {
        console.error('❌ Error obteniendo analytics:', error);
        res.status(500).json({ error: error.message });
      }
    });

    // Endpoint para testing
    this.app.post('/api/test/prompt', async (req, res) => {
      try {
        const { prompt, userId } = req.body;
        const result = await this.analyzePromptWithVertexAI(userId, prompt, {}, {});
        res.json(result);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });
  }

  setupPusher() {
    this.pusher = new Pusher({
      appId: process.env.PUSHER_APP_ID || 'your-app-id',
      key: process.env.PUSHER_KEY || 'your-key',
      secret: process.env.PUSHER_SECRET || 'your-secret',
      cluster: process.env.PUSHER_CLUSTER || 'us2',
      useTLS: true
    });

    console.log('✅ Pusher configurado correctamente');
  }

  setupVertexAI() {
    try {
      this.vertexClient = new PredictionServiceClient({
        apiEndpoint: `${process.env.VERTEX_AI_LOCATION || 'us-central1'}-aiplatform.googleapis.com`,
      });

      console.log('✅ Vertex AI configurado correctamente');
    } catch (error) {
      console.error('❌ Error configurando Vertex AI:', error);
      console.log('⚠️ Usando análisis local como fallback');
    }
  }

  async processPromptWithVertexAI(userId, prompt, localAnalysis, sessionData) {
    try {
      // Enviar evento de procesamiento
      this.pusher.trigger(`user-${userId}`, 'prompt-feedback', {
        feedback: 'Procesando con Vertex AI...',
        color: 'blue',
        score: 0,
        cognitive_risk: 'ANALIZANDO'
      });

      // Simular delay de procesamiento
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Analizar con Vertex AI (o análisis local si no está disponible)
      const evaluation = await this.analyzePromptWithVertexAI(userId, prompt, localAnalysis, sessionData);

      // Enviar resultado final
      this.pusher.trigger(`user-${userId}`, 'analysis-complete', {
        evaluation: evaluation,
        timestamp: new Date().toISOString()
      });

      // Guardar evaluación
      await this.saveEvaluationData(userId, evaluation);

      console.log(`✅ Análisis completado para usuario ${userId}`);

    } catch (error) {
      console.error('❌ Error procesando con Vertex AI:', error);
      
      // Enviar error al usuario
      this.pusher.trigger(`user-${userId}`, 'analysis-error', {
        message: 'Error procesando el prompt. Usando análisis local.',
        timestamp: new Date().toISOString()
      });

      // Usar análisis local como fallback
      const localEvaluation = this.evaluatePromptLocally(prompt);
      this.pusher.trigger(`user-${userId}`, 'analysis-complete', {
        evaluation: localEvaluation,
        timestamp: new Date().toISOString()
      });
    }
  }

  async analyzePromptWithVertexAI(userId, prompt, localAnalysis, sessionData) {
    if (!this.vertexClient) {
      console.log('⚠️ Vertex AI no disponible, usando análisis local');
      return this.evaluatePromptLocally(prompt);
    }

    try {
      const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;
      const location = process.env.VERTEX_AI_LOCATION || 'us-central1';
      const modelId = process.env.VERTEX_AI_MODEL_ID || 'gemini-pro';

      const request = {
        endpoint: `projects/${projectId}/locations/${location}/publishers/google/models/${modelId}`,
        instances: [{
          prompt: this.createVertexAIPrompt(prompt, localAnalysis, sessionData)
        }]
      };

      const [response] = await this.vertexClient.predict(request);
      return this.processVertexAIResponse(response, prompt);

    } catch (error) {
      console.error('❌ Error con Vertex AI:', error);
      return this.evaluatePromptLocally(prompt);
    }
  }

  createVertexAIPrompt(prompt, localAnalysis, sessionData) {
    return `
Analiza este prompt desde la perspectiva de deuda cognitiva y autonomía intelectual.

Prompt del usuario: "${prompt}"

Análisis local previo:
- Longitud: ${prompt.length} caracteres
- Palabras: ${prompt.trim().split(/\s+/).length}
- Categoría: ${localAnalysis.category || 'N/A'}

Datos de sesión:
- Prompts en esta sesión: ${sessionData.prompts_count || 0}
- Tiempo de enfoque: ${sessionData.focus_time || 0}ms

Proporciona una evaluación en formato JSON con:
{
  "feedback": "Mensaje de retroalimentación",
  "color": "green|yellow|red",
  "score": 1-5,
  "cognitive_risk": "BAJO|MEDIO|ALTO",
  "suggestions": ["sugerencia1", "sugerencia2"]
}
`;
  }

  processVertexAIResponse(response, originalPrompt) {
    try {
      // Extraer respuesta del modelo
      const prediction = response.predictions[0];
      const content = prediction.structValue.fields.content.stringValue;
      
      // Parsear JSON de la respuesta
      const evaluation = JSON.parse(content);
      
      return {
        feedback: evaluation.feedback,
        color: evaluation.color,
        score: evaluation.score,
        cognitive_risk: evaluation.cognitive_risk,
        suggestions: evaluation.suggestions || [],
        source: 'vertex_ai',
        prompt: originalPrompt
      };

    } catch (error) {
      console.error('❌ Error procesando respuesta de Vertex AI:', error);
      return this.evaluatePromptLocally(originalPrompt);
    }
  }

  evaluatePromptLocally(prompt) {
    const words = prompt.trim().split(/\s+/).length;
    const characters = prompt.trim().length;
    
    let color = 'yellow';
    let score = 3;
    let cognitive_risk = 'MEDIO';
    let feedback = '';
    let suggestions = [];

    if (words < 10) {
      color = 'red';
      score = 1;
      cognitive_risk = 'ALTO';
      feedback = 'Este prompt es muy corto. Considera agregar más detalles y contexto específico para obtener mejores respuestas.';
      suggestions = [
        'Agrega más contexto personal',
        'Sé más específico sobre lo que quieres aprender',
        'Incluye ejemplos o situaciones específicas'
      ];
    } else if (words < 30) {
      color = 'yellow';
      score = 2;
      cognitive_risk = 'MEDIO';
      feedback = 'El prompt podría ser más específico. Intenta incluir más contexto personal o detalles relevantes.';
      suggestions = [
        'Relaciona con tu experiencia previa',
        'Agrega contexto específico',
        'Haz preguntas más profundas'
      ];
    } else {
      color = 'green';
      score = 4;
      cognitive_risk = 'BAJO';
      feedback = '¡Excelente! Tu prompt está bien formulado y muestra buen nivel de reflexión.';
      suggestions = [
        'Continúa siendo específico en tus preguntas',
        'Mantén el nivel de reflexión personal',
        'Comparte tus insights con otros'
      ];
    }

    return {
      feedback,
      color,
      score,
      cognitive_risk,
      suggestions,
      source: 'local',
      metrics: {
        word_count: words,
        character_count: characters,
        complexity_score: Math.min(5, words / 5)
      }
    };
  }

  async savePromptData(data) {
    // Aquí implementarías la lógica para guardar en base de datos
    console.log('💾 Guardando datos del prompt:', {
      user_id: data.user_id,
      prompt_length: data.prompt.length,
      timestamp: data.timestamp
    });
  }

  async saveEvaluationData(userId, evaluation) {
    // Aquí implementarías la lógica para guardar evaluación
    console.log('💾 Guardando evaluación:', {
      user_id: userId,
      score: evaluation.score,
      cognitive_risk: evaluation.cognitive_risk,
      source: evaluation.source
    });
  }

  calculateAverageScore(userId) {
    // Implementar cálculo de puntuación promedio
    return (Math.random() * 2 + 3).toFixed(1);
  }

  calculateImprovementTrend(userId) {
    // Implementar cálculo de tendencia de mejora
    return Math.random() * 20 + 5;
  }

  getRiskDistribution(userId) {
    // Implementar distribución de riesgo cognitivo
    return {
      low: Math.floor(Math.random() * 50) + 20,
      medium: Math.floor(Math.random() * 30) + 10,
      high: Math.floor(Math.random() * 20) + 5
    };
  }

  getTotalSessions(userId) {
    // Implementar cálculo de sesiones totales
    return Math.floor(Math.random() * 10) + 1;
  }

  async initialize() {
    try {
      const PORT = process.env.PORT || 3000;
      
      this.app.listen(PORT, () => {
        console.log(`🚀 Servidor MentorIA iniciado en puerto ${PORT}`);
        console.log(`📊 Health check: http://localhost:${PORT}/health`);
        console.log(`🔌 Pusher configurado en cluster: ${process.env.PUSHER_CLUSTER || 'us2'}`);
      });

    } catch (error) {
      console.error('❌ Error inicializando servidor:', error);
      process.exit(1);
    }
  }

  async shutdown() {
    console.log('🛑 Cerrando servidor MentorIA...');
    process.exit(0);
  }
}

// Manejo de señales para cierre graceful
process.on('SIGINT', () => {
  console.log('📡 Recibida señal SIGINT');
  server.shutdown();
});

process.on('SIGTERM', () => {
  console.log('📡 Recibida señal SIGTERM');
  server.shutdown();
});

// Inicializar servidor
const server = new MentorIAServer();
server.initialize().catch(console.error);

module.exports = MentorIAServer; 