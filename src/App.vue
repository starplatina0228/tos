<template>
  <div class="app-container">
    <transition name="fade" mode="out-in">
      <div v-if="currentView === 'start'" key="start">
        <start-component @start-clicked="showQuestion"/>
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
import QuestionComponent from './components/QuestionComponent.vue';
import ScheduleComponent from './components/ScheduleComponent.vue';

export default {
  name: 'App',
  components: {
    StartComponent,
    QuestionComponent,
    ScheduleComponent
  },
  data() {
    return {
      currentView: 'start',
      currentQuestionIndex: 0,
      questions: [
        '아침에 일찍 일어나는 것을 선호하나요?',
        '저녁에 공부하는 것을 좋아하나요?',
        '주말에 공부하는 것을 선호하나요?',
        '장시간 집중하는 것이 편안한가요?',
        '휴식 시간이 자주 필요한가요?'
      ],
      answers: [],
      scheduleData: []
    }
  },
  computed: {
    currentQuestion() {
      return this.questions[this.currentQuestionIndex];
    }
  },
  methods: {
    showQuestion() {
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
        this.generateSchedule();
        this.currentView = 'schedule';
      }
    },
    generateSchedule() {
      // 여기서 답변을 기반으로 스케줄 생성 로직 구현
      this.scheduleData = this.answers.map(item => {
        return {
          question: item.question,
          answer: item.answer ? 'YES' : 'NO'
        };
      });
    },
    restartApp() {
      this.currentView = 'start';
      this.currentQuestionIndex = 0;
      this.answers = [];
      this.scheduleData = [];
    }
  }
}
</script>

<style>
.app-container {
  width: 100%;
  min-height: 100vh;
}

/* 페이지 전환 애니메이션 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>