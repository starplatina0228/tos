<template>
  <div class="optimization-container">
    <div class="optimization-card">
      <div class="status-message" :class="{ 'completed': optimizationCompleted }">
        {{ statusMessage }}
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
              :style="{
                backgroundColor: cell.color,
                opacity: cell.opacity
              }"
            ></div>
          </div>
        </div>
      </div>

      <div class="button-container" v-if="optimizationCompleted">
        <button class="action-button primary-button" @click="onContinue">
          시간표 확인하기
        </button>
      </div>
    </div>
  </div>
</template>

<script>
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
      timeSlots: 10, // 9시간 (9시부터 18시까지)
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
      ]
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
    initTimetable() {
      // 시간표 초기화
      this.timetableCells = Array(this.timeSlots).fill().map(() =>
        Array(this.daysOfWeek).fill().map(() => ({
          color: 'white',
          opacity: 1
        }))
      );
    },
    getTimeLabel(index) {
      const startHour = 9;
      return `${startHour + index}:00`;
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
        // Ngrok URL을 여기에 설정
        const apiUrl = 'https://your-ngrok-url.ngrok.io/schedule';

        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(this.optimizationData)
        });

        if (!response.ok) {
          throw new Error(`API 요청 실패: ${response.status}`);
        }

        // API 응답 저장
        this.optimizationResult = await response.json();
        console.log('최적화 결과:', this.optimizationResult);

        // 애니메이션 시간이 지나면 결과 표시
        setTimeout(() => {
          this.completeOptimization();
        }, this.simulationTime);
      } catch (error) {
        console.error('API 호출 오류:', error);
        // 에러 발생 시에도 애니메이션이 끝나면 더미 데이터 표시
        setTimeout(() => {
          this.completeOptimization();
        }, this.simulationTime);
      }
    },

    completeOptimization() {
      this.stopAnimations();
      this.optimizationCompleted = true;
      this.statusMessage = "최적화 완료! 당신의 맞춤형 시간표가 준비되었습니다.";

      if (this.optimizationResult && this.optimizationResult.selected) {
        // API 응답으로 시간표 표시
        this.displayOptimizedSchedule(this.optimizationResult.selected);
      } else {
        // 실패 시 테스트용 시간표 표시
        this.displayTestSchedule();
      }
    },

    displayOptimizedSchedule(courses) {
      // 시간표 초기화
      this.initTimetable();

      // 색상 인덱스
      let colorIndex = 0;

      // 각 과목을 시간표에 표시
      courses.forEach(course => {
        // 시간 파싱 (예: "월9~10, 수11~12" 형식)
        const timeParts = course.time.split(', ');

        // 과목 색상 할당
        const courseColor = this.colors[colorIndex % this.colors.length];
        colorIndex++;

        // 각 시간대 처리
        timeParts.forEach(part => {
          // 요일 추출 (첫 글자)
          const day = part.charAt(0);
          const dayIndex = this.getDayIndex(day);

          // 시간 범위 추출
          const timeRange = part.substring(1);
          const [start, end] = timeRange.split('~').map(Number);

          // 시간표에 표시
          for (let t = start; t <= end; t++) {
            // 시간 인덱스 변환 (9시 = 인덱스 0)
            const timeIndex = t - 9;
            if (timeIndex >= 0 && timeIndex < this.timeSlots && dayIndex >= 0 && dayIndex < this.daysOfWeek) {
              this.timetableCells[timeIndex][dayIndex].color = courseColor;
              this.timetableCells[timeIndex][dayIndex].opacity = 1;
            }
          }
        });
      });
    },

    getDayIndex(dayChar) {
      const days = { '월': 0, '화': 1, '수': 2, '목': 3, '금': 4 };
      return days[dayChar] !== undefined ? days[dayChar] : -1;
    },
    displayTestSchedule() {
      // 초기화
      for (let row = 0; row < this.timeSlots; row++) {
        for (let col = 0; col < this.daysOfWeek; col++) {
          this.timetableCells[row][col].color = 'white';
          this.timetableCells[row][col].opacity = 1;
        }
      }

      // 테스트용 시간표 데이터 - 이미지와 유사한 시간표
      const testSchedule = [
        { row: 1, col: 0, color: '#e67e22' }, // 월요일 10시
        { row: 2, col: 0, color: '#e67e22' }, // 월요일 11시
        { row: 2, col: 2, color: '#f1c40f' }, // 수요일 11시
        { row: 3, col: 2, color: '#f1c40f' }, // 수요일 12시
        { row: 2, col: 4, color: '#e67e22' }, // 금요일 11시
        { row: 3, col: 4, color: '#e67e22' }, // 금요일 12시
        { row: 2, col: 1, color: '#e74c3c' }, // 화요일 11시
        { row: 3, col: 1, color: '#e74c3c' }, // 화요일 12시
        { row: 4, col: 1, color: '#e74c3c' }, // 화요일 13시
        { row: 5, col: 1, color: '#e74c3c' }, // 화요일 14시
        { row: 4, col: 3, color: '#2ecc71' }, // 목요일 13시
        { row: 5, col: 3, color: '#2ecc71' }  // 목요일 14시
      ];

      // 테스트 시간표 적용
      testSchedule.forEach(item => {
        if (item.row < this.timeSlots && item.col < this.daysOfWeek) {
          this.timetableCells[item.row][item.col].color = item.color;
          this.timetableCells[item.row][item.col].opacity = 1;
        }
      });
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
    onContinue() {
      // 최적화 완료 이벤트 발생 (결과가 있으면 전달)
      this.$emit('optimization-completed', this.optimizationResult);
    }
  }
}
</script>

<style scoped>
.optimization-container {
  width: 100%;
  min-height: 100vh;
  padding: 10px; /* 패딩 축소 */
  box-sizing: border-box;
}

.optimization-card {
  width: 95%; /* 화면의 95%까지 확장 */
  max-width: 1200px; /* 최대 너비 대폭 증가 */
  margin: 0 auto; /* 중앙 정렬 */
  padding: 20px;
  box-sizing: border-box;
}

.status-message {
  font-size: 1.2rem;
  font-weight: 500;
  margin-bottom: 30px;
  padding: 15px 30px;
  background-color: var(--primary-color);
  color: white;
  text-align: center;
}

.status-message.completed {
  background-color: #10b981;
  font-size: 1.4rem;
}

.timetable-container {
  width: 100%;
  padding: 0;
  margin-bottom: 30px;
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
  height: 80px; /* 행 높이 더욱 증가 */
}

.timetable-row:last-child {
  border-bottom: none;
}

.timetable-cell {
  flex: 1;
  padding: 0;
  border-right: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.3s, opacity 0.3s;
  box-sizing: border-box;
  min-width: 120px; /* 셀 최소 너비 더 증가 */
}

.time-header-cell {
  flex: 0 0 100px; /* 시간 헤더 셀 너비 증가 */
  min-width: 100px;
  background-color: #f8fafc;
}

.header-cell {
  background-color: #f8fafc;
  font-weight: 600;
  height: 70px; /* 헤더 높이 증가 */
  font-size: 1.2rem; /* 헤더 글꼴 크기 더 증가 */
}

.time-cell {
  flex: 0 0 100px; /* 시간 셀 너비 증가 */
  min-width: 100px;
  background-color: #f8fafc;
  font-weight: 500;
  color: var(--gray-color);
  font-size: 1.1rem; /* 시간 표시 글꼴 크기 증가 */
}

.day-cell {
  flex: 1;
  min-width: 130px; /* 요일 셀 최소 너비 더 증가 */
}

.timetable-cell:last-child {
  border-right: none;
}

.button-container {
  display: flex;
  justify-content: center;
  margin-top: 30px;
}

@media (max-width: 768px) {
  .optimization-card {
    width: 100%;
    padding: 10px;
  }

  .timetable-row {
    height: 60px; /* 모바일에서는 행 높이 감소 */
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
    min-width: 90px; /* 모바일에서도 적절한 너비 유지 */
  }

  .status-message {
    font-size: 1rem;
    padding: 10px 15px;
  }

  .status-message.completed {
    font-size: 1.1rem;
  }
}
</style>