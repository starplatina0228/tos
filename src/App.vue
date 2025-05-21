<template>
  <div class="app-container">
    <transition name="fade" mode="out-in">
      <div v-if="currentView === 'start'" key="start">
        <start-component @start-clicked="showGradeSelect"/>
      </div>

      <div v-else-if="currentView === 'grade-select'" key="grade-select">
        <grade-select-component
          :initialGrade="grade"
          :initialCredits="desiredCredits"
          @info-submitted="handleInfoSubmission"
        />
      </div>

      <div v-else-if="currentView === 'question'" key="question">
        <question-component
          @answer="handleAnswer"
          :questionNumber="currentQuestionIndex + 1"
          :totalQuestions="questions.length"
        >
          <template v-slot:question>
            {{ currentQuestion }}
          </template>
        </question-component>
      </div>

      <div v-else-if="currentView === 'optimization'" key="optimization">
        <optimization-component
          :simulation-time="10000"
          :optimization-data="{
            grade: grade,
            desired_credits: desiredCredits,
            user_morning: getAnswerFor(0),
            user_late: getAnswerFor(1),
            user_lunch: getAnswerFor(2),
            user_dayoff: getAnswerFor(3),
            user_no_large_gap: getAnswerFor(4)
          }"
          @optimization-completed="showSchedule"
        />
      </div>

      <div v-else-if="currentView === 'schedule'" key="schedule">
        <schedule-component
          :scheduleData="scheduleData"
          @restart="restartApp"
        />
      </div>
    </transition>
  </div>
</template>

<script>
import StartComponent from './components/StartComponent.vue';
import GradeSelectComponent from './components/GradeSelectComponent.vue';
import QuestionComponent from './components/QuestionComponent.vue';
import OptimizationComponent from './components/OptimizationComponent.vue';
import ScheduleComponent from './components/ScheduleComponent.vue';

export default {
  name: 'App',
  components: {
    StartComponent,
    GradeSelectComponent,
    QuestionComponent,
    OptimizationComponent,
    ScheduleComponent
  },
  data() {
    return {
      currentView: 'start',
      currentQuestionIndex: 0,
      grade: null,
      desiredCredits: 15,
      questions: [
        '아침 수업을 선호하시나요?',                 // user_morning
        '저녁 시간대 수업은 피하고 싶으신가요?',     // user_late
        '점심 시간대(12~1시) 수업은 피하고 싶으신가요?', // user_lunch
        '일주일에 최소 하루는 공강이 있었으면 좋겠나요?', // user_dayoff
        '수업 사이 긴 공강은 피하고 싶으신가요?'     // user_no_large_gap
      ],
      answers: [],
      scheduleData: [],
      optimizationData: null,
      apiResult: null
    }
  },
  computed: {
    currentQuestion() {
      return this.questions[this.currentQuestionIndex];
    }
  },
  methods: {
    showGradeSelect() {
      this.currentView = 'grade-select';
    },
    handleInfoSubmission(info) {
      this.grade = info.grade;
      this.desiredCredits = info.credits;
      this.currentView = 'question';
    },
    handleAnswer(answer) {
      this.answers.push({
        question: this.currentQuestion,
        answer: answer
      });

      if (this.currentQuestionIndex < this.questions.length - 1) {
        this.currentQuestionIndex++;
      } else {
        // 모든 질문에 답변을 완료하면 최적화 준비
        this.prepareOptimizationRequest();
        this.currentView = 'optimization';
      }
    },

    prepareOptimizationRequest() {
      // FastAPI 모델에 맞는 요청 데이터 준비
      this.optimizationData = {
        grade: this.grade,
        desired_credits: this.desiredCredits,
        user_morning: this.getAnswerFor(0),
        user_late: this.getAnswerFor(1),
        user_lunch: this.getAnswerFor(2),
        user_dayoff: this.getAnswerFor(3),
        user_no_large_gap: this.getAnswerFor(4)
      };

      console.log('최적화 요청 데이터:', this.optimizationData);
    },

    getAnswerFor(questionIndex) {
      return this.answers[questionIndex]?.answer || false;
    },

    showSchedule(result) {
      this.apiResult = result;
      this.processScheduleResult();
      this.currentView = 'schedule';
    },

    processScheduleResult() {
      if (this.apiResult) {
        // 최적화 컴포넌트에서 이미 처리된 데이터가 있는 경우
        if (this.apiResult.processedScheduleData) {
          this.scheduleData = this.apiResult.processedScheduleData;
          return;
        }
        // 원래 API 응답 형식에서 데이터 처리
        else if (this.apiResult.selected) {
          // 서버에서 받은 데이터 구조에서 시간표 항목 생성
          this.scheduleData = this.convertApiResultToScheduleData(this.apiResult.selected);
          return;
        }
      }

      // 유효한 결과가 없는 경우 더미 데이터 생성
      this.generateDummySchedule();
    },

    convertApiResultToScheduleData(selectedCourses) {
      // 과목 타입 정의 (색상 구분용)
      const courseTypes = ['study', 'project', 'exercise', 'hobby', 'social'];
      let scheduleItems = [];

      // 각 과목을 처리
      selectedCourses.forEach((course, index) => {
        // 과목 유형 지정 (순환)
        const courseType = courseTypes[index % courseTypes.length];

        // 각 수업 일정 처리
        course.schedule_info.forEach(schedule => {
          // 교시를 실제 시간으로 변환
          const startTime = this.convertPeriodToTime(schedule.start);

          // 교시 기간을 시간 단위로 변환
          const periodCount = schedule.end - schedule.start + 1;
          const durationHours = periodCount / 2; // 2교시 = 1시간

          scheduleItems.push({
            title: course.name,
            day: this.getDayNumber(schedule.day),
            startHour: startTime.hour,
            startMinute: startTime.minute,
            duration: durationHours,
            type: courseType,
            location: schedule.location || ''
          });
        });
      });

      return scheduleItems;
    },

    // 새로운 함수: 교시를 실제 시간으로 매핑
    // 교시를 시간으로 변환하는 함수
    mapPeriodToTime(period) {
      // 1교시 = 9:00, 2교시 = 9:30, 3교시 = 10:00 등으로 변환
      const hour = Math.floor((period - 1) / 2) + 9;
      const minute = ((period - 1) % 2) * 30;
      return { hour, minute };
    },

    // 교시를 시간으로 변환하는 함수
    convertPeriodToTime(period) {
      // 1교시 = 9:00, 2교시 = 9:30...
      const baseHour = 9;
      const hour = Math.floor((period - 1) / 2) + baseHour;
      const minute = ((period - 1) % 2) * 30;

      return { hour, minute };
    },

    // 교시(시간)를 행/열 위치로 변환하는 함수
    mapScheduleToCellPosition(day, startPeriod, endPeriod) {
      // 요일 -> 열 번호 변환
      const column = this.getDayNumber(day);

      // 시작 교시 -> 행 번호 변환 (1교시 = 9:00 = 행 1)
      const startRow = (startPeriod - 1) * 2 + 1;

      // 교시 기간 -> 행 수 변환 (30분 단위 교시)
      const periods = endPeriod - startPeriod + 1;
      const rowSpan = periods;

      return {
        column: column,
        row: startRow,
        rowSpan: rowSpan
      };
    },

    // 교시 범위를 그리드에 표시하기 위한 정보로 변환
    calculateSchedulePosition(start, end) {
      // 시작 시간 (시, 분)
      const startTime = this.mapPeriodToTime(start);

      // 30분 단위 교시 개수로 duration 계산
      const periodCount = end - start + 1;

      // 그리드 행 계산 (9시가 1행)
      const startRow = Math.floor((startTime.hour - 9) * 2) + (startTime.minute === 30 ? 1 : 0) + 1;

      // duration은 30분 단위 개수를 시간 단위(행)로 변환
      const durationInRows = periodCount / 2; // 30분 교시 2개 = 1시간(1행)

      return {
        startRow: startRow,
        duration: durationInRows
      };
    },

    getCourseType(courseName) {
      // 과목명에 따라 다른 유형 반환 (다른 색상으로 표시하기 위함)
      const types = ['study', 'project', 'exercise', 'hobby', 'social'];
      // 간단한 해시 함수로 과목명에 따라 다른 유형 할당
      const hash = courseName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      return types[hash % types.length];
    },

    getDayNumber(dayChar) {
      const days = { '월': 1, '화': 2, '수': 3, '목': 4, '금': 5 };
      return days[dayChar] || 1;
    },

    getRandomType() {
      const types = ['study', 'project', 'exercise', 'hobby', 'social'];
      return types[Math.floor(Math.random() * types.length)];
    },

    generateDummySchedule() {
      // 더미 시간표 데이터 생성
      this.scheduleData = [
        { day: 1, startHour: 9, duration: 3, title: '마케팅공학', type: 'study', location: 'A동 101호' },
        { day: 2, startHour: 9, duration: 2, title: '재무관리', type: 'project', location: 'B동 203호' },
        { day: 2, startHour: 12, duration: 2, title: '빅데이터분석', type: 'exercise', location: '공대 305호' },
        { day: 3, startHour: 9, duration: 3, title: '실험계획법', type: 'hobby', location: '공학관 402호' },
        { day: 3, startHour: 12, duration: 3, title: '생산관리', type: 'social', location: '경영관 203호' },
        { day: 4, startHour: 9, duration: 2, title: '재무관리', type: 'project', location: 'B동 203호' },
        { day: 4, startHour: 12, duration: 2, title: '빅데이터분석', type: 'exercise', location: '공대 305호' },
        { day: 5, startHour: 11, duration: 3, title: '제조공학', type: 'study', location: '공학관 301호' }
      ];
    },

    restartApp() {
      // 모든 상태 초기화
      this.currentView = 'start';  // 시작 화면으로 돌아가기
      this.currentQuestionIndex = 0;
      this.grade = null;
      this.desiredCredits = 15;
      this.answers = [];
      this.scheduleData = [];
      this.optimizationData = null;
      this.apiResult = null;

      // 페이지 맨 위로 스크롤
      window.scrollTo(0, 0);

      console.log('앱이 초기화되었습니다.');
    }
  }
}
</script>

<style>
.app-container {
  width: 100%;
  min-height: 100vh;
}
</style>