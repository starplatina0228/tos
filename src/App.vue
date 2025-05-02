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

      <div v-else-if="currentView === 'optimization'" key="optimization">
        <optimization-component
          :simulation-time="10000"
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
import QuestionComponent from './components/QuestionComponent.vue';
import OptimizationComponent from './components/OptimizationComponent.vue';
import ScheduleComponent from './components/ScheduleComponent.vue';

export default {
  name: 'App',
  components: {
    StartComponent,
    QuestionComponent,
    OptimizationComponent,
    ScheduleComponent
  },
  data() {
    return {
      currentView: 'start',
      currentQuestionIndex: 0,
      questions: [
        '아침에 일찍 일어나는 것을 선호하나요?',
        '수업을 듣는 것을 좋아하나요?',
        '점심시간을 친구들과 보내나요?',
        '통학을 하고 있나요?',
        '자주 운동을 하나요?',
        '자주 카페에 가나요?',
        '공강이 있었으면 좋겠나요?',
        '자주 과제를 하나요?',
        '자주 시험을 보나요?',
        '자주 스터디를 하나요?',
        '자주 동아리에 가나요?',
        '자주 친구들과 놀러가나요?',
        '우주공강은 피하고 싶나요?'
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
        // 모든 질문에 답변을 완료하면 최적화 화면으로 이동
        this.currentView = 'optimization';
      }
    },
    showSchedule() {
      this.generateSchedule();
      this.currentView = 'schedule';
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

/* 페이지 전환 애니메이션은 이제 style.css에 포함됩니다 */
</style>