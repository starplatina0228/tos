<template>
  <div class="optimization-container">
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
                'selected-for-removal': cell.title && this.excludedCourses.includes(cell.courseId)
              }"
              :style="{
                backgroundColor: cell.color,
                opacity: cell.opacity
              }"
              @click="cell.title ? toggleCourseExclusion(cell) : null"
            >
              <div v-if="cell.title" class="cell-content">
                <div class="cell-title">{{ cell.title }}</div>
                <div v-if="cell.location" class="cell-location">{{ cell.location }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 선택된 강의 정보 부분 수정 - 세로 배치로 변경 -->
      <div v-if="excludedCourses.length > 0" class="selected-courses-info">
        <p>{{ excludedCourses.length }}개의 강의가 제외되었습니다.</p>

        <!-- button-group을 button-stack으로 변경 (세로 정렬) -->
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

      <!-- 기존 버튼 컨테이너는 유지 (excludedCourses가 비어있을 때만 표시) -->
      <div class="button-container" v-if="optimizationCompleted && !reoptimizing && excludedCourses.length === 0">
        <button class="action-button primary-button" @click="onContinue">
          시간표 확인하기
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
      default: 10000 // 10초
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
      timeSlots: 18, // 9시간 (9시부터 18시까지)
      daysOfWeek: 5,
      colors: ['#e67e22', '#e74c3c', '#f1c40f', '#2ecc71', '#3498db', '#9b59b6'],
      optimizationMessages: [
        "사용자 선호도 분석 중...",
        "과목 간 시간 배치 최적화 중...",
        "팀플 없는 수업 고민 중...",
        "시간대별 집중력 패턴 고려 중...",
        "균형 잡힌 시간표 계산 중...",
        "조성원 교수님과 상담중...",
        "과목 선호도 반영 중...",
        "출튀하기 좋은 수업 찾는 중...",
        "최종 시간표 생성 중...",
      ],
      optimizationFailed: false,
      excludedCourses: [],      // 제외할 강의 ID 배열
      reoptimizing: false,      // 재최적화 진행 중 상태
      optimizationCount: 0      // 최적화 실행 횟수
    }
  },

  mounted() {
    this.initTimetable();
    this.startOptimizationAnimation();

    // API 호출
    this.callOptimizationAPI();
  },
    beforeUnmount() {
    this.stopAnimations();
  },
  methods: {
    // 초기화 함수
    initTimetable() {
      // 시간표 초기화 - 30분 단위 18슬롯 (9:00-17:30)
      this.timetableCells = Array(this.timeSlots).fill().map(() =>
        Array(this.daysOfWeek).fill().map(() => ({
          color: 'white',
          opacity: 1,
          title: '',
          location: '',
          courseId: null,
          isNew: true // 기본적으로 모든 셀은 새 강의로 간주
        }))
      );
    },

    // 시간 레이블 생성 함수 수정
    getTimeLabel(index) {
      // 30분 단위 레이블 생성 (0번 행 = 9:00, 1번 행 = 9:30, 2번 행 = 10:00...)
      const hour = Math.floor(index / 2) + 9;
      const minute = (index % 2) * 30;
      return `${hour}:${minute === 0 ? '00' : minute}`;
    },

    startOptimizationAnimation() {
      // 상태 메시지 변경 인터벌 설정
      this.messageChangeInterval = setInterval(() => {
        const randomIndex = Math.floor(Math.random() * this.optimizationMessages.length);
        this.statusMessage = this.optimizationMessages[randomIndex];
      }, 2500); // 2.5초마다 메시지 변경

      // 시간표 셀 애니메이션 인터벌 설정
      this.optimizationInterval = setInterval(() => {
        this.updateTimetableDuringOptimization();
      }, 200); // 200ms마다 업데이트
    },

    updateTimetableDuringOptimization() {
      // 최적화 진행 중 시간표 셀 업데이트
      for (let row = 0; row < this.timeSlots; row++) {
        for (let col = 0; col < this.daysOfWeek; col++) {
          // 랜덤하게 셀 업데이트
          if (Math.random() > 0.7) {
            const randomValue = Math.random();

            if (randomValue > 0.8) {
              // 랜덤 색상 할당
              const colorIndex = Math.floor(Math.random() * this.colors.length);
              this.timetableCells[row][col].color = this.colors[colorIndex];
              this.timetableCells[row][col].opacity = Math.random() * 0.5 + 0.5;
            } else if (randomValue > 0.4) {
              // 색상 제거
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

        // Use the API config
        const apiUrl = API_CONFIG.getFullUrl(API_CONFIG.endpoints.SCHEDULE);

        // 제거할 강의 목록을 요청 데이터에 추가
        const requestData = {
          ...this.optimizationData,
          excluded_courses: this.excludedCourses // 모든 제외 과목 결합
        };

        console.log(`최적화 요청 데이터 (${this.optimizationCount + 1}번째 요청):`, requestData);

        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestData)
        });

        if (!response.ok) {
          throw new Error(`API 요청 실패: ${response.status}`);
        }

        // API 응답 저장
        this.optimizationResult = await response.json();
        console.log(`최적화 결과 (${this.optimizationCount + 1}번째):`, this.optimizationResult);

        // 최적화 카운트 증가
        this.optimizationCount++;

        // 애니메이션 시간이 지나면 결과 표시
        setTimeout(() => {
          this.completeOptimization();
        }, this.reoptimizing ? 2000 : this.simulationTime); // 재최적화일 경우 더 짧게
      } catch (error) {
        console.error('API 호출 오류:', error);

        // 애니메이션 중지
        this.stopAnimations();

        // 오류 메시지 표시
        this.optimizationCompleted = false;
        this.reoptimizing = false;
        this.statusMessage = "최적화 중 오류가 발생했습니다.";

        // 사용자에게 알림
        alert("시간표 최적화 중 오류가 발생했습니다. 관리자에게 문의하세요.");

        // 테스트 데이터 사용하지 않고 오류 UI 표시
        this.showErrorUI();
      }
    },

    // 오류 UI 표시 메서드 추가
    showErrorUI() {
      // 최적화 실패 UI 표시
      this.optimizationResult = null; // 결과 초기화

      // 에러 상태 표시를 위한 클래스 추가
      this.statusMessage = "시간표 최적화에 실패했습니다.";

      // 재시도 버튼 표시를 위한 상태 업데이트
      this.optimizationFailed = true;
    },

    completeOptimization() {
      this.stopAnimations();
      this.optimizationCompleted = true;
      this.reoptimizing = false;
      this.statusMessage = "최적화 완료! 당신의 맞춤형 시간표가 준비되었습니다.";

      if (this.optimizationResult && this.optimizationResult.selected) {
        // API 응답으로 시간표 표시
        this.displayOptimizedSchedule(this.optimizationResult.selected);

        // 만약 결과에 제외된 강의 정보가 있다면 업데이트
        if (this.optimizationResult.excluded && this.optimizationResult.excluded.length > 0) {
          console.log("서버에서 제외된 강의: ", this.optimizationResult.excluded);
          // excluded 필드에서 과목 ID만 추출하여 excludedCourses 업데이트
          const excludedIds = this.optimizationResult.excluded.map(course => course.subjId);
          this.excludedCourses = excludedIds;
        }
      } else {
        this.showErrorUI();
        return;
      }

      // 재최적화가 끝났으면, 상태를 정리
      this.takenCoursesToRemove = [];
    },

    displayOptimizedSchedule(courses) {
      this.initTimetable();

      // 색상 인덱스
      let colorIndex = 0;

      courses.forEach(course => {
        const courseColor = this.colors[colorIndex % this.colors.length];
        colorIndex++;

        // schedule_info 배열에서 각 시간표 정보 처리
        course.schedule_info.forEach(schedule => {
          const day = schedule.day;
          const start = schedule.start;
          const end = schedule.end;
          const location = schedule.location || '';

          const dayIndex = this.getDayIndex(day);

          // 시간표에 표시 (30분 단위 고려)
          for (let t = start; t <= end; t++) {
            // 시간 인덱스 변환 (1교시 = 9:00 = 인덱스 0)
            const timeIndex = t - 1;

            if (timeIndex >= 0 && timeIndex < this.timeSlots && dayIndex >= 0 && dayIndex < this.daysOfWeek) {
              this.timetableCells[timeIndex][dayIndex].color = courseColor;
              this.timetableCells[timeIndex][dayIndex].opacity = 1;
              this.timetableCells[timeIndex][dayIndex].title = course.name;
              this.timetableCells[timeIndex][dayIndex].location = location;
              this.timetableCells[timeIndex][dayIndex].courseId = course.subjId;
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
      // 모든 애니메이션 중지
      if (this.optimizationInterval) {
        clearInterval(this.optimizationInterval);
      }
      if (this.messageChangeInterval) {
        clearInterval(this.messageChangeInterval);
      }
    },

    toggleCourseExclusion(cell) {
      // 강의 선택/해제 토글
      if (!cell.courseId) return;

      console.log(`토글 강의: ${cell.title} (ID: ${cell.courseId})`);

      const index = this.excludedCourses.indexOf(cell.courseId);
      if (index === -1) {
        // 아직 선택되지 않은 경우 추가
        this.excludedCourses.push(cell.courseId);
      } else {
        // 이미 선택된 경우 제거
        this.excludedCourses.splice(index, 1);
      }

      // 현재 선택 로그
      console.log('선택된 제외 강의:', this.excludedCourses);
    },

    reoptimizeSchedule() {
      // 선택한 강의를 제외하고 시간표 재최적화
      if (this.excludedCourses.length === 0) {
        return; // 선택된 강의가 없으면 아무 작업도 수행하지 않음
      }

      this.reoptimizing = true;
      this.optimizationCompleted = false; // 다시 최적화 시작
      this.statusMessage = "선택한 강의를 제외하고 시간표를 다시 최적화하는 중...";

      // 선택된 강의 ID 로그 출력
      console.log(`${this.excludedCourses.length}개 강의를 제외하고 재최적화 시작:`, this.excludedCourses);

      // 간단한 애니메이션 시작
      this.startOptimizationAnimation();

      // API 호출하여 재최적화 수행
      this.callOptimizationAPI();
    },

    onContinue() {
      // 최적화 완료 이벤트 발생 (결과가 있으면 전달)
      this.$emit('optimization-completed', this.optimizationResult);
    },

    retryOptimization() {
      // 상태 초기화
      this.optimizationFailed = false;
      this.statusMessage = "시간표 최적화 진행 중...";

      // 애니메이션 다시 시작
      this.startOptimizationAnimation();

      // API 다시 호출
      this.callOptimizationAPI();
    },
  }
}
</script>

<style scoped>
/* ==========================================================================
   1. 컨테이너 및 카드 레이아웃
   ========================================================================== */
.optimization-container {
  width: 100%;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  padding: 20px;
  box-sizing: border-box;
}

.optimization-card {
  width: 95%;
  max-width: 1000px;
  margin: 0 auto;
  background-color: white;
  border-radius: 16px;
  padding: 15px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  box-sizing: border-box;

}

/* ==========================================================================
   2. 상태 메시지 및 알림
   ========================================================================== */
.status-message {
  font-size: 1.1rem;
  font-weight: 500;
  margin-bottom: 20px;
  padding: 10px 20px;
  background-color: var(--primary-color);
  color: white;
  text-align: center;
  border-radius: 8px;
}

.status-message.completed {
  background-color: #10b981;
  font-size: 1.4rem;
}

.taken-course-hint {
  font-size: 0.9rem;
  margin-top: 8px;
  opacity: 0.9;
}

/* 에러 상태 스타일 */
.status-message.error {
  background-color: #ef4444;
}

.error-hint {
  margin-top: 12px;
  font-size: 0.9rem;
}

.error-hint ul {
  text-align: left;
  margin: 8px 0;
  padding-left: 20px;
}

.retry-button {
  margin-top: 10px;
  padding: 8px 16px;
  background-color: white;
  color: #ef4444;
  border: none;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
}

.retry-button:hover {
  background-color: #f9fafb;
}

/* ==========================================================================
   3. 시간표 컨테이너와 테이블 구조
   ========================================================================== */
.timetable-container {
  width: 100%;
  padding: 0;
  margin-bottom: 20px;
  overflow-x: auto;
}

.timetable {
  width: 100%;
  table-layout: fixed;
  border-collapse: collapse;
  background-color: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  overflow: hidden;
}

.timetable-row {
  display: flex;
  border-bottom: 1px solid #e5e7eb;
  height: 60px; /* 80px에서 60px로 줄임 */
}

.timetable-cell {
  flex: 1;
  padding: 0;
  border-right: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  box-sizing: border-box;
  min-width: 120px;
  position: relative;
}

/* ==========================================================================
   4. 헤더와 시간 셀
   ========================================================================== */
.time-header-cell {
  flex: 0 0 100px;
  min-width: 100px;
  background-color: #f8fafc;
}

.header-cell {
  background-color: #f8fafc;
  font-weight: 600;
  height: 50px;
  font-size: 1.2rem;
}

.time-cell {
  flex: 0 0 100px;
  min-width: 100px;
  background-color: #f8fafc;
  font-weight: 500;
  color: var(--gray-color);
  font-size: 1.1rem;
}

.day-cell {
  flex: 1;
  min-width: 130px;
}

/* ==========================================================================
   5. 셀 내용 스타일
   ========================================================================== */
.cell-content {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  padding: 2px;
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

/* ==========================================================================
   6. 이미 들은 강의 및 선택 표시
   ========================================================================== */
.taken-course-indicator {
  position: absolute;
  top: 0;
  right: 0;
  background-color: rgba(255, 0, 0, 0.7);
  color: white;
  padding: 2px 6px;
  font-size: 0.7rem;
  border-radius: 0 6px 0 6px;
  z-index: 2;
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

/* ==========================================================================
   7. 버튼 스타일
   ========================================================================== */
.button-container {
  display: flex;
  justify-content: center;
  margin-top: 30px;
}

.action-button, .reoptimize-button {
  padding: 12px 24px;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.reoptimize-button {
  margin-top: 20px;
}

.reoptimize-button:disabled, .action-button:disabled {
  background-color: #cbd5e0;
  color: #a0aec0;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.selected-courses-info {
  margin-top: 20px;
  padding: 15px;
  background-color: #f8fafc;
  border-radius: 8px;
  text-align: center;
  border: 1px solid #e5e7eb;
}
/* 버튼 그룹 스타일 */
.button-group {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 15px;
}

/* selected-courses-info 내부 정렬 수정 */
.selected-courses-info {
  margin-top: 20px;
  padding: 15px;
  background-color: #f8fafc;
  border-radius: 8px;
  text-align: center;
  border: 1px solid #e5e7eb;
}

/* 재최적화 버튼 스타일 */
.reoptimize-button {
  padding: 12px 24px;
  background-color: #6b7280;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.reoptimize-button:hover:not(:disabled) {
  background-color: #4b5563;
  transform: translateY(-2px);
}

/* 세로 정렬 버튼 스택 */
.button-stack {
  display: flex;
  flex-direction: column; /* 세로 정렬 */
  align-items: center;    /* 가운데 정렬 */
  gap: 12px;              /* 버튼 사이 간격 */
  margin-top: 15px;
}

/* 버튼 너비 설정 */
.button-stack button {
  width: 100%;           /* 전체 너비 */
  max-width: 300px;      /* 최대 너비 제한 */
}

/* ==========================================================================
   8. 그리드 행 구분선
   ========================================================================== */
.grid-row-divider {
  position: absolute;
  left: 0;
  right: 0;
  height: 1px;
  background-color: #e9ecef;
  z-index: 1;
}

/* ==========================================================================
   9. 반응형 디자인
   ========================================================================== */
@media (max-width: 1200px) {
  .optimization-card {
    padding: 15px;
  }

  .timetable-cell {
    min-width: 110px;
  }
}

@media (max-width: 992px) {
  .optimization-card {
    width: 95%;
    padding: 15px;
  }

  .status-message {
    font-size: 1.1rem;
    padding: 12px 20px;
  }

  .timetable-row {
    height: 65px;
  }

  .timetable-cell {
    min-width: 100px;
  }

  .time-cell, .time-header-cell {
    flex: 0 0 80px;
    min-width: 80px;
  }

  .header-cell {
    font-size: 1rem;
  }

  .cell-title {
    font-size: 0.85rem;
  }

  .cell-location {
    font-size: 0.75rem;
  }
}

@media (max-width: 768px) {
  .optimization-card {
    width: 100%;
    padding: 10px;
  }

  .timetable-row {
    height: 60px;
  }

  .time-cell, .time-header-cell {
    flex: 0 0 70px;
    min-width: 70px;
    font-size: 0.9rem;
  }

  .header-cell {
    font-size: 1rem;
    height: 50px;
  }

  .day-cell {
    min-width: 90px;
  }

  .status-message {
    font-size: 1rem;
    padding: 10px 15px;
  }

  .status-message.completed {
    font-size: 1.1rem;
  }

  .cell-title {
    font-size: 0.8rem;
  }

  .cell-location {
    font-size: 0.7rem;
  }

  .taken-course-indicator {
    font-size: 0.6rem;
    padding: 1px 4px;
  }
}

@media (max-width: 576px) {
  .optimization-card {
    padding: 8px;
  }

  .timetable-row {
    height: 50px;
  }

  .time-cell, .time-header-cell {
    flex: 0 0 50px;
    min-width: 50px;
    font-size: 0.7rem;
  }

  .header-cell {
    font-size: 0.8rem;
    padding: 6px 2px;
  }

  .timetable-cell {
    min-width: 70px;
    padding: 2px;
  }

  .cell-title {
    font-size: 0.7rem;
    margin-bottom: 1px;
  }

  .cell-location {
    font-size: 0.6rem;
  }

  .status-message {
    font-size: 0.9rem;
    padding: 8px 10px;
  }

  .reoptimize-button, .action-button {
    padding: 10px 16px;
    font-size: 0.9rem;
  }
}
</style>