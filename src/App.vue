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
      // API 결과가 있으면 사용, 없으면 더미 데이터 사용
      if (this.apiResult && this.apiResult.selected) {
        // 백엔드 API 응답으로 시간표 항목 생성
        this.scheduleData = this.apiResult.selected.map(course => {
          // 시간 파싱 (예: "월9~10, 수11~12" 형식)
          const timeParts = course.time.split(', ');
          const scheduleItems = [];

          timeParts.forEach(part => {
            const day = this.getDayNumber(part.charAt(0));
            const timeRange = part.substring(1);
            const [start, end] = timeRange.split('~').map(Number);

            scheduleItems.push({
              title: course.name,
              day: day,
              startHour: start + 8, // 1교시는 9시 (1+8)부터 시작
              duration: end - start + 1,
              type: this.getRandomType() // 임시로 랜덤 타입 할당
            });
          });

          return scheduleItems;
        }).flat();
      } else {
        // 더미 데이터 사용
        this.generateDummySchedule();
      }
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
        { day: 1, startHour: 9, duration: 2, title: '공업수학', type: 'study' },
        { day: 1, startHour: 13, duration: 2, title: '대학영어', type: 'study' },
        { day: 2, startHour: 10, duration: 2, title: '일반물리', type: 'study' },
        { day: 3, startHour: 14, duration: 3, title: '종합설계', type: 'project' },
        { day: 4, startHour: 9, duration: 1, title: '러닝', type: 'exercise' },
        { day: 5, startHour: 11, duration: 2, title: 'OR', type: 'hobby' },
        { day: 5, startHour: 15, duration: 2, title: '알바', type: 'social' }
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