// Configuración del backend MentorIA
const MENTORIA_CONFIG = {
  // Configuración de Pusher
  PUSHER: {
    KEY: '1726ad2606b2653de030',
    CLUSTER: 'us2'
  },
  
  // Configuración del backend
  BACKEND: {
    URL: 'http://localhost:3001',
    ENDPOINTS: {
      USER_IDENTIFY: '/api/user/identify',
      PROMPT_ANALYZE: '/api/prompt/analyze',
      ANALYTICS: '/api/analytics',
      TEST_PROMPT: '/api/test/prompt'
    }
  },
  
  // Configuración de la extensión
  EXTENSION: {
    VERSION: '1.0.0',
    NAME: 'MentorIA',
    DESCRIPTION: 'Analizador de Prompts con Enfoque en Deuda Cognitiva'
  },
  
  // Configuración de análisis
  ANALYSIS: {
    INACTIVITY_TIMEOUT: 7000, // 7 segundos
    MAX_PROMPT_LENGTH: 1000,
    MIN_WORDS_FOR_ANALYSIS: 3
  }
};

// Exportar configuración
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MENTORIA_CONFIG;
} 