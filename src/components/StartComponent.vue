<template>
  <div class="start-container" :class="{ 'mobile-view': isMobile }">
    <!-- 데스크톱 레이아웃 -->
    <div v-if="!isMobile" class="page-container">
      <div class="card start-card">
        <div class="card-content">
          <h1 class="title title-large">시간표 만들기</h1>
          <p class="subtitle">몇 가지 질문에 답하고 맞춤형 시간표를 만들어보세요</p>

          <button class="btn btn-primary btn-large" @click="onStartClick">
            <span>시작하기</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M5 12h14"></path>
              <path d="m12 5 7 7-7 7"></path>
            </svg>
          </button>
        </div>
      </div>
      <AppFooter type="simple" />
    </div>

    <!-- 모바일 레이아웃 -->
    <div v-else class="mobile-layout">
      <div class="mobile-header">
        <div class="mobile-brand">
          <span class="brand-emoji">📚</span>
          <h1 class="mobile-title">시간표 만들기</h1>
        </div>
      </div>

      <div class="mobile-content">
        <div class="mobile-hero">

          <h2 class="mobile-hero-title">몇 가지 질문에 답하고<br>맞춤형 시간표를 만들어보세요</h2>

          <div class="mobile-feature-grid">
            <div class="mobile-feature-card">
              <div class="feature-content-mobile">
                <h3 class="feature-title-mobile">개인 맞춤형</h3>
                <p class="feature-desc-mobile">당신의 선호도에 맞춰 최적화</p>
              </div>
            </div>

            <div class="mobile-feature-card">
              <div class="feature-content-mobile">
                <h3 class="feature-title-mobile">빠른 생성</h3>
                <p class="feature-desc-mobile">1 분만에 완성되는 나만의 시간표</p>
              </div>
            </div>
          </div>

          <div class="mobile-stats-container">
            <div class="mobile-stat">
              <span class="stat-number">5</span>
              <span class="stat-label">개 질문</span>
            </div>
            <div class="stat-separator"></div>
            <div class="mobile-stat">
              <span class="stat-number">1</span>
              <span class="stat-label">분 소요</span>
            </div>
            <div class="stat-separator"></div>
            <div class="mobile-stat">
              <span class="stat-number">100%</span>
              <span class="stat-label">맞춤형</span>
            </div>
          </div>
        </div>
      </div>

      <div class="mobile-action-bar">
        <button
          class="mobile-cta-button"
          @click="onStartClick"
          :class="{ 'pulse-animation': showPulse }"
        >
          <span class="cta-text">시간표 만들기 시작</span>
          <div class="cta-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M5 12h14"></path>
              <path d="m12 5 7 7-7 7"></path>
            </svg>
          </div>
        </button>

        <div class="mobile-footer-text">
          <p><strong>COIS Lab</strong>과 함께하는 스마트한 학습 계획</p>
          <p><strong>TL : </strong>Seung Chan Choi</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import AppFooter from './Footer.vue';

export default {
  name: 'StartComponent',
  components: {
    AppFooter
  },
  data() {
    return {
      isMobile: false,
      showPulse: false,
      floatingY1: 0,
      floatingY2: 0,
      floatingY3: 0,
      animationId: null
    }
  },
  mounted() {
    this.detectMobileDevice();
    this.initializeAnimations();
    window.addEventListener('resize', this.detectMobileDevice);
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.detectMobileDevice);
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
  },
  methods: {
    detectMobileDevice() {
      this.isMobile = window.innerWidth <= 768;
    },

    initializeAnimations() {
      this.startFloatingEffect();
      this.schedulePulseEffect();
    },

    startFloatingEffect() {
      let startTime = Date.now();
      const animate = () => {
        const elapsed = (Date.now() - startTime) * 0.001;
        this.floatingY1 = Math.sin(elapsed * 1.2) * 8;
        this.floatingY2 = Math.sin(elapsed * 1.4 + 1) * 6;
        this.floatingY3 = Math.sin(elapsed * 1.6 + 2) * 10;

        this.animationId = requestAnimationFrame(animate);
      };
      animate();
    },

    schedulePulseEffect() {
      setTimeout(() => {
        this.showPulse = true;
        setInterval(() => {
          this.showPulse = false;
          setTimeout(() => {
            this.showPulse = true;
          }, 150);
        }, 4000);
      }, 2500);
    },

    onStartClick() {
      if (navigator.vibrate && this.isMobile) {
        navigator.vibrate(50);
      }
      this.$emit('start-clicked');
    }
  }
}
</script>

<style scoped>
/* ==========================================================================
   데스크톱 기본 레이아웃 (기존 style.css 클래스 활용)
   ========================================================================== */
.start-card {
  max-width: var(--card-max-width);
  width: 100%;
}

.feature-highlights {
  display: flex;
  justify-content: space-around;
  margin: var(--spacing-4) 0;
  gap: var(--spacing-3);
}

.feature-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-1);
}

.feature-icon {
  font-size: 24px;
  margin-bottom: var(--spacing-1);
}

.feature-text {
  font-size: 14px;
  color: var(--gray-color);
  font-weight: 500;
  text-align: center;
}
.start-card .btn {
  display: block;
  margin: 0 auto;
}
/* ==========================================================================
   모바일 전용 레이아웃
   ========================================================================== */
.mobile-view {
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
}

.mobile-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  position: relative;
}

.mobile-header {
  padding: var(--spacing-3) var(--spacing-3) var(--spacing-2);
  text-align: center;
  position: relative;
  z-index: 2;
}

.mobile-brand {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-1);
}

.brand-emoji {
  font-size: 48px;
  filter: drop-shadow(0 4px 8px rgba(0,0,0,0.1));
}

.mobile-title {
  color: white;
  font-size: 28px;
  font-weight: var(--heading-font-weight);
  margin: 0;
  text-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

.mobile-content {
  flex: 1;
  padding: var(--spacing-3);
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.mobile-hero {
  text-align: center;
}

.floating-animations {
  position: relative;
  height: 100px;
  margin-bottom: var(--spacing-4);
}

.floating-icon {
  position: absolute;
  font-size: 32px;
  opacity: 0.8;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));
}

.floating-icon:nth-child(1) {
  left: 20%;
  top: 20px;
}

.floating-icon:nth-child(2) {
  right: 25%;
  top: 40px;
}

.floating-icon:nth-child(3) {
  left: 50%;
  top: 10px;
  transform: translateX(-50%);
}

.mobile-hero-title {
  color: white;
  font-size: 24px;
  font-weight: 600;
  line-height: 1.4;
  margin-bottom: var(--spacing-4);
  text-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

.mobile-feature-grid {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
  margin-bottom: var(--spacing-4);
}

.mobile-feature-card {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border-radius: var(--border-radius);
  padding: var(--spacing-3);
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: var(--transition-base);
}

.mobile-feature-card:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

.feature-icon-mobile {
  font-size: 36px;
  flex-shrink: 0;
}

.feature-content-mobile {
  flex: 1;
  text-align: left;
}

.feature-title-mobile {
  color: white;
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 4px 0;
}

.feature-desc-mobile {
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  margin: 0;
  line-height: 1.4;
}

.mobile-stats-container {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: var(--spacing-3);
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: var(--spacing-3);
  margin: var(--spacing-3) 0;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.mobile-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.stat-number {
  color: white;
  font-size: 24px;
  font-weight: var(--heading-font-weight);
  line-height: 1;
}

.stat-label {
  color: rgba(255, 255, 255, 0.8);
  font-size: 12px;
  font-weight: 500;
}

.stat-separator {
  width: 1px;
  height: 30px;
  background: rgba(255, 255, 255, 0.3);
}

/* ==========================================================================
   모바일 하단 액션 바
   ========================================================================== */
.mobile-action-bar {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  padding: var(--spacing-3);
  position: sticky;
  bottom: 0;
  z-index: 10;
}

.mobile-cta-button {
  width: 100%;
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  color: white;
  border: none;
  border-radius: var(--border-radius);
  padding: 18px var(--spacing-3);
  font-size: 18px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: var(--box-shadow);
  transition: var(--transition-base);
  position: relative;
  overflow: hidden;
  cursor: pointer;
}

.mobile-cta-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
  transition: left 0.6s;
}

.mobile-cta-button:active::before {
  left: 100%;
}

.mobile-cta-button:active {
  transform: scale(0.98);
}

.pulse-animation {
  animation: mobilePulse 2s infinite;
}

@keyframes mobilePulse {
  0% {
    box-shadow: var(--box-shadow);
  }
  50% {
    box-shadow: var(--box-shadow-hover), 0 0 0 0 rgba(67, 97, 238, 0.4);
  }
  100% {
    box-shadow: var(--box-shadow), 0 0 0 10px rgba(67, 97, 238, 0);
  }
}

.cta-text {
  flex: 1;
  text-align: left;
}

.cta-icon {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mobile-footer-text {
  margin-top: var(--spacing-2);
  text-align: center;
}

.mobile-footer-text p {
  color: var(--gray-color);
  font-size: 12px;
  margin: 0;
}

/* ==========================================================================
   반응형 미디어 쿼리
   ========================================================================== */
@media (max-width: 768px) {
  .start-container.mobile-view {
    background: linear-gradient(180deg, var(--primary-color) 0%, var(--secondary-color) 100%);
  }
}

@media (max-width: 480px) {
  .mobile-title {
    font-size: 24px;
  }

  .mobile-hero-title {
    font-size: 20px;
  }

  .mobile-feature-card {
    padding: var(--spacing-2);
  }

  .feature-title-mobile {
    font-size: 16px;
  }

  .feature-desc-mobile {
    font-size: 13px;
  }

  .mobile-cta-button {
    padding: 16px var(--spacing-2);
    font-size: 16px;
  }
}

@media (max-width: 360px) {
  .mobile-feature-grid {
    gap: var(--spacing-1);
  }

  .mobile-stats-container {
    gap: var(--spacing-2);
    padding: var(--spacing-2);
  }

  .stat-number {
    font-size: 20px;
  }

  .stat-label {
    font-size: 11px;
  }
}

/* ==========================================================================
   접근성 최적화
   ========================================================================== */
@media (prefers-reduced-motion: reduce) {
  .floating-icon,
  .pulse-animation,
  .mobile-cta-button {
    animation: none !important;
    transition: none !important;
  }
}

@media (prefers-contrast: high) {
  .mobile-feature-card,
  .mobile-stats-container {
    background: rgba(255, 255, 255, 0.3);
    border: 2px solid rgba(255, 255, 255, 0.5);
  }
}
</style>