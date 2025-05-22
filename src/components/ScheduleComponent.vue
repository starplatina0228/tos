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

      <!-- 선택된 과목 정보 표시 섹션 -->
      <div class="course-info" v-if="coursesSummary">
        <h2 class="info-title">선택된 과목 정보</h2>
        <div class="info-grid">
          <!-- 전체 요약 -->
          <div class="info-card summary-card">
            <h3>수강 요약</h3>
            <p><strong>총 학점:</strong> {{ coursesSummary.totalCredits }}학점</p>
            <p><strong>총 과목 수:</strong> {{ coursesSummary.totalCourses }}개</p>
          </div>

          <!-- 학점별 분류 -->
          <div class="info-card">
            <h3>학점별 분류</h3>
            <p><strong>전공필수:</strong> {{ coursesSummary.creditsByCategory.전공필수 || 0 }}학점</p>
            <p><strong>전공선택:</strong> {{ coursesSummary.creditsByCategory.전공선택 || 0 }}학점</p>
            <p><strong>공학기초:</strong> {{ coursesSummary.creditsByCategory.공학기초 || 0 }}학점</p>
            <p><strong>기타:</strong> {{ (coursesSummary.creditsByCategory.교양 || 0) + (coursesSummary.creditsByCategory.기타 || 0) }}학점</p>
          </div>

          <!-- 학년별 수강 과목 -->
          <div class="info-card">
            <h3>학년별 수강 과목</h3>
            <p v-for="(count, grade) in coursesSummary.coursesByGrade" :key="grade">
              <strong>{{ grade }}:</strong> {{ count }}과목
            </p>
          </div>
        </div>

        <!-- 과목 상세 목록 -->
        <div class="course-list">
          <h3 class="course-list-title">수강 과목 목록</h3>
          <div class="course-items">
            <div v-for="course in selectedCourses" :key="course.subjId" class="course-item">
              <div class="course-header">
                <span class="course-name">{{ course.subjKnm || course.name }}</span>
                <span class="course-credits">{{ parseCredits(course.crd || course.credits) }}학점</span>
              </div>
              <div class="course-details">
                <span class="course-category">{{ course.curiCparNm || course.category }}</span>
                <span class="course-grade">{{ course.grade }}학년</span>
                <span class="course-professor">{{ course.wkLecrEmpnm || course.professor }}</span>
              </div>
              <div class="course-schedule">
                <span v-for="(schedule, idx) in (course.schedules || course.schedule_info)" :key="idx" class="schedule-time">
                  {{ getDayKorean(schedule.day) }} {{ formatTimeSlot(schedule.start_time || schedule.start) }}-{{ formatTimeSlot(schedule.end_time || schedule.end) }}
                  <span v-if="schedule.location" class="schedule-location">({{ schedule.location }})</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 피드백 섹션 -->
      <div class="feedback-section" v-if="!feedbackSubmitted">
        <h2 class="feedback-title">시간표 피드백</h2>
        <p class="feedback-description">생성된 시간표에 대한 의견을 알려주세요!</p>

        <!-- 피드백 폼 부분 -->
        <div class="feedback-form">
          <textarea
            v-model="feedbackText"
            class="feedback-input"
            placeholder="시간표 최적화 서비스에 대한 개선사항 및 의견을 자유롭게 작성해주세요."
            rows="4"
            :disabled="isSubmitting"
          ></textarea>

          <div v-if="feedbackError" class="feedback-error">
            {{ feedbackError }}
          </div>

          <button
            class="submit-button"
            @click="submitFeedback"
            :disabled="isSubmitting"
          >
            <span v-if="isSubmitting">제출 중...</span>
            <span v-else>피드백 제출</span>
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
        <button
          class="action-button save-button"
          @click="onSave"
          :disabled="isSaving"
        >
          <span v-if="isSaving">
            <span class="loading-spinner"></span> 저장 중...
          </span>
          <span v-else>
            저장하기
          </span>
        </button>
      </div>

      <!-- 저장 결과 메시지 -->
      <div v-if="saveSuccess" class="save-notification success">
        <span class="notification-icon">✓</span>
        시간표가 클립보드에 복사되었습니다!
      </div>

      <div v-if="saveError" class="save-notification error">
        <span class="notification-icon">⚠</span>
        {{ saveError }}
      </div>
    </div>
  </div>
</template>

<script>
import { API_CONFIG } from '@/config/api';
import html2canvas from 'html2canvas';

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
    },
    userPreferences: {
      type: Object,
      default: () => ({
        grade: null,
        desired_credits: null,
        user_morning: false,
        user_late: false,
        user_lunch: false,
        user_dayoff: false,
        user_no_large_gap: false,
        excluded_courses: []
      })
    }
  },
  data() {
    return {
      // 피드백 관련 데이터
      feedbackText: '',
      feedbackSubmitted: false,
      coursesSummary: null,
      selectedCourses: [],
      isSubmitting: false,
      feedbackError: null,
      isSaving: false,         // 저장 중 상태
      saveSuccess: false,      // 저장 성공 상태
      saveError: null          // 저장 오류 메시지
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
    // 선택된 과목 정보 처리
    if (this.$props.apiResult && this.$props.apiResult.selected) {
      this.processSelectedCourses(this.$props.apiResult.selected);
    }
  },
  methods: {
    onRestart() {
      this.$emit('restart');
    },

    async submitFeedback() {
      try {

        // 로딩 상태 시작
        this.isSubmitting = true;
        this.feedbackError = null;

        // 피드백 데이터 준비
        const feedbackData = {
          // rating: this.rating,
          comment: this.feedbackText || "",
          schedule: this.scheduleData || [],
          // 부모 컴포넌트에서 전달받은 사용자 설정 정보 사용
          preferences: this.userPreferences
        };

        console.log('피드백 제출 데이터:', feedbackData);

        // API URL 설정
        const apiUrl = API_CONFIG.getFullUrl(API_CONFIG.endpoints.FEEDBACK);

        // API 호출
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(feedbackData)
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error('서버 오류 응답:', errorData);
          throw new Error(`서버 응답 오류: ${response.status}`);
        }

        const result = await response.json();
        console.log('피드백 제출 결과:', result);

        // 피드백 제출 상태로 변경
        this.feedbackSubmitted = true;

        // 제출 완료 메시지로 스크롤
        setTimeout(() => {
          const successEl = document.querySelector('.feedback-success');
          if (successEl) {
            successEl.scrollIntoView({ behavior: 'smooth' });
          }
        }, 100);

      } catch (error) {
        console.error('피드백 제출 오류:', error);
        this.feedbackError = "피드백 제출 중 오류가 발생했습니다. 나중에 다시 시도해주세요.";
      } finally {
        this.isSubmitting = false;
      }
    },

    // 시간표를 이미지로 저장하는 메소드
    async onSave() {
      // 이미 저장 중이면 중복 실행 방지
      if (this.isSaving) return;

      // 상태 초기화
      this.isSaving = true;
      this.saveSuccess = false;
      this.saveError = null;

      try {
        // 1. 시간표 컨테이너 요소 찾기
        const timetableEl = document.querySelector('.timetable-container');
        if (!timetableEl) {
          throw new Error('시간표 요소를 찾을 수 없습니다.');
        }

        // 2. HTML2Canvas로 시간표 캡처
        const canvas = await html2canvas(timetableEl, {
          backgroundColor: '#ffffff',     // 배경색 설정
          scale: 2,                       // 고화질을 위한 스케일 2배 설정
          useCORS: true,                  // 크로스 오리진 이미지 허용
          logging: false                  // 디버그 로그 비활성화
        });

        // 3. 캔버스를 PNG Blob으로 변환
        canvas.toBlob(async (blob) => {
          try {
            // 4. 클립보드 API 지원 확인
            if (navigator.clipboard && navigator.clipboard.write) {
              // 최신 클립보드 API 사용 (Chrome, Edge, Firefox)
              const clipboardItem = new ClipboardItem({ 'image/png': blob });
              await navigator.clipboard.write([clipboardItem]);

              // 성공 메시지 표시
              this.saveSuccess = true;

              // 3초 후 성공 메시지 숨기기
              setTimeout(() => {
                this.saveSuccess = false;
              }, 3000);

            } else {
              // 구형 브라우저용 대체 방법: 다운로드로 제공
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = '내_시간표.png';
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);

              // 다운로드 성공 메시지
              this.saveSuccess = true;
              setTimeout(() => {
                this.saveSuccess = false;
              }, 3000);
            }
          } catch (clipError) {
            console.error('클립보드 저장 실패:', clipError);
            this.saveError = '클립보드에 저장할 수 없습니다. 권한을 확인하거나 다시 시도해주세요.';
          } finally {
            this.isSaving = false;
          }
        }, 'image/png');

      } catch (error) {
        console.error('이미지 생성 오류:', error);
        this.saveError = '시간표 이미지를 생성할 수 없습니다. 다시 시도해주세요.';
        this.isSaving = false;
      }
    },

    // 선택된 과목 정보 처리
    processSelectedCourses(selectedCourses) {
      this.selectedCourses = selectedCourses;

      // 요약 정보 생성
      const totalCredits = selectedCourses.reduce((sum, course) => {
        // 학점 정보 파싱 (예: "3(0)" -> 3)
        const credits = this.parseCredits(course.crd || course.credits);
        return sum + credits;
      }, 0);
      const totalCourses = selectedCourses.length;

      // 카테고리별 학점 계산
      const creditsByCategory = {};
      selectedCourses.forEach(course => {
        const category = course.curiCparNm || course.category || '기타';
        const credits = this.parseCredits(course.crd || course.credits);
        creditsByCategory[category] = (creditsByCategory[category] || 0) + credits;
      });

      // 학년별 과목 수 계산
      const coursesByGrade = {};
      selectedCourses.forEach(course => {
        const grade = course.grade || '미분류';
        coursesByGrade[grade] = (coursesByGrade[grade] || 0) + 1;
      });

      this.coursesSummary = {
        totalCredits,
        totalCourses,
        creditsByCategory,
        coursesByGrade
      };
    },

    // 학점 정보 파싱 함수 추가
    parseCredits(creditString) {
      if (typeof creditString === 'number') return creditString;
      if (typeof creditString === 'string') {
        // "3(0)" 형태에서 첫 번째 숫자 추출
        const match = creditString.match(/^(\d+)/);
        return match ? parseInt(match[1]) : 0;
      }
      return 0;
    },

    // 요일 한글 변환
    getDayKorean(day) {
      const dayMap = {
        'MON': '월', 'TUE': '화', 'WED': '수', 'THU': '목', 'FRI': '금',
        'monday': '월', 'tuesday': '화', 'wednesday': '수', 'thursday': '목', 'friday': '금'
      };
      return dayMap[day] || day;
    },

    // 시간 슬롯 포맷팅 (MongoDB 데이터용)
    formatTimeSlot(timeSlot) {
      if (typeof timeSlot === 'number') {
        // 1교시=9:00, 2교시=9:30, ... 형태로 변환
        const hour = Math.floor((timeSlot - 1) / 2) + 9;
        const minute = ((timeSlot - 1) % 2) * 30;
        return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      }
      return timeSlot;
    },

    // 시간 포맷팅
    formatTime(timeSlot) {
      // timeSlot이 숫자라면 시간으로 변환
      if (typeof timeSlot === 'number') {
        const hour = Math.floor(timeSlot / 2) + 9; // 9시부터 시작
        const minute = (timeSlot % 2) * 30;
        return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      }
      return timeSlot;
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
   5. 선택된 과목 정보 섹션
   ========================================================================== */
.course-info {
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
  margin-bottom: 30px;
}

.info-card {
  background-color: #f8f9fa;
  border-radius: 10px;
  padding: 15px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
}

.summary-card {
  background-color: #e6f3ff;
  border-left: 4px solid var(--primary-color);
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

/* 과목 목록 스타일 */
.course-list {
  margin-top: 20px;
}

.course-list-title {
  font-size: 18px;
  color: var(--dark-color);
  margin-bottom: 15px;
  padding-bottom: 8px;
  border-bottom: 2px solid var(--primary-color);
}

.course-items {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.course-item {
  background-color: white;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: box-shadow 0.2s;
}

.course-item:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.course-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.course-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--dark-color);
}

.course-credits {
  background-color: var(--primary-color);
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.course-details {
  display: flex;
  gap: 12px;
  margin-bottom: 8px;
  flex-wrap: wrap;
}

.course-category, .course-grade, .course-professor {
  font-size: 13px;
  color: var(--gray-color);
  background-color: #f8f9fa;
  padding: 3px 8px;
  border-radius: 6px;
}

.course-schedule {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.schedule-time {
  font-size: 13px;
  color: var(--primary-color);
  background-color: #e6f3ff;
  padding: 4px 8px;
  border-radius: 6px;
  font-weight: 500;
}

.schedule-location {
  color: var(--gray-color);
  font-weight: normal;
}

/* ==========================================================================
   6. 액션 버튼
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

.restart-button:hover {
  background-color: #dee2e6;
}

.save-button {
  background-color: var(--primary-color);
  color: white;
}

.save-button:hover:not(:disabled) {
  background-color: var(--secondary-color);
}

.save-button:disabled {
  background-color: #cbd5e0;
  color: #9ca3af;
  cursor: not-allowed;
}

/* 로딩 스피너 애니메이션 */
.loading-spinner {
  display: inline-block;
  width: 12px;
  height: 12px;
  border: 2px solid rgba(255,255,255,0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s ease-in-out infinite;
  margin-right: 8px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* 알림 메시지 스타일 */
.save-notification {
  position: fixed;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  padding: 12px 20px;
  border-radius: 8px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  animation: slide-up 0.3s ease, fade-out 0.3s ease 2.7s forwards;
}

.save-notification.success {
  background-color: #10b981;
  color: white;
}

.save-notification.error {
  background-color: #ef4444;
  color: white;
}

.notification-icon {
  font-size: 18px;
}

@keyframes slide-up {
  from { transform: translate(-50%, 20px); opacity: 0; }
  to { transform: translate(-50%, 0); opacity: 1; }
}

@keyframes fade-out {
  from { opacity: 1; }
  to { opacity: 0; }
}

/* ==========================================================================
   7. 피드백 섹션
   ========================================================================== */
.feedback-section {
  padding: 30px;
  border-top: 1px solid #e9ecef;
}

.feedback-title {
  color: var(--dark-color);
  font-size: 22px;
  margin-bottom: 10px;
  text-align: center;
}

.feedback-description {
  color: var(--gray-color);
  margin-bottom: 20px;
  text-align: center;
}

/* 피드백 폼 */
.feedback-form {
  display: flex;
  flex-direction: column;
  align-items: center; /* 중앙 정렬 */
  gap: 15px;
  margin-top: 15px;
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
  padding: 12px 24px;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  width: auto; /* 버튼 너비를 컨텐츠에 맞게 자동 조정 */
  min-width: 200px; /* 최소 너비 지정 */
  text-align: center; /* 텍스트 중앙 정렬 */
}

.submit-button:hover {
  background-color: var(--secondary-color);
  transform: translateY(-2px);
}

.submit-button:hover:not(:disabled) {
  background-color: var(--secondary-color);
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(67, 97, 238, 0.3);
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

.feedback-error {
  color: #e53e3e;
  background-color: #fff5f5;
  border-left: 3px solid #e53e3e;
  padding: 10px;
  margin-bottom: 15px;
  border-radius: 4px;
  font-size: 14px;
}

.submit-button:disabled {
  background-color: #cbd5e0;
  color: #a0aec0;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
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

  .info-grid {
    grid-template-columns: 1fr;
  }

  .course-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .course-details {
    gap: 8px;
  }

  .schedule-time {
    font-size: 12px;
  }
}
</style>