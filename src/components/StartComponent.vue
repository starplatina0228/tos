<template>
  <div class="start-container">
    <div class="start-content">
      <h1 class="title">시간표 만들기</h1>
      <p class="subtitle">몇 가지 질문에 답하고 맞춤형 시간표를 만들어보세요</p>
      <button class="start-button" @click="onStartClick">
        <span>시작하기</span>
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M5 12h14"></path>
          <path d="m12 5 7 7-7 7"></path>
        </svg>
      </button>
    </div>
    <AppFooter type="simple" />  <!-- Footer -> AppFooter -->
  </div>
</template>

<script>
import AppFooter from './Footer.vue';

export default {
  name: 'StartComponent',
  components: {
    AppFooter
  },
  methods: {
    onStartClick() {
      this.$emit('start-clicked');
    }
  }
}
</script>

<style scoped>
.start-container {
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  padding: 20px;
  box-sizing: border-box;
  position: relative;
}

.start-content {
  background-color: white;
  border-radius: 16px;
  padding: 40px;
  text-align: center;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  max-width: 500px;
  width: 100%;
  margin-bottom: 40px;
}

.title {
  color: var(--dark-color);
  font-size: 32px;
  margin-bottom: 16px;
  font-weight: var(--heading-font-weight);
}

.subtitle {
  color: var(--gray-color);
  font-size: 18px;
  margin-bottom: 40px;
  line-height: 1.5;
}

.start-button {
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 16px 32px;
  font-size: 18px;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin: 0 auto;
  transition: all 0.3s ease;
}

.start-button:hover {
  background-color: var(--secondary-color);
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(67, 97, 238, 0.3);
}

.start-button:active {
  transform: translateY(0);
}
</style>