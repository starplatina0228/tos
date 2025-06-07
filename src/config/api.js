const API_CONFIG = {
  // 개발/프로덕션 환경 구분
  development: {
    BASE_URL: 'http://localhost:8000'
  },
  
  production: {
    BASE_URL: 'political-bellanca-cois-b2b1d89e.koyeb.app/'  // Koyeb 배포 후 실제 URL로 변경해야함
  },
  
  // 현재 환경 감지
  get currentEnv() {
    // GitHub Pages 도메인에서는 production
    // localhost에서는 development
    const hostname = window.location.hostname;
    return hostname === 'localhost' || 
           hostname === '127.0.0.1' 
           ? 'development' 
           : 'production';
  },
  
  // 현재 환경에 맞는 BASE_URL 반환
  get BASE_URL() {
    return this[this.currentEnv].BASE_URL;
  },
  
  // API 엔드포인트 정의
  endpoints: {
    SCHEDULE: '/api/schedule',
    FEEDBACK: '/api/feedback',
    HEALTH: '/health'
  },
  
  // 전체 URL 생성 함수
  getFullUrl(endpoint) {
    return `${this.BASE_URL}${endpoint}`;
  },
  
  // API 호출 헬퍼 함수
  async callAPI(endpoint, options = {}) {
    const url = this.getFullUrl(endpoint);
    
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
      },
    };
    
    const finalOptions = {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...options.headers,
      },
    };
    
    try {
      console.log(`API 호출: ${url}`);
      const response = await fetch(url, finalOptions);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API 호출 오류:', error);
      throw error;
    }
  }
};

export { API_CONFIG };