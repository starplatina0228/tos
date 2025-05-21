// src/config/api.js
export const API_CONFIG = {
  // ======= API URL 설정 =======
  BASE_URL: 'https://fd5b-210-102-204-31.ngrok-free.app',
  // ===========================

  endpoints: {
    SCHEDULE: '/api/schedule',
    FEEDBACK: '/api/feedback'
  },

  getFullUrl(endpoint) {
    return `${this.BASE_URL}${endpoint}`;
  }
};