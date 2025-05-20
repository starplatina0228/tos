<template>
  <div class="grade-select-container">
    <div class="grade-select-card">
      <h1 class="title">기본 정보 입력</h1>

      <div class="select-section">
        <h2 class="section-title">학년 선택</h2>
        <div class="button-group">
          <button
            v-for="g in [2, 3, 4]"
            :key="g"
            class="option-button"
            :class="{ 'selected': grade === g }"
            @click="selectGrade(g)"
          >
            {{ g }}학년
          </button>
        </div>
      </div>

      <div class="select-section">
        <h2 class="section-title">희망 수강 학점</h2>
        <div class="credits-slider">
          <input
            type="range"
            min="12"
            max="21"
            step="1"
            v-model.number="localCredits"
            class="slider"
          />
          <div class="credits-value">{{ localCredits }}학점</div>
        </div>
      </div>

      <button
        class="action-button primary-button"
        :disabled="!grade"
        @click="submitInfo"
      >
        다음으로
      </button>
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
      default: 15
    }
  },
  data() {
    return {
      grade: this.initialGrade,
      localCredits: this.initialCredits
    }
  },
  methods: {
    selectGrade(grade) {
      this.grade = grade;
    },
    submitInfo() {
      if (this.grade) {
        this.$emit('info-submitted', {
          grade: this.grade,
          credits: this.localCredits
        });
      }
    }
  }
}
</script>

<style scoped>
.grade-select-container {
  width: 100%;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  padding: 20px;
  box-sizing: border-box;
}

.grade-select-card {
  background-color: white;
  border-radius: 16px;
  padding: 40px;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
}

.title {
  color: var(--dark-color);
  font-size: 28px;
  margin-bottom: 30px;
  text-align: center;
}

.select-section {
  margin-bottom: 30px;
}

.section-title {
  font-size: 18px;
  color: var(--gray-color);
  margin-bottom: 15px;
}

.button-group {
  display: flex;
  justify-content: space-between;
  gap: 10px;
}

.option-button {
  flex: 1;
  padding: 12px;
  border: 2px solid #e5e7eb;
  background-color: white;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.option-button:hover {
  border-color: var(--primary-color);
}

.option-button.selected {
  background-color: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

.credits-slider {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.slider {
  width: 100%;
  margin-bottom: 15px;
  height: 8px;
  -webkit-appearance: none;
  appearance: none;
  background: #e5e7eb;
  outline: none;
  border-radius: 4px;
}

.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  background: var(--primary-color);
  border-radius: 50%;
  cursor: pointer;
}

.credits-value {
  font-size: 24px;
  font-weight: 600;
  color: var(--primary-color);
}

.action-button {
  width: 100%;
  padding: 15px;
  border-radius: 8px;
  background-color: var(--primary-color);
  color: white;
  font-size: 16px;
  font-weight: 500;
  border: none;
  margin-top: 20px;
  transition: all 0.2s ease;
}

.action-button:disabled {
  background-color: #e5e7eb;
  color: #9ca3af;
  cursor: not-allowed;
}

.action-button:not(:disabled):hover {
  background-color: var(--secondary-color);
  transform: translateY(-2px);
}
</style>