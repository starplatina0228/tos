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
            <!-- 시간대 표시 -->
            <div class="time-column">
              <div class="time">9:00</div>
              <div class="time">10:00</div>
              <div class="time">11:00</div>
              <div class="time">12:00</div>
              <div class="time">13:00</div>
              <div class="time">14:00</div>
              <div class="time">15:00</div>
              <div class="time">16:00</div>
              <div class="time">17:00</div>
            </div>

            <!-- 실제 시간표 내용 -->
            <div class="schedule-grid">
              <template v-for="(item, index) in scheduleItems" :key="index">
                <div
                  class="schedule-item"
                  :class="item.type"
                  :style="{
                    gridColumn: `${item.day} / span 1`,
                    gridRow: `${item.startHour - 8} / span ${item.duration}`
                  }"
                >
                  <span class="item-title">{{ item.title }}</span>
                </div>
              </template>
            </div>
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
    }
  },
  data() {
    return {
      // 피드백 관련 데이터 추가
      rating: 0,
      feedbackText: '',
      feedbackSubmitted: false
    }
  },
  computed: {
    scheduleItems() {
      // props로 받은 데이터 사용
      return this.scheduleData.length > 0 ? this.scheduleData : [
        // 기본 데이터 (props가 비어있을 경우)
        { day: 1, startHour: 9, duration: 2, title: '공업수학', type: 'study' },
        { day: 1, startHour: 13, duration: 2, title: '대학영어', type: 'study' },
        { day: 2, startHour: 10, duration: 2, title: '일반물리', type: 'study' },
        { day: 3, startHour: 14, duration: 3, title: '종합설계', type: 'project' },
        { day: 4, startHour: 9, duration: 1, title: '러닝', type: 'exercise' },
        { day: 5, startHour: 11, duration: 2, title: 'OR', type: 'hobby' },
        { day: 5, startHour: 15, duration: 2, title: '알바', type: 'social' }
      ];
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
    // 피드백 관련 메소드 추가
    setRating(star) {
      this.rating = star;
    },
    submitFeedback() {
      // 여기서 실제로는 서버에 피드백을 전송할 수 있습니다
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
    }
  }
}
</script>

<style scoped>
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

.timetable-grid {
  display: flex;
  position: relative;
  margin-top: 15px;
}

.time-column {
  width: 60px;
  flex-shrink: 0;
}

.time {
  height: 60px;
  display: flex;
  align-items: start;
  justify-content: center;
  color: var(--gray-color);
  font-size: 14px;
}

.schedule-grid {
  flex-grow: 1;
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  grid-template-rows: repeat(9, 60px);
  gap: 1px;
  background-color: #f8f9fa;
}

.schedule-item {
  background-color: #e2e8f0;
  border-radius: 6px;
  padding: 8px;
  margin: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 500;
  text-align: center;
  color: white;
}

.item-title {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

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

/* 반응형 디자인 */
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
/* 피드백 섹션 스타일 */
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

.action-buttons.with-margin {
  margin-top: 0;
}
</style>