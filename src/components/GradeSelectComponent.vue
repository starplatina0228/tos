<template>
  <div class="grade-select-container" :class="{ 'mobile-view': isMobile }">
    <!-- 데스크톱 레이아웃 -->
    <div v-if="!isMobile" class="page-container">
      <div class="card grade-select-card-desktop">
        <div class="card-content">
          <h1 class="title title-large">기본 정보 입력</h1>

          <div class="form-group">
            <h2 class="section-title">학년 선택</h2>
            <div class="grade-button-group">
              <button
                v-for="g in [2, 3, 4]"
                :key="g"
                class="btn grade-option-btn"
                :class="{
                  'btn-primary': grade === g,
                  'btn-secondary': grade !== g
                }"
                @click="selectGrade(g)"
              >
                {{ g }}학년
              </button>
            </div>
          </div>

          <div class="form-group">
            <h2 class="section-title">희망 수강 학점</h2>
            <div class="credits-control">
              <input
                type="range"
                min="12"
                max="22"
                step="1"
                v-model.number="localCredits"
                class="slider"
              />
              <div class="credits-display">{{ localCredits }}학점</div>
            </div>
          </div>

          <div class="desktop-button-container">
            <button
              class="btn btn-primary btn-large btn-full"
              :disabled="!grade"
              @click="submitInfo"
            >
              다음으로
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 모바일 레이아웃 -->
    <div v-else class="mobile-layout">
      <div class="mobile-header">
        <div class="mobile-progress">
          <div class="progress-bar">
            <div class="progress-fill" style="width: 20%"></div>
          </div>
          <span class="progress-text">1/5 단계</span>
        </div>
        <h1 class="mobile-title">기본 정보를 입력해주세요</h1>
      </div>

      <div class="mobile-content">
        <div class="mobile-section">
          <div class="mobile-section-header">
            <div class="section-icon">🎓</div>
            <h2 class="mobile-section-title">학년 선택</h2>
            <p class="mobile-section-desc">현재 학년을 선택해주세요</p>
          </div>

          <div class="mobile-grade-grid">
            <button
              v-for="g in [2, 3, 4]"
              :key="g"
              class="mobile-grade-option"
              :class="{ 'selected': grade === g }"
              @click="selectGrade(g)"
            >
              <span class="grade-number">{{ g }}</span>
              <span class="grade-label">학년</span>
              <div v-if="grade === g" class="selection-check">✓</div>
            </button>
          </div>
        </div>

        <div class="mobile-section">
          <div class="mobile-section-header">
            <div class="section-icon">📊</div>
            <h2 class="mobile-section-title">희망 수강 학점</h2>
            <p class="mobile-section-desc">한 학기에 듣고 싶은 학점을 설정하세요</p>
          </div>

          <div class="mobile-credits-container">
            <div class="credits-range-display">
              <span class="range-min">12학점</span>
              <span class="current-credits">{{ localCredits }}학점</span>
              <span class="range-max">22학점</span>
            </div>

            <div class="mobile-slider-container">
              <input
                type="range"
                min="12"
                max="22"
                step="1"
                v-model.number="localCredits"
                class="mobile-slider"
              />
              <div class="slider-labels">
                <span>적음</span>
                <span>보통</span>
                <span>많음</span>
              </div>
            </div>

            <div class="credits-recommendation">
              <div class="recommendation-item" :class="{ 'active': localCredits <= 15 }">
                <span class="rec-emoji">😌</span>
                <span class="rec-text">여유로운 학기</span>
              </div>
              <div class="recommendation-item" :class="{ 'active': localCredits > 15 && localCredits <= 18 }">
                <span class="rec-emoji">⚖️</span>
                <span class="rec-text">균형잡힌 학기</span>
              </div>
              <div class="recommendation-item" :class="{ 'active': localCredits > 18 }">
                <span class="rec-emoji">🔥</span>
                <span class="rec-text">불타는 학기</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="mobile-action-bar">
        <button
          class="mobile-submit-button"
          :disabled="!grade"
          @click="submitInfo"
          :class="{ 'pulse-animation': grade && showPulse }"
        >
          <span class="submit-text">다음 단계로</span>
          <div class="submit-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M5 12h14"></path>
              <path d="m12 5 7 7-7 7"></path>
            </svg>
          </div>
        </button>

        <div class="mobile-summary" v-if="grade">
          <span class="summary-text">{{ grade }}학년 · {{ localCredits }}학점</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'GradeSelectComponent',
  props: {
    initialGrade: {
      type: Number,
      default: null
    },
    initialCredits: {
      type: Number,
      default: 18
    }
  },
  data() {
    return {
      grade: this.initialGrade,
      localCredits: this.initialCredits,
      isMobile: false,
      showPulse: false
    }
  },
  mounted() {
    this.detectMobile();
    this.startPulseAnimation();
    window.addEventListener('resize', this.detectMobile);
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.detectMobile);
  },
  methods: {
    detectMobile() {
      this.isMobile = window.innerWidth <= 768;
    },

    selectGrade(grade) {
      this.grade = grade;

      // 햅틱 피드백
      if (navigator.vibrate && this.isMobile) {
        navigator.vibrate(30);
      }
    },

    submitInfo() {
      if (this.grade) {
        // 햅틱 피드백
        if (navigator.vibrate && this.isMobile) {
          navigator.vibrate(50);
        }

        this.$emit('info-submitted', {
          grade: this.grade,
          credits: this.localCredits
        });
      }
    },

    startPulseAnimation() {
      setTimeout(() => {
        this.showPulse = true;
        setInterval(() => {
          this.showPulse = false;
          setTimeout(() => {
            this.showPulse = true;
          }, 100);
        }, 3000);
      }, 1500);
    }
  }
}
</script>

<style scoped>
/* ==========================================================================
   데스크톱 레이아웃 (기존 CSS 통합 활용)
   ========================================================================== */
.grade-select-card-desktop {
  max-width: 600px;
  width: 100%;
}

.grade-button-group {
  display: flex;
  gap: var(--spacing-2);
  justify-content: center;
}

.grade-option-btn {
  flex: 1;
  max-width: 120px;
  min-height: var(--touch-target-min, 44px);
}

.credits-control {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-2);
}

.credits-display {
  font-size: 28px;
  font-weight: var(--heading-font-weight);
  color: var(--primary-color);
  text-align: center;
}

.desktop-button-container {
  display: flex;
  justify-content: center;
  margin-top: var(--spacing-4);
}

/* ==========================================================================
   모바일 레이아웃
   ========================================================================== */
.mobile-view {
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
}

.mobile-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.mobile-header {
  padding: var(--spacing-3);
  text-align: center;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
}

.mobile-progress {
  margin-bottom: var(--spacing-3);
}

.progress-bar {
  width: 100%;
  height: 4px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: var(--spacing-1);
}

.progress-fill {
  height: 100%;
  background: white;
  border-radius: 2px;
  transition: width 0.5s ease;
}

.progress-text {
  color: rgba(255, 255, 255, 0.8);
  font-size: 12px;
  font-weight: 500;
}

.mobile-title {
  color: white;
  font-size: 24px;
  font-weight: var(--heading-font-weight);
  margin: 0;
  line-height: 1.3;
}

.mobile-content {
  flex: 1;
  padding: var(--spacing-3);
  overflow-y: auto;
}

.mobile-section {
  background: white;
  border-radius: var(--border-radius);
  padding: var(--spacing-4);
  margin-bottom: var(--spacing-3);
  box-shadow: var(--box-shadow);
}

.mobile-section-header {
  text-align: center;
  margin-bottom: var(--spacing-4);
}

.section-icon {
  font-size: 48px;
  margin-bottom: var(--spacing-2);
}

.mobile-section-title {
  color: var(--dark-color);
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 var(--spacing-1) 0;
}

.mobile-section-desc {
  color: var(--gray-color);
  font-size: 14px;
  margin: 0;
  line-height: 1.4;
}

.mobile-grade-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-2);
}

.mobile-grade-option {
  background: white;
  border: 2px solid var(--border-color);
  border-radius: var(--border-radius);
  padding: var(--spacing-3);
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  transition: var(--transition-base);
  cursor: pointer;
  min-height: 80px;
  justify-content: center;
}

.mobile-grade-option:hover {
  border-color: var(--primary-color);
  transform: translateY(-2px);
  box-shadow: var(--box-shadow-hover);
}

.mobile-grade-option.selected {
  border-color: var(--primary-color);
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  color: white;
  transform: scale(1.05);
}

.grade-number {
  font-size: 24px;
  font-weight: var(--heading-font-weight);
  line-height: 1;
}

.grade-label {
  font-size: 12px;
  margin-top: 4px;
  opacity: 0.8;
}

.selection-check {
  position: absolute;
  top: 6px;
  right: 6px;
  width: 20px;
  height: 20px;
  background: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: var(--primary-color);
  font-weight: bold;
}

.mobile-credits-container {
  text-align: center;
}

.credits-range-display {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-3);
}

.range-min, .range-max {
  font-size: 12px;
  color: var(--gray-color);
  font-weight: 500;
}

.current-credits {
  font-size: 32px;
  font-weight: var(--heading-font-weight);
  color: var(--primary-color);
}

.mobile-slider-container {
  margin-bottom: var(--spacing-4);
}

.mobile-slider {
  width: 100%;
  height: 8px;
  -webkit-appearance: none;
  appearance: none;
  background: var(--light-gray);
  border-radius: 4px;
  outline: none;
  margin-bottom: var(--spacing-2);
  touch-action: pan-y;
  -webkit-user-select: none;
  user-select: none;
}

.mobile-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 24px;
  height: 24px;
  background: var(--primary-color);
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(67, 97, 238, 0.3);
}

.mobile-slider::-moz-range-thumb {
  width: 24px;
  height: 24px;
  background: var(--primary-color);
  border-radius: 50%;
  cursor: pointer;
  border: none;
  box-shadow: 0 2px 6px rgba(67, 97, 238, 0.3);
}

.slider-labels {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: var(--gray-color);
  padding: 0 var(--spacing-1);
}

.credits-recommendation {
  display: flex;
  justify-content: center;
  gap: var(--spacing-2);
  margin-top: var(--spacing-3);
}

.recommendation-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--spacing-2);
  border-radius: var(--border-radius-small);
  background: var(--light-color);
  transition: var(--transition-base);
  opacity: 0.5;
  min-width: 70px;
}

.recommendation-item.active {
  opacity: 1;
  background: var(--primary-color);
  color: white;
  transform: scale(1.05);
}

.rec-emoji {
  font-size: 20px;
  margin-bottom: 4px;
}

.rec-text {
  font-size: 10px;
  font-weight: 500;
  text-align: center;
  line-height: 1.2;
}

.mobile-action-bar {
  background: white;
  padding: var(--spacing-3);
  border-top: 1px solid var(--border-color);
  position: sticky;
  bottom: 0;
}

.mobile-submit-button {
  width: 100%;
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  color: white;
  border: none;
  border-radius: var(--border-radius);
  padding: 18px var(--spacing-3);
  font-size: 16px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: var(--box-shadow);
  transition: var(--transition-base);
  cursor: pointer;
  margin-bottom: var(--spacing-2);
}

.mobile-submit-button:disabled {
  background: var(--light-gray);
  color: var(--gray-color);
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.mobile-submit-button:not(:disabled):active {
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
    box-shadow: var(--box-shadow), 0 0 0 8px rgba(67, 97, 238, 0);
  }
}

.submit-text {
  flex: 1;
  text-align: left;
}

.submit-icon {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mobile-summary {
  text-align: center;
  margin-top: var(--spacing-1);
}

.summary-text {
  color: var(--gray-color);
  font-size: 12px;
  font-weight: 500;
}

/* ==========================================================================
   반응형 최적화
   ========================================================================== */
@media (max-width: 480px) {
  .mobile-title {
    font-size: 20px;
  }

  .mobile-section {
    padding: var(--spacing-3);
  }

  .mobile-grade-grid {
    gap: var(--spacing-1);
  }

  .mobile-grade-option {
    min-height: 70px;
    padding: var(--spacing-2);
  }

  .current-credits {
    font-size: 28px;
  }

  .credits-recommendation {
    gap: var(--spacing-1);
  }

  .recommendation-item {
    min-width: 60px;
    padding: var(--spacing-1);
  }
}

@media (max-width: 360px) {
  .mobile-content {
    padding: var(--spacing-2);
  }

  .mobile-section {
    margin-bottom: var(--spacing-2);
  }

  .section-icon {
    font-size: 40px;
  }

  .mobile-section-title {
    font-size: 18px;
  }
}

/* ==========================================================================
   접근성 최적화
   ========================================================================== */
@media (prefers-reduced-motion: reduce) {
  .mobile-grade-option,
  .recommendation-item,
  .pulse-animation {
    animation: none !important;
    transition: none !important;
    transform: none !important;
  }
}

@media (prefers-contrast: high) {
  .mobile-section {
    border: 2px solid var(--border-color);
  }

  .mobile-grade-option {
    border-width: 3px;
  }

  .mobile-grade-option.selected {
    border-width: 3px;
  }
}
</style>