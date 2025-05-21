<template>
  <div class="schedule-container">
    <div class="schedule-card">
      <div class="schedule-header">
        <h1 class="title">당신의 시간표는</h1>
        <p class="subtitle">맞춤형 일정을 확인해보세요</p>
      </div>

      <div class="schedule-content">
        <div class="timetable">
          <div class="day-header">
            <div class="time-slot"></div>
            <div class="day">월</div>
            <div class="day">화</div>
            <div class="day">수</div>
            <div class="day">목</div>
            <div class="day">금</div>
          </div>

          <div class="timetable-grid">
            <div class="grid-container">
              <!-- 시간대 표시 -->
              <div class="time-column">
                <div class="time">9:00</div>
                <div class="time">9:30</div>
                <div class="time">10:00</div>
                <div class="time">10:30</div>
                <div class="time">11:00</div>
                <div class="time">11:30</div>
                <div class="time">12:00</div>
                <div class="time">12:30</div>
                <div class="time">13:00</div>
                <div class="time">13:30</div>
                <div class="time">14:00</div>
                <div class="time">14:30</div>
                <div class="time">15:00</div>
                <div class="time">15:30</div>
                <div class="time">16:00</div>
                <div class="time">16:30</div>
                <div class="time">17:00</div>
                <div class="time">17:30</div>
              </div>

              <!-- 실제 시간표 내용 -->
              <div class="schedule-grid">
                <!-- 배경 격자 생성 -->
                <div v-for="i in 18" :key="`grid-row-${i}`" class="grid-row-divider" :style="{top: `${i * 30}px`}"></div>

                <!-- 스케줄 아이템 -->
                <template v-for="(item, index) in scheduleItems" :key="index">
                  <div
                    class="schedule-item"
                    :class="item.type"
                    :style="{
                      gridColumn: `${item.day} / span 1`,
                      gridRow: `${calculateGridRow(item.startHour, item.startMinute)} / span ${calculateGridSpan(item.duration)}`
                    }"
                  >
                    <span class="item-title">{{ item.title }}</span>
                    <span v-if="item.location" class="item-location">{{ item.location }}</span>
                  </div>
                </template>
              </div>
            </div>
          </div>

        </div>
      </div>

      <!-- 최적화 정보 표시 섹션 -->
      <div class="optimization-info" v-if="optimizationSummary">
        <h2 class="info-title">최적화 정보</h2>
        <div class="info-grid">
          <div class="info-card">
            <h3>과목 정보</h3>
            <p><strong>총 학점:</strong> {{ optimizationSummary.totalCredits }}학점</p>
            <p><strong>총 과목 수:</strong> {{ optimizationSummary.totalCourses }}개</p>
          </div>
          <div class="info-card">
            <h3>최적화 점수</h3>
            <p><strong>목적 함수 값:</strong> {{ Math.round(optimizationSummary.objectiveValue * 100) / 100 }}</p>
            <p><strong>Priority 점수:</strong> {{ optimizationSummary.breakdown.priority }}</p>
          </div>
          <div class="info-card">
            <h3>선호도 반영</h3>
            <p><strong>아침 수업:</strong> {{ optimizationSummary.breakdown.mor }}</p>
            <p><strong>저녁 수업:</strong> {{ optimizationSummary.breakdown.late }}</p>
            <p><strong>점심 시간대:</strong> {{ optimizationSummary.breakdown.lunch }}</p>
            <p><strong>공강일:</strong> {{ optimizationSummary.breakdown.freeday }}</p>
            <p><strong>긴 공강:</strong> {{ optimizationSummary.breakdown.longgap }}</p>
          </div>
        </div>
      </div>

      <!-- 피드백 섹션 -->
      <div class="feedback-section" v-if="!feedbackSubmitted">
        <h2 class="feedback-title">시간표 피드백</h2>
        <p class="feedback-description">생성된 시간표에 대한 의견을 알려주세요!</p>

        <div class="star-rating">
          <span class="rating-label">만족도:</span>
          <div class="stars">
            <span
              v-for="star in 5"
              :key="star"
              class="star"
              :class="{ 'active': star <= rating }"
              @click="setRating(star)"
            >★</span>
          </div>
        </div>

        <div class="feedback-form">
          <textarea
            v-model="feedbackText"
            class="feedback-input"
            placeholder="이 시간표에 대한 의견을 자유롭게 작성해주세요..."
            rows="4"
          ></textarea>

          <button class="action-button submit-button" @click="submitFeedback">
            피드백 제출
          </button>
        </div>
      </div>

      <!-- 피드백 제출 성공 메시지 -->
      <div class="feedback-success" v-else>
        <div class="success-icon">✓</div>
        <h2 class="success-title">피드백이 제출되었습니다!</h2>
        <p class="success-message">소중한 의견 감사합니다.</p>
      </div>

      <!-- 액션 버튼 -->
      <div class="action-buttons" :class="{ 'with-margin': feedbackSubmitted }">
        <button class="action-button restart-button" @click="onRestart">
          다시 시작
        </button>
        <button class="action-button save-button" @click="onSave">
          저장하기
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ScheduleComponent',
  props: {
    scheduleData: {
      type: Array,
      default: () => []
    },
    apiResult: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      // 피드백 관련 데이터
      rating: 0,
      feedbackText: '',
      feedbackSubmitted: false,
      optimizationSummary: null
    }
  },
  computed: {
    scheduleItems() {
      if (this.scheduleData.length > 0) {
        return this.scheduleData;
      } else {
        return this.generateDummySchedule();
      }
    }
  },
  created() {
    // 최적화 결과 요약 정보 생성
    if (this.$props.scheduleData && this.$props.apiResult) {
      this.processOptimizationSummary(this.$props.apiResult);
    }
  },
  methods: {
    onRestart() {
      this.$emit('restart');
    },
    onSave() {
      // 저장 로직 구현
      alert('시간표가 저장되었습니다!');
    },
    // 피드백 관련 메소드 구현해야 함
    setRating(star) {
      this.rating = star;
    },
    submitFeedback() {
      console.log('피드백 제출:', {
        rating: this.rating,
        feedback: this.feedbackText
      });

      // 피드백 제출 상태로 변경
      this.feedbackSubmitted = true;

      // 제출 완료 메시지로 스크롤
      setTimeout(() => {
        const successEl = document.querySelector('.feedback-success');
        if (successEl) {
          successEl.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    },
    // 최적화 정보 처리
    processOptimizationSummary(result) {
      if (result && result.selected) {
        this.optimizationSummary = {
          totalCredits: result.total_credits || 0,
          totalCourses: result.selected.length || 0,
          objectiveValue: result.objective_value || 0,
          breakdown: result.breakdown || {
            priority: 0,
            dev: 0,
            mor: 0,
            late: 0,
            lunch: 0,
            freeday: 0,
            longgap: 0
          }
        };
      }
    },
    // 더미 시간표 생성 함수
    generateDummySchedule() {
      return [
        { day: 1, startHour: 9, duration: 2, title: '공업수학', type: 'study' },
        { day: 1, startHour: 13, duration: 2, title: '대학영어', type: 'study' },
        { day: 2, startHour: 10, duration: 2, title: '일반물리', type: 'study' },
        { day: 3, startHour: 14, duration: 3, title: '종합설계', type: 'project' },
        { day: 4, startHour: 9, duration: 1, title: '러닝', type: 'exercise' },
        { day: 5, startHour: 11, duration: 2, title: 'OR', type: 'hobby' },
        { day: 5, startHour: 15, duration: 2, title: '알바', type: 'social' }
      ];
    },
    // 시간을 그리드 행 번호로 변환
    calculateGridRow(hour, minute) {
      // 9시부터 시작, 30분마다 1행
      const hourOffset = (hour - 9) * 2;
      const minuteOffset = minute === 30 ? 1 : 0;
      return hourOffset + minuteOffset + 1; // 1-based grid rows
    },

    // 시간 단위 기간을 그리드 행 범위로 변환
    calculateGridSpan(durationHours) {
      // 시간을 행 수로 변환 (1시간 = 2행)
      return durationHours * 2;
    }
  }
}
</script>

<style scoped>
/* ==========================================================================
   1. 기본 컨테이너 및 카드 레이아웃
   ========================================================================== */
.schedule-container {
  width: 100%;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  padding: 20px;
  box-sizing: border-box;
}

.schedule-card {
  background-color: white;
  border-radius: 16px;
  overflow: hidden;
  width: 100%;
  max-width: 900px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
}

/* ==========================================================================
   2. 헤더 스타일
   ========================================================================== */
.schedule-header {
  padding: 30px;
  text-align: center;
  border-bottom: 1px solid #e9ecef;
}

.title {
  color: var(--dark-color);
  font-size: 28px;
  margin-bottom: 8px;
  font-weight: var(--heading-font-weight);
}

.subtitle {
  color: var(--gray-color);
  font-size: 16px;
  margin: 0;
}

/* ==========================================================================
   3. 시간표 구조 및 그리드
   ========================================================================== */
.schedule-content {
  padding: 30px;
}

.timetable {
  width: 100%;
  overflow-x: auto;
}

.day-header {
  display: grid;
  grid-template-columns: 60px repeat(5, 1fr);
  text-align: center;
  font-weight: 600;
  border-bottom: 1px solid #e9ecef;
  padding-bottom: 10px;
}

.day {
  padding: 10px;
}

.grid-container {
  display: flex;
  width: 100%;
  position: relative; /* 자식 요소의 절대 위치 기준 */
}

.time-column {
  width: 60px;
  flex-shrink: 0;
  z-index: 2; /* 그리드보다 위에 표시 */
  background-color: #f8f9fa;
  border-right: 1px solid #e9ecef;
}

.time {
  height: 30px; /* 30분 단위 행 높이 */
  display: flex;
  align-items: center; /* 중앙 정렬로 변경 */
  justify-content: center;
  color: var(--gray-color);
  font-size: 12px;
  border-bottom: 1px solid #e9ecef; /* 구분선 추가 */
  box-sizing: border-box;
}

/* 스케줄 그리드 개선 */
.schedule-grid {
  flex-grow: 1;
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  grid-template-rows: repeat(18, 30px); /* 30분 단위, 9:00-17:30 */
  position: relative;
  min-height: 540px; /* 18행 * 30px */
  border: 1px solid #e9ecef;
  border-left: none;
}

/* 그리드 행 구분선 */
.grid-row-divider {
  position: absolute;
  left: 0;
  right: 0;
  height: 1px;
  background-color: #e9ecef;
  z-index: 1;
}

/* 스케줄 아이템 스타일 개선 */
.schedule-item {
  background-color: #e2e8f0;
  border-radius: 6px;
  padding: 4px;
  margin: 2px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 500;
  text-align: center;
  color: white;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 5; /* 배경 격자보다 위에 표시 */
  transition: transform 0.2s, box-shadow 0.2s;
}

.schedule-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  z-index: 10; /* 호버 시 다른 아이템보다 위에 표시 */
}

/* ==========================================================================
   4. 시간표 항목 및 유형별 스타일
   ========================================================================== */
.schedule-item {
  background-color: #e2e8f0;
  border-radius: 6px;
  padding: 4px;
  margin: 1px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 500;
  text-align: center;
  color: white;
  overflow: hidden;
}

.item-title {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: bold;
  margin-bottom: 2px;
}

.item-location {
  font-size: 0.8rem;
  opacity: 0.8;
}

/* 스케줄 항목 유형별 색상 */
.study {
  background-color: var(--primary-color);
}

.project {
  background-color: #38b2ac;
}

.exercise {
  background-color: #ed8936;
}

.hobby {
  background-color: #9f7aea;
}

.social {
  background-color: #f56565;
}

/* ==========================================================================
   5. 액션 버튼
   ========================================================================== */
.action-buttons {
  display: flex;
  justify-content: center;
  gap: 16px;
  padding: 30px;
  border-top: 1px solid #e9ecef;
}

.action-button {
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  border: none;
  transition: all 0.2s ease;
}

.restart-button {
  background-color: #e9ecef;
  color: var(--gray-color);
}

.save-button {
  background-color: var(--primary-color);
  color: white;
}

.restart-button:hover {
  background-color: #dee2e6;
}

.save-button:hover {
  background-color: var(--secondary-color);
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(67, 97, 238, 0.3);
}

.action-buttons.with-margin {
  margin-top: 0;
}

/* ==========================================================================
   6. 피드백 섹션
   ========================================================================== */
.feedback-section {
  padding: 30px;
  border-top: 1px solid #e9ecef;
}

.feedback-title {
  color: var(--dark-color);
  font-size: 22px;
  margin-bottom: 10px;
}

.feedback-description {
  color: var(--gray-color);
  margin-bottom: 20px;
}

/* 별점 평가 */
.star-rating {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.rating-label {
  margin-right: 15px;
  font-weight: 500;
}

.stars {
  display: flex;
}

.star {
  font-size: 28px;
  color: #d1d5db;
  cursor: pointer;
  transition: color 0.2s;
  margin-right: 5px;
}

.star:hover, .star.active {
  color: #fbbf24;
}

/* 피드백 폼 */
.feedback-form {
  margin-bottom: 20px;
}

.feedback-input {
  width: 100%;
  padding: 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  resize: vertical;
  font-family: inherit;
  margin-bottom: 15px;
}

.submit-button {
  background-color: var(--primary-color);
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.3s;
}

.submit-button:hover {
  background-color: var(--secondary-color);
  transform: translateY(-2px);
}

/* 피드백 성공 메시지 */
.feedback-success {
  padding: 30px;
  text-align: center;
  border-top: 1px solid #e9ecef;
}

.success-icon {
  background-color: #10b981;
  color: white;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  margin: 0 auto 20px;
}

.success-title {
  color: var(--dark-color);
  font-size: 22px;
  margin-bottom: 10px;
}

.success-message {
  color: var(--gray-color);
}

/* ==========================================================================
   7. 최적화 정보 섹션
   ========================================================================== */
.optimization-info {
  padding: 30px;
  border-top: 1px solid #e9ecef;
}

.info-title {
  color: var(--dark-color);
  font-size: 22px;
  margin-bottom: 20px;
  text-align: center;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.info-card {
  background-color: #f8f9fa;
  border-radius: 10px;
  padding: 15px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
}

.info-card h3 {
  font-size: 18px;
  margin-bottom: 10px;
  color: var(--primary-color);
  font-weight: 600;
}

.info-card p {
  margin: 8px 0;
  font-size: 14px;
  color: var(--gray-color);
}

.info-card strong {
  color: var(--dark-color);
}

/* ==========================================================================
   8. 반응형 디자인 (미디어 쿼리)
   ========================================================================== */
@media (max-width: 768px) {
  .schedule-card {
    max-width: 95%;
  }

  .title {
    font-size: 24px;
  }

  .schedule-item {
    font-size: 12px;
    padding: 4px;
  }
}
</style>