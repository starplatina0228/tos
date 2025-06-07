<template>
  <div class="optimization-container" :class="{ 'mobile-view': isMobile }">
    <div v-if="!isMobile" class="desktop-layout">
      <div class="optimization-card">
        <div class="status-message" :class="{
          'completed': optimizationCompleted,
          'error': optimizationFailed
        }">
          <template v-if="optimizationCompleted && !reoptimizing">
            최적화 완료! 당신의 맞춤형 시간표가 준비되었습니다.
            <div class="taken-course-hint">
              시간표의 강의를 클릭하여 제외하고 다시 최적화할 수 있습니다.
            </div>
          </template>
          <template v-else-if="reoptimizing">
            선택한 강의를 제외하고 시간표를 다시 최적화하는 중...
          </template>
          <template v-else-if="optimizationFailed">
            {{ statusMessage }}
            <div class="error-hint">
              <p>시스템 오류가 발생했습니다. 다음 방법을 시도해보세요:</p>
              <ul>
                <li>페이지를 새로고침하고 다시 시도</li>
                <li>다른 옵션으로 시도</li>
                <li>문제가 지속되면 관리자에게 문의</li>
              </ul>
              <button class="retry-button" @click="retryOptimization">다시 시도</button>
            </div>
          </template>
          <template v-else>
            {{ statusMessage }}
          </template>
        </div>

        <div class="timetable-container">
          <div class="timetable">
            <div class="timetable-row header-row">
              <div class="timetable-cell time-header-cell"></div>
              <div class="timetable-cell header-cell">월</div>
              <div class="timetable-cell header-cell">화</div>
              <div class="timetable-cell header-cell">수</div>
              <div class="timetable-cell header-cell">목</div>
              <div class="timetable-cell header-cell">금</div>
            </div>

            <div v-for="(row, rowIndex) in timetableCells" :key="`row-${rowIndex}`" class="timetable-row">
              <div class="timetable-cell time-cell">{{ getTimeLabel(rowIndex) }}</div>
              <div
                v-for="(cell, colIndex) in row"
                :key="`cell-${rowIndex}-${colIndex}`"
                class="timetable-cell day-cell"
                :class="{
                  'selected-for-removal': cell.courseId && excludedCourses.includes(cell.courseId)
                }"
                :style="{
                  backgroundColor: cell.color,
                  opacity: cell.opacity
                }"
                @click="cell.courseId ? toggleCourseExclusion(cell) : null"
              >
                <div v-if="cell.title" class="cell-content">
                  <div class="cell-title">{{ cell.title }}</div>
                  <div v-if="cell.location" class="cell-location">{{ cell.location }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="excludedCourses.length > 0" class="selected-courses-info">
          <p>{{ excludedCourses.length }}개의 강의가 제외되었습니다.</p>
          <div class="button-stack">
            <button
              class="reoptimize-button"
              @click="reoptimizeSchedule"
              :disabled="reoptimizing"
            >
              <span v-if="!reoptimizing">선택 강의 제외하고 재최적화</span>
              <span v-else>재최적화 중...</span>
            </button>
            <button
              v-if="optimizationCompleted && !reoptimizing"
              class="action-button primary-button"
              @click="onContinue"
            >
              시간표 확인하기
            </button>
          </div>
        </div>

        <div class="button-container" v-if="optimizationCompleted && !reoptimizing && excludedCourses.length === 0">
          <button class="action-button primary-button" @click="onContinue">
            시간표 확인하기
          </button>
        </div>
      </div>
    </div>

    <!-- 모바일 레이아웃 -->
    <div v-else class="mobile-layout">
      <div class="mobile-header">
        <div class="mobile-progress">
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: optimizationCompleted ? '100%' : '60%' }"></div>
          </div>
          <span class="progress-text">시간표 최적화 중...</span>
        </div>
      </div>

      <div class="mobile-content">
        <div class="mobile-status-card" :class="{
          'completed': optimizationCompleted,
          'error': optimizationFailed,
          'loading': !optimizationCompleted && !optimizationFailed
        }">
          <div class="status-icon">
            <div v-if="optimizationCompleted && !reoptimizing" class="icon-success">✓</div>
            <div v-else-if="optimizationFailed" class="icon-error">⚠</div>
            <div v-else class="loading-spinner"></div>
          </div>

          <div class="status-content">
            <h2 class="mobile-status-title">
              <template v-if="optimizationCompleted && !reoptimizing">최적화 완료!</template>
              <template v-else-if="reoptimizing">재최적화 중...</template>
              <template v-else-if="optimizationFailed">최적화 실패</template>
              <template v-else>시간표 생성 중</template>
            </h2>
            <p class="mobile-status-description">{{ statusMessage }}</p>
            <p class="mobile-status-description">(이미 수강한 과목이 있다면 클릭해서 제외)</p>
          </div>
        </div>

        <div class="mobile-timetable-container">
          <h3 class="section-title">시간표 미리보기</h3>
          <div class="mobile-timetable">
            <div class="mobile-day-header">
              <div class="mobile-time-header">시간</div>
              <div class="mobile-day">월</div>
              <div class="mobile-day">화</div>
              <div class="mobile-day">수</div>
              <div class="mobile-day">목</div>
              <div class="mobile-day">금</div>
            </div>

            <!-- 수정된 모바일 시간표 그리드 -->
            <div class="mobile-grid-container">
              <template v-for="(row, rowIndex) in timetableCells" :key="`mobile-row-${rowIndex}`">
                <!-- 시간 셀 -->
                <div class="mobile-time-cell">{{ getMobileTimeLabel(rowIndex) }}</div>

                <!-- 요일별 셀들 -->
                <div
                  v-for="(cell, colIndex) in row"
                  :key="`mobile-cell-${rowIndex}-${colIndex}`"
                  class="mobile-day-cell"
                  :class="{
                    'has-content': cell.title,
                    'selected-for-removal': cell.courseId && excludedCourses.includes(cell.courseId)
                  }"
                  :style="{
                    backgroundColor: cell.color,
                    opacity: cell.opacity
                  }"
                  @click="cell.courseId ? toggleCourseExclusion(cell) : null"
                >
                  <div v-if="cell.title" class="mobile-cell-content">
                    <div class="mobile-cell-title" :title="cell.title">
                      {{ getTruncatedTitle(cell.title) }}
                    </div>
                    <div v-if="cell.location" class="mobile-cell-location">
                      {{ cell.location }}
                    </div>
                    <div class="mobile-cell-time">
                      {{ cell.timeRange }}
                    </div>
                  </div>
                </div>
              </template>
            </div>
          </div>
        </div>

        <div v-if="excludedCourses.length > 0" class="mobile-excluded-section">
          <div class="mobile-excluded-card">
            <span class="excluded-icon">🚫</span>
            <div class="excluded-info">
              <h4 class="excluded-title">제외된 강의</h4>
              <p class="excluded-count">{{ excludedCourses.length }}개 강의가 제외되었습니다</p>
            </div>
          </div>
        </div>
      </div>

      <div class="mobile-action-bar">
        <button
          v-if="optimizationCompleted && !reoptimizing && excludedCourses.length === 0"
          class="mobile-continue-button primary"
          @click="onContinue"
        >
          시간표 확인하기
        </button>

        <div v-if="excludedCourses.length > 0" class="mobile-button-group">
          <button
            class="mobile-reoptimize-button"
            @click="reoptimizeSchedule"
            :disabled="reoptimizing"
          >
            {{ reoptimizing ? '재최적화 중...' : '재최적화 실행' }}
          </button>

          <button
            v-if="optimizationCompleted && !reoptimizing"
            class="mobile-continue-button"
            @click="onContinue"
          >
            시간표 확인하기
          </button>
        </div>

        <button
          v-if="optimizationFailed"
          class="mobile-retry-button"
          @click="retryOptimization"
        >
          다시 시도
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { API_CONFIG } from '@/config/api';

export default {
  name: 'OptimizationTimetableComponent',
  props: {
    simulationTime: {
      type: Number,
      default: 4000 // 4초
    },
    optimizationData: {
      type: Object,
      default: () => ({
        grade: 2,
        desired_credits: 15,
        user_morning: false,
        user_late: false,
        user_lunch: false,
        user_dayoff: false,
        user_no_large_gap: false
      })
    }
  },

  data() {
    return {
      optimizationInterval: null,
      messageChangeInterval: null,
      optimizationCompleted: false,
      statusMessage: "시간표 최적화 진행 중...",
      optimizationResult: null,
      timetableCells: [],
      timeSlots: 20, // 9:00~18:30, 30분 단위로 18슬롯
      daysOfWeek: 5,
      colors: ['#e67e22', '#e74c3c', '#f1c40f', '#2ecc71', '#3498db', '#9b59b6'],
      optimizationMessages: [
        "사용자 선호도 분석 중...",
        "과목 간 시간 배치 최적화 중...",
        "이미 수강한 과목을 선택하면, 이를 제외하고 맞춤형 시간표를 새로 최적화합니다...",
        "시간대별 집중력 패턴 고려 중...",
        "균형 잡힌 시간표 계산 중...",
        "조성원 교수님과 상담중...",
        "최적의 학습 루틴을 설계하는 중...",
        "당신의 완벽한 하루를 계획 중...",
        "강의실 이동 동선 최적화 중...",
        "집중력과 휴식의 황금 비율 계산 중...",
        "당신의 목표에 맞춘 시간표 튜닝 중...",
        "최고의 학기 로드맵 그리는 중...",
        "시간표 최적화 알고리즘 가동 중...",
        "과목 간의 시너지 효과 분석 중...",
        "시간표의 조화로운 배치 중...",
      ],
      optimizationFailed: false,
      excludedCourses: [],      // 제외할 강의 ID 배열
      reoptimizing: false,      // 재최적화 진행 중 상태
      optimizationCount: 0,     // 최적화 실행 횟수
      isMobile: false,          // 모바일 여부
    };
  },

  mounted() {
    this.detectMobile();
    this.initTimetable();
    this.startOptimizationAnimation();
    this.callOptimizationAPI();

    window.addEventListener('resize', this.detectMobile);
  },

  beforeUnmount() {
    this.stopAnimations();
    window.removeEventListener('resize', this.detectMobile);
  },

  methods: {
    // 초기화 함수
    initTimetable() {
      // 시간표 초기화 - 30분 단위 18슬롯 (9:00~17:30)
      this.timetableCells = Array(this.timeSlots).fill().map(() =>
        Array(this.daysOfWeek).fill().map(() => ({
          color: 'white',
          opacity: 1,
          title: '',
          location: '',
          courseId: null,
          isNew: true,
          timeRange: ''
        }))
      );
    },

    // 교시를 시간 슬롯 인덱스로 변환
    convertPeriodToSlotIndex(period) {
      // 교시 1 = 9:00 (슬롯 0), 교시 2 = 9:30 (슬롯 1), ...
      const slotIndex = period - 1; // 30분 단위 슬롯 인덱스
      return slotIndex;
    },

    // 시간 레이블 생성 함수
    getTimeLabel(index) {
      const hour = Math.floor(index / 2) + 9;
      const minute = (index % 2) * 30;
      return `${hour}:${minute === 0 ? '00' : minute}`;
    },

    // 교시를 시간 문자열로 변환
    periodToTime(period) {
      const totalMinutes = (period - 1) * 30; // 교시를 분으로 변환
      const hour = Math.floor(totalMinutes / 60) + 9;
      const minute = totalMinutes % 60;
      return `${hour}:${minute === 0 ? '00' : minute}`;
    },

    startOptimizationAnimation() {
      this.messageChangeInterval = setInterval(() => {
        const randomIndex = Math.floor(Math.random() * this.optimizationMessages.length);
        this.statusMessage = this.optimizationMessages[randomIndex];
      }, 2500);

      this.optimizationInterval = setInterval(() => {
        this.updateTimetableDuringOptimization();
      }, 200);
    },

    updateTimetableDuringOptimization() {
      for (let row = 0; row < this.timeSlots; row++) {
        for (let col = 0; col < this.daysOfWeek; col++) {
          if (Math.random() > 0.7) {
            const randomValue = Math.random();
            if (randomValue > 0.8) {
              const colorIndex = Math.floor(Math.random() * this.colors.length);
              this.timetableCells[row][col].color = this.colors[colorIndex];
              this.timetableCells[row][col].opacity = Math.random() * 0.5 + 0.5;
            } else if (randomValue > 0.4) {
              this.timetableCells[row][col].color = 'white';
              this.timetableCells[row][col].opacity = 1;
            }
          }
        }
      }
    },

    async callOptimizationAPI() {
      try {
        this.optimizationInProgress = true;
        
        // API 설정에서 엔드포인트 URL 가져오기
        const apiUrl = API_CONFIG.getFullUrl(API_CONFIG.endpoints.SCHEDULE);
        console.log(`API 호출 URL: ${apiUrl}`);

        const requestData = {
          ...this.optimizationData,
          excluded_courses: this.excludedCourses
        };

        console.log(`최적화 요청 데이터 (${this.optimizationCount + 1}번째 요청):`, requestData);

        // API_CONFIG의 헬퍼 함수 사용
        this.optimizationResult = await API_CONFIG.callAPI(API_CONFIG.endpoints.SCHEDULE, {
          method: 'POST',
          body: JSON.stringify(requestData)
        });

        console.log(`최적화 결과 (${this.optimizationCount + 1}번째):`, this.optimizationResult);
        this.optimizationCount++;

        setTimeout(() => {
          this.completeOptimization();
        }, this.reoptimizing ? 2000 : this.simulationTime);
        
      } catch (error) {
        console.error('API 호출 오류:', error);
        this.stopAnimations();
        this.optimizationCompleted = false;
        this.reoptimizing = false;
        
        // 더 자세한 에러 메시지
        if (error.message.includes('Failed to fetch')) {
          this.statusMessage = "서버에 연결할 수 없습니다. 네트워크 연결을 확인해주세요.";
        } else if (error.message.includes('CORS')) {
          this.statusMessage = "서버 설정 오류입니다. 잠시 후 다시 시도해주세요.";
        } else {
          this.statusMessage = `최적화 중 오류가 발생했습니다: ${error.message}`;
        }
        
        this.optimizationFailed = true;
      }
    },

    // async callOptimizationAPI() {
    //   try {
    //     this.optimizationInProgress = true;
    //     const apiUrl = API_CONFIG.getFullUrl(API_CONFIG.endpoints.SCHEDULE);

    //     const requestData = {
    //       ...this.optimizationData,
    //       excluded_courses: this.excludedCourses
    //     };

    //     console.log(`최적화 요청 데이터 (${this.optimizationCount + 1}번째 요청):`, requestData);

    //     const response = await fetch(apiUrl, {
    //       method: 'POST',
    //       headers: { 'Content-Type': 'application/json' },
    //       body: JSON.stringify(requestData)
    //     });

    //     if (!response.ok) {
    //       throw new Error(`API 요청 실패: ${response.status}`);
    //     }

    //     this.optimizationResult = await response.json();
    //     console.log(`최적화 결과 (${this.optimizationCount + 1}번째):`, this.optimizationResult);

    //     this.optimizationCount++;

    //     setTimeout(() => {
    //       this.completeOptimization();
    //     }, this.reoptimizing ? 2000 : this.simulationTime);
    //   } catch (error) {
    //     console.error('API 호출 오류:', error);
    //     this.stopAnimations();
    //     this.optimizationCompleted = false;
    //     this.reoptimizing = false;
    //     this.statusMessage = "최적화 중 오류가 발생했습니다.";
    //     this.optimizationFailed = true;
    //   }
    // },

    showErrorUI() {
      this.optimizationResult = null;
      this.statusMessage = "시간표 최적화에 실패했습니다.";
      this.optimizationFailed = true;
    },

    completeOptimization() {
      this.stopAnimations();
      this.optimizationCompleted = true;
      this.reoptimizing = false;
      this.statusMessage = "최적화 완료! 당신의 맞춤형 시간표가 준비되었습니다.";

      if (this.optimizationResult && this.optimizationResult.selected) {
        this.displayOptimizedSchedule(this.optimizationResult.selected);

        if (this.optimizationResult.excluded && this.optimizationResult.excluded.length > 0) {
          console.log("서버에서 제외된 강의: ", this.optimizationResult.excluded);
          const excludedIds = this.optimizationResult.excluded.map(course => course.subjId);
          this.excludedCourses = excludedIds;
        }
      } else {
        this.showErrorUI();
        return;
      }

      this.takenCoursesToRemove = [];
    },

    displayOptimizedSchedule(courses) {
      this.initTimetable();

      let colorIndex = 0;

      courses.forEach(course => {
        const courseColor = this.colors[colorIndex % this.colors.length];
        colorIndex++;

        course.schedule_info.forEach(schedule => {
          const day = schedule.day;
          const start = schedule.start; // 교시 단위
          const end = schedule.end;     // 교시 단위
          const location = schedule.location || '';

          const dayIndex = this.getDayIndex(day);

          // 교시를 시간 슬롯으로 변환
          const startSlot = this.convertPeriodToSlotIndex(start);
          const endSlot = this.convertPeriodToSlotIndex(end) + 1; // end 포함

          // 시간 범위 계산
          const timeRange = `${this.periodToTime(start)} - ${this.periodToTime(end + 1)}`;

          // 시간표에 표시 - 모든 슬롯에 동일한 정보 저장
          for (let slot = startSlot; slot < endSlot; slot++) {
            if (slot >= 0 && slot < this.timeSlots && dayIndex >= 0 && dayIndex < this.daysOfWeek) {
              this.timetableCells[slot][dayIndex] = {
                color: courseColor,
                opacity: 1,
                title: course.name,
                location: location,
                courseId: course.subjId,
                timeRange: timeRange,
                isNew: true
              };
            }
          }
        });
      });
    },

    getDayIndex(dayChar) {
      const days = { '월': 0, '화': 1, '수': 2, '목': 3, '금': 4 };
      return days[dayChar] !== undefined ? days[dayChar] : -1;
    },

    stopAnimations() {
      if (this.optimizationInterval) {
        clearInterval(this.optimizationInterval);
      }
      if (this.messageChangeInterval) {
        clearInterval(this.messageChangeInterval);
      }
    },

    toggleCourseExclusion(cell) {
      if (!cell.courseId) return;

      console.log(`토글 강의: ${cell.title} (ID: ${cell.courseId})`);

      const index = this.excludedCourses.indexOf(cell.courseId);
      if (index === -1) {
        this.excludedCourses.push(cell.courseId);
      } else {
        this.excludedCourses.splice(index, 1);
      }

      console.log('선택된 제외 강의:', this.excludedCourses);
    },

    reoptimizeSchedule() {
      if (this.excludedCourses.length === 0) {
        return;
      }

      this.reoptimizing = true;
      this.optimizationCompleted = false;
      this.statusMessage = "선택한 강의를 제외하고 시간표를 다시 최적화하는 중...";

      console.log(`${this.excludedCourses.length}개 강의를 제외하고 재최적화 시작:`, this.excludedCourses);

      this.startOptimizationAnimation();
      this.callOptimizationAPI();
    },

    onContinue() {
      this.$emit('optimization-completed', this.optimizationResult);
    },

    retryOptimization() {
      this.optimizationFailed = false;
      this.statusMessage = "시간표 최적화 진행 중...";
      this.startOptimizationAnimation();
      this.callOptimizationAPI();
    },

    detectMobile() {
      this.isMobile = window.innerWidth <= 768;
    },

    getMobileTimeLabel(index) {
      if (index % 2 === 0) {
        const hour = Math.floor(index / 2) + 9;
        return `${hour}`;
      }
      return '';
    },

    getTruncatedTitle(title, maxLength = 6) {
      if (!title) return '';
      if (this.isMobile && title.length > maxLength) {
        return title.substring(0, maxLength) + '...';
      }
      return title;
    }
  }
};
</script>

<style scoped>
/* ==========================================================================
   1. 기본 컨테이너 및 레이아웃 시스템
   ========================================================================== */
.optimization-container {
  width: 100%;
  min-height: 100vh;
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
}

.optimization-container.mobile-view {
  padding: 0;
}

/* 데스크톱 레이아웃 */
.desktop-layout {
  width: 100%;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: var(--spacing-3);
  box-sizing: border-box;
}

.optimization-card {
  width: 95%;
  max-width: 1000px;
  margin: 0 auto;
  background-color: var(--card-bg);
  border-radius: var(--border-radius);
  padding: var(--spacing-2);
  box-shadow: var(--box-shadow);
  box-sizing: border-box;
}

/* ==========================================================================
   2. 데스크톱 상태 메시지 및 시간표 (기존 스타일 유지)
   ========================================================================== */
.status-message {
  font-size: 1.1rem;
  font-weight: 500;
  margin-bottom: var(--spacing-3);
  padding: var(--spacing-2) var(--spacing-3);
  background-color: var(--primary-color);
  color: white;
  text-align: center;
  border-radius: var(--border-radius-small);
}

.status-message.completed {
  background-color: var(--success-color);
  font-size: 1.4rem;
}

.status-message.error {
  background-color: var(--error-color);
}

.taken-course-hint {
  font-size: 0.9rem;
  margin-top: var(--spacing-1);
  opacity: 0.9;
}

.error-hint {
  margin-top: var(--spacing-2);
  font-size: 0.9rem;
}

.error-hint ul {
  text-align: left;
  margin: var(--spacing-1) 0;
  padding-left: var(--spacing-3);
}

.retry-button {
  margin-top: var(--spacing-2);
  padding: var(--spacing-1) var(--spacing-2);
  background-color: white;
  color: var(--error-color);
  border: none;
  border-radius: var(--border-radius-small);
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition-fast);
}

.retry-button:hover {
  background-color: var(--light-color);
}

/* 시간표 컨테이너 */
.timetable-container {
  width: 100%;
  padding: 0;
  margin-bottom: var(--spacing-3);
  overflow-x: auto;
}

.timetable {
  width: 100%;
  table-layout: fixed;
  border-collapse: collapse;
  background-color: white;
  box-shadow: var(--box-shadow);
  border-radius: var(--border-radius-small);
  overflow: hidden;
}

.timetable-row {
  display: flex;
  border-bottom: 1px solid var(--border-color);
  height: 60px;
}

.timetable-cell {
  flex: 1;
  padding: 0;
  border-right: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: var(--transition-base);
  box-sizing: border-box;
  min-width: 120px;
  position: relative;
}

.time-header-cell {
  flex: 0 0 100px;
  min-width: 100px;
  background-color: var(--light-color);
}

.header-cell {
  background-color: var(--light-color);
  font-weight: var(--heading-font-weight);
  height: 50px;
  font-size: 1.2rem;
}

.time-cell {
  flex: 0 0 100px;
  min-width: 100px;
  background-color: var(--light-color);
  font-weight: 500;
  color: var(--gray-color);
  font-size: 1.1rem;
}

.day-cell {
  flex: 1;
  min-width: 130px;
  cursor: pointer;
}

.day-cell:hover {
  opacity: 0.8;
}

.cell-content {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  padding: var(--spacing-1);
  text-align: center;
}

.cell-title {
  font-weight: bold;
  font-size: 0.8rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.cell-location {
  font-size: 0.7rem;
  opacity: 0.8;
}

.selected-for-removal {
  opacity: 0.5 !important;
  background-image: repeating-linear-gradient(45deg,
    rgba(0, 0, 0, 0.1),
    rgba(0, 0, 0, 0.1) 10px,
    rgba(0, 0, 0, 0.2) 10px,
    rgba(0, 0, 0, 0.2) 20px) !important;
  position: relative;
}

.selected-for-removal::before {
  content: "제외됨";
  position: absolute;
  top: 0;
  right: 0;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 2px 6px;
  font-size: 0.7rem;
  border-radius: 0 6px 0 6px;
  z-index: 2;
}

/* 데스크톱 버튼 스타일 */
.button-container {
  display: flex;
  justify-content: center;
  margin-top: var(--spacing-4);
}

.action-button, .reoptimize-button {
  padding: var(--spacing-2) var(--spacing-3);
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--border-radius-small);
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition-base);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-1);
}

.action-button:hover, .reoptimize-button:hover {
  background-color: var(--secondary-color);
  transform: translateY(-2px);
  box-shadow: var(--box-shadow-hover);
}

.reoptimize-button:disabled, .action-button:disabled {
  background-color: var(--light-gray);
  color: var(--gray-color);
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.selected-courses-info {
  margin-top: var(--spacing-3);
  padding: var(--spacing-2);
  background-color: var(--light-color);
  border-radius: var(--border-radius-small);
  text-align: center;
  border: 1px solid var(--border-color);
}

.button-stack {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-2);
  margin-top: var(--spacing-2);
}

.button-stack button {
  width: 100%;
  max-width: 300px;
}

/* ==========================================================================
   3. 모바일 레이아웃 시스템
   ========================================================================== */
.mobile-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.mobile-header {
  padding: var(--spacing-3);
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.mobile-progress {
  text-align: center;
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
  transition: width 0.8s ease;
}

.progress-text {
  color: rgba(255, 255, 255, 0.9);
  font-size: var(--mobile-font-size-base);
  font-weight: 500;
}

.mobile-content {
  flex: 1;
  overflow-y: auto;
  padding: var(--spacing-2);
}

/* ==========================================================================
   4. 모바일 상태 카드
   ========================================================================== */
.mobile-status-card {
  background: white;
  border-radius: var(--mobile-border-radius);
  padding: var(--spacing-4);
  box-shadow: var(--mobile-shadow-medium);
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  transition: var(--mobile-transition-normal);
  margin-bottom: var(--spacing-3);
}

.mobile-status-card.loading {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.mobile-status-card.completed {
  background: linear-gradient(135deg, var(--success-color) 0%, #00a085 100%);
  color: white;
}

.mobile-status-card.error {
  background: linear-gradient(135deg, var(--error-color) 0%, #dc2626 100%);
  color: white;
}

.status-icon {
  flex-shrink: 0;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: bold;
  background: rgba(255, 255, 255, 0.2);
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.status-content {
  flex: 1;
}

.mobile-status-title {
  font-size: var(--mobile-font-size-large);
  font-weight: var(--heading-font-weight);
  margin: 0 0 var(--spacing-1) 0;
}

.mobile-status-description {
  font-size: var(--mobile-font-size-base);
  margin: 0;
  line-height: 1.5;
  opacity: 0.9;
}

/* ==========================================================================
   5. 수정된 모바일 시간표 - 단순화된 그리드
   ========================================================================== */
.mobile-timetable-container {
  background: white;
  border-radius: var(--mobile-border-radius);
  padding: var(--mobile-card-padding);
  box-shadow: var(--mobile-shadow-medium);
  margin-bottom: var(--spacing-3);
  width: 100%;
  overflow-x: visible;
}

.section-title {
  color: var(--dark-color);
  font-size: var(--mobile-font-size-large);
  font-weight: var(--heading-font-weight);
  margin: 0 0 var(--spacing-2) 0;
  text-align: center;
}

.mobile-timetable {
  width: 100%;
  min-width: auto;
}

.mobile-day-header {
  display: grid;
  grid-template-columns: minmax(45px, 1fr) repeat(5, 2fr);
  background: var(--light-color);
  border-radius: var(--mobile-border-radius);
  margin-bottom: var(--spacing-1);
  gap: 1px;
}

.mobile-time-header, .mobile-day {
  padding: var(--spacing-1);
  text-align: center;
  font-size: var(--mobile-font-size-small);
  font-weight: var(--heading-font-weight);
  color: var(--gray-color);
  overflow: hidden;
  white-space: nowrap;
}

.mobile-grid-container {
  display: grid;
  grid-template-columns: minmax(45px, 1fr) repeat(5, 2fr);
  gap: 1px;
  grid-auto-rows: 30px;
  width: 100%;
}

.mobile-time-cell {
  background: var(--light-color);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 9px;
  color: var(--gray-color);
  font-weight: 500;
  border-radius: var(--border-radius-small);
  white-space: nowrap;
  overflow: hidden;
}

.mobile-day-cell {
  background: #fafafa;
  border-radius: var(--border-radius-small);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  cursor: pointer;
  transition: var(--mobile-transition-fast);
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  overflow: hidden;
}

.mobile-day-cell.has-content {
  cursor: pointer;
}

.mobile-day-cell.has-content:active {
  transform: scale(0.95);
}

.mobile-day-cell.selected-for-removal {
  opacity: 0.6 !important;
  position: relative;
}

.mobile-day-cell.selected-for-removal::after {
  content: '✕';
  position: absolute;
  top: 2px;
  right: 2px;
  color: white;
  font-size: 8px;
  background: rgba(0, 0, 0, 0.7);
  border-radius: 50%;
  width: 12px;
  height: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
}

.mobile-cell-content {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4px 2px;
  text-align: center;
  overflow: hidden;
  box-sizing: border-box;
}

.mobile-cell-title {
  font-size: 8px;
  font-weight: 600;
  color: white;
  line-height: 1.2;
  width: 100%;
  text-align: center;
  margin-bottom: 2px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  letter-spacing: -0.2px;
}

.mobile-cell-location {
  font-size: 6px;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1;
  margin-bottom: 1px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 100%;
}

.mobile-cell-time {
  font-size: 5px;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 100%;
}

/* ==========================================================================
   6. 모바일 제외된 강의 섹션
   ========================================================================== */
.mobile-excluded-section {
  margin-bottom: var(--spacing-3);
}

.mobile-excluded-card {
  background: white;
  border-radius: var(--mobile-border-radius);
  padding: var(--spacing-3);
  box-shadow: var(--mobile-shadow-light);
  border-left: 4px solid var(--warning-color);
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
}

.excluded-icon {
  font-size: 24px;
}

.excluded-info {
  flex: 1;
}

.excluded-title {
  font-size: var(--mobile-font-size-base);
  font-weight: var(--heading-font-weight);
  color: var(--dark-color);
  margin: 0 0 4px 0;
}

.excluded-count {
  font-size: var(--mobile-font-size-small);
  color: var(--gray-color);
  margin: 0;
}

/* ==========================================================================
   7. 모바일 하단 액션 바
   ========================================================================== */
.mobile-action-bar {
  background: white;
  border-top: 1px solid var(--border-color);
  padding: var(--spacing-3);
  position: sticky;
  bottom: 0;
  z-index: var(--z-index-mobile-bottom-bar);
  box-shadow: var(--mobile-shadow-medium);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}

.mobile-button-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}

.mobile-continue-button,
.mobile-reoptimize-button,
.mobile-retry-button {
  min-height: var(--mobile-button-height);
  padding: var(--spacing-2) var(--spacing-3);
  border-radius: var(--mobile-border-radius);
  font-size: var(--mobile-font-size-base);
  font-weight: var(--heading-font-weight);
  border: none;
  cursor: pointer;
  transition: var(--mobile-transition-normal);
  display: flex;
  align-items: center;
  justify-content: center;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}

.mobile-continue-button {
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  color: white;
}

.mobile-continue-button.primary {
  width: 100%;
}

.mobile-reoptimize-button {
  background: var(--gray-color);
  color: white;
}

.mobile-retry-button {
  background: var(--warning-color);
  color: white;
}

.mobile-continue-button:active,
.mobile-reoptimize-button:active,
.mobile-retry-button:active {
  transform: scale(0.98);
}

.mobile-reoptimize-button:disabled {
  background: var(--light-gray);
  color: var(--gray-color);
  cursor: not-allowed;
  transform: none;
}

/* ==========================================================================
   8. 반응형 최적화
   ========================================================================== */
@media (max-width: 992px) {
  .desktop-layout .optimization-card {
    width: 95%;
    padding: var(--spacing-2);
  }

  .desktop-layout .timetable-cell {
    min-width: 100px;
  }

  .desktop-layout .time-cell,
  .desktop-layout .time-header-cell {
    flex: 0 0 80px;
    min-width: 80px;
  }
}

@media (max-width: 768px) {
  .desktop-layout .optimization-card {
    width: 100%;
    padding: var(--spacing-1);
  }

  .desktop-layout .timetable-row {
    height: 50px;
  }

  .desktop-layout .time-cell,
  .desktop-layout .time-header-cell {
    flex: 0 0 60px;
    min-width: 60px;
    font-size: 0.8rem;
  }

  .desktop-layout .day-cell {
    min-width: 80px;
  }

  .desktop-layout .cell-title {
    font-size: 0.7rem;
  }
}

/* 모바일 화면 크기별 최적화 */
@media (max-width: 480px) {
  .mobile-day-header {
    grid-template-columns: minmax(40px, 0.8fr) repeat(5, 1.8fr);
    gap: 0.5px;
  }

  .mobile-grid-container {
    grid-template-columns: minmax(40px, 0.8fr) repeat(5, 1.8fr);
    gap: 0.5px;
    grid-auto-rows: 28px;
  }

  .mobile-time-header, .mobile-day {
    font-size: 10px;
    padding: 6px 2px;
  }

  .mobile-time-cell {
    font-size: 8px;
    padding: 2px;
  }

  .mobile-cell-title {
    font-size: 7px;
  }

  .mobile-cell-location {
    font-size: 5px;
  }

  .mobile-cell-time {
    font-size: 4px;
  }
}

@media (max-width: 360px) {
  .mobile-day-header {
    grid-template-columns: minmax(35px, 0.7fr) repeat(5, 1.7fr);
    gap: 0.5px;
  }

  .mobile-grid-container {
    grid-template-columns: minmax(35px, 0.7fr) repeat(5, 1.7fr);
    gap: 0.5px;
    grid-auto-rows: 26px;
  }

  .mobile-time-header, .mobile-day {
    font-size: 9px;
    padding: 4px 1px;
  }

  .mobile-time-cell {
    font-size: 7px;
    padding: 1px;
  }

  .mobile-cell-title {
    font-size: 6px;
    -webkit-line-clamp: 1;
  }

  .mobile-cell-location {
    font-size: 4px;
  }

  .mobile-cell-time {
    font-size: 3px;
  }

  .section-title {
    font-size: var(--mobile-font-size-base);
  }
}

@media (max-width: 320px) {
  .mobile-day-header {
    grid-template-columns: minmax(30px, 0.6fr) repeat(5, 1.6fr);
  }

  .mobile-grid-container {
    grid-template-columns: minmax(30px, 0.6fr) repeat(5, 1.6fr);
    grid-auto-rows: 24px;
  }

  .mobile-time-header, .mobile-day {
    font-size: 8px;
    padding: 3px 1px;
  }

  .mobile-time-cell {
    font-size: 6px;
  }

  .mobile-cell-title {
    font-size: 5px;
  }

  .mobile-cell-location,
  .mobile-cell-time {
    display: none;
  }
}

/* 가로 모드 최적화 */
@media (max-width: 768px) and (orientation: landscape) {
  .mobile-grid-container {
    grid-auto-rows: 32px;
  }

  .mobile-cell-title {
    font-size: 9px;
  }

  .mobile-cell-location {
    font-size: 7px;
  }

  .mobile-cell-time {
    font-size: 6px;
  }

  .mobile-time-cell {
    font-size: 10px;
  }
}

@media (max-width: 480px) {
  .mobile-header {
    padding: var(--spacing-2);
  }

  .mobile-content {
    padding: var(--spacing-1);
  }

  .mobile-status-card {
    padding: var(--spacing-3);
    gap: var(--spacing-2);
  }

  .status-icon {
    width: 40px;
    height: 40px;
    font-size: 20px;
  }

  .mobile-action-bar {
    padding: var(--spacing-2);
  }
}

/* ==========================================================================
   9. 접근성 및 모션 최적화
   ========================================================================== */
@media (prefers-reduced-motion: reduce) {
  .mobile-status-card,
  .mobile-day-cell,
  .mobile-continue-button,
  .mobile-reoptimize-button,
  .mobile-retry-button,
  .progress-fill,
  .loading-spinner {
    animation: none !important;
    transition: none !important;
  }
}

@media (prefers-contrast: high) {
  .mobile-status-card {
    border: 2px solid var(--border-color);
  }

  .mobile-timetable-container {
    border: 2px solid var(--border-color);
  }

  .mobile-day-cell.has-content {
    border: 1px solid rgba(0, 0, 0, 0.3);
  }
}
</style>