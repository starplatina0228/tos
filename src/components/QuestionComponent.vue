<template>
    <div class="question-container">
      <div class="question-card">
        <div class="progress-bar">
          <div class="progress" :style="{ width: `${progress}%` }"></div>
        </div>

        <div class="question-content">
          <h2 class="question-number">질문 {{ questionNumber }}</h2>
          <div class="question-block">
            <slot name="question">Question Block</slot>
          </div>
        </div>

        <div class="button-group">
          <button class="answer-button yes-button" @click="onAnswer(true)">
            <span class="button-text">YES</span>
            <span class="button-icon">✓</span>
          </button>

          <button class="answer-button no-button" @click="onAnswer(false)">
            <span class="button-text">NO</span>
            <span class="button-icon">✕</span>
          </button>
        </div>
      </div>
    </div>
  </template>

  <script>
  export default {
    name: 'QuestionComponent',
    props: {
      questionNumber: {
        type: Number,
        default: 1
      },
      totalQuestions: {
        type: Number,
        default: 1
      }
    },
    computed: {
      progress() {
        return (this.questionNumber / this.totalQuestions) * 100;
      }
    },
    methods: {
      onAnswer(answer) {
        this.$emit('answer', answer);
      }
    }
  }
  </script>

  <style scoped>
  .question-container {
    width: 100%;
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
    padding: 20px;
    box-sizing: border-box;
  }

  .question-card {
    background-color: white;
    border-radius: 16px;
    overflow: hidden;
    width: 100%;
    max-width: 500px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  }

  .progress-bar {
    height: 8px;
    background-color: #e9ecef;
    width: 100%;
    overflow: hidden;
  }

  .progress {
    height: 100%;
    background-color: var(--accent-color);
    transition: width 0.3s ease;
  }

  .question-content {
    padding: 40px 30px;
  }

  .question-number {
    color: var(--gray-color);
    font-size: 18px;
    margin-bottom: 24px;
    font-weight: 500;
  }

  .question-block {
    color: var(--dark-color);
    font-size: 24px;
    font-weight: 500;
    line-height: 1.5;
    margin-bottom: 16px;
  }

  .button-group {
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 0 30px 40px;
  }

  .answer-button {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 24px;
    border-radius: 8px;
    font-size: 18px;
    font-weight: 500;
    border: none;
    transition: all 0.2s ease;
  }

  .yes-button {
    background-color: #e8f3eb;
    color: #2a9d46;
  }

  .no-button {
    background-color: #f9e9e9;
    color: #e05252;
  }

  .yes-button:hover {
    background-color: #d0e9d6;
    transform: translateY(-2px);
  }

  .no-button:hover {
    background-color: #f5d6d6;
    transform: translateY(-2px);
  }

  .button-text {
    font-weight: 600;
  }

  .button-icon {
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
  }

  .yes-button .button-icon {
    background-color: #2a9d46;
    color: white;
  }

  .no-button .button-icon {
    background-color: #e05252;
    color: white;
  }
  </style>