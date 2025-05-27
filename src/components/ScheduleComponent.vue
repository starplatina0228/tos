<template>
  <div class="schedule-page">
    <div class="schedule-container">
      <div class="schedule-card">
        <!-- 헤더 섹션 -->
        <div class="schedule-header">
          <h1 class="title">당신의 시간표는</h1>
          <p class="subtitle">맞춤형 일정을 확인해보세요</p>
        </div>

        <!-- 시간표 섹션 -->
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
                  <div
                    v-for="(time, index) in timeSlots"
                    :key="`time-${index}`"
                    class="time"
                  >
                    {{ time }}
                  </div>
                </div>

                <!-- 실제 시간표 내용 -->
                <div class="schedule-grid">
                  <!-- 배경 격자 생성 -->
                  <div
                    v-for="i in 20"
                    :key="`grid-row-${i}`"
                    class="grid-row-divider"
                    :style="{top: `${i * 30}px`}"
                  ></div>

                  <!-- 스케줄 아이템 -->
                  <div
                    v-for="(item, index) in scheduleItems"
                    :key="`schedule-${index}`"
                    class="schedule-item"
                    :style="{
                      gridColumn: `${item.day} / span 1`,
                      gridRow: `${calculateGridRow(item.startHour, item.startMinute)} / span ${calculateGridSpan(item.duration)}`,
                      backgroundColor: getRandomColor(index)
                    }"
                  >
                    <span class="item-title">{{ item.title }}</span>
                    <span v-if="item.location" class="item-location desktop-only">{{ item.location }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 선택된 과목 정보 표시 섹션 -->
        <div class="course-info" v-if="coursesSummary">
          <h2 class="info-title">선택된 과목 정보</h2>

          <!-- 탭 메뉴 -->
          <div class="tab-menu">
            <button
              v-for="tab in tabs"
              :key="tab.id"
              class="tab-button"
              :class="{ active: activeTab === tab.id }"
              @click="activeTab = tab.id"
            >
              {{ tab.label }}
            </button>
          </div>

          <!-- 탭 내용 -->
          <div class="tab-content">
            <!-- 수강 요약 탭 -->
            <div v-show="activeTab === 'summary'" class="tab-panel">
              <!-- 메인 요약 카드 -->
              <div class="summary-header">
                <div class="summary-main-card">
                  <div class="summary-icon">📚</div>
                  <div class="summary-content">
                    <h2 class="summary-title">{{ coursesSummary.totalCredits }}학점</h2>
                    <p class="summary-subtitle">총 {{ coursesSummary.totalCourses }}개 과목 수강</p>
                    <div class="credits-progress">
                      <div class="progress-bar">
                        <div
                          class="progress-fill"
                          :style="{ width: `${progressPercentage}%` }"
                        ></div>
                      </div>
                      <span class="progress-text">목표: {{ userPreferences.desired_credits }}학점</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 상세 분석 그리드 -->
              <div class="analysis-grid">
                <!-- 학점별 분류 카드 -->
                <div class="analysis-card category-card">
                  <div class="card-header">
                    <h3 class="card-title">
                      <span class="card-icon">🎯</span>
                      학점별 분류
                    </h3>
                  </div>
                  <div class="category-breakdown">
                    <div
                      v-for="(credits, category) in coursesSummary.creditsByCategory"
                      :key="category"
                      class="category-item"
                      :class="getCategoryClass(category)"
                      v-show="credits > 0"
                    >
                      <div class="category-info">
                        <span class="category-name">{{ category }}</span>
                        <span class="category-credits">{{ credits }}학점</span>
                      </div>
                      <div class="category-bar">
                        <div
                          class="bar-fill"
                          :style="{ width: `${(credits / coursesSummary.totalCredits) * 100}%` }"
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- 요일별 수업 분포 -->
                <div class="analysis-card schedule-distribution">
                  <div class="card-header">
                    <h3 class="card-title">
                      <span class="card-icon">📅</span>
                      요일별 수업 분포
                    </h3>
                  </div>
                  <div class="day-distribution">
                    <div v-for="(count, day) in dayDistribution" :key="day" class="day-item">
                      <div class="day-info">
                        <span class="day-name">{{ day }}</span>
                        <span class="day-count">{{ count }}과목</span>
                      </div>
                      <div class="day-bar">
                        <div
                          class="bar-fill"
                          :style="{ width: `${getDayBarWidth(count)}%` }"
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- 시간대 분석 -->
                <div class="analysis-card time-analysis">
                  <div class="card-header">
                    <h3 class="card-title">
                      <span class="card-icon">⏰</span>
                      시간대 분석
                    </h3>
                  </div>
                  <div class="time-stats">
                    <div class="time-stat-item">
                      <div class="stat-icon morning">🌅</div>
                      <div class="stat-info">
                        <span class="stat-label">오전 수업</span>
                        <span class="stat-value">{{ timeAnalysis.morning }}개</span>
                      </div>
                    </div>
                    <div class="time-stat-item">
                      <div class="stat-icon afternoon">☀️</div>
                      <div class="stat-info">
                        <span class="stat-label">오후 수업</span>
                        <span class="stat-value">{{ timeAnalysis.afternoon }}개</span>
                      </div>
                    </div>
                    <div class="time-stat-item">
                      <div class="stat-icon evening">💻</div>
                      <div class="stat-info">
                        <span class="stat-label">원격 수업</span>
                        <span class="stat-value">{{ timeAnalysis.remote }}개</span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- 학습 패턴 인사이트 -->
                <div class="analysis-card insights-card">
                  <div class="card-header">
                    <h3 class="card-title">
                      <span class="card-icon">💡</span>
                      학습 패턴 분석
                    </h3>
                  </div>
                  <div class="insights-content">
                    <div
                      v-for="insight in learningInsights"
                      :key="insight.id"
                      class="insight-item"
                      :class="insight.type"
                    >
                      <div class="insight-icon">{{ insight.emoji }}</div>
                      <div class="insight-text">{{ insight.message }}</div>
                    </div>
                  </div>
                </div>

                <!-- 추천사항 -->
                <div class="analysis-card recommendations">
                  <div class="card-header">
                    <h3 class="card-title">
                      <span class="card-icon">✨</span>
                      맞춤 추천
                    </h3>
                  </div>
                  <div class="recommendations-content">
                    <div
                      v-for="rec in recommendations"
                      :key="rec.id"
                      class="recommendation-item"
                    >
                      <div class="rec-badge" :class="rec.type">{{ rec.badge }}</div>
                      <div class="rec-text">{{ rec.message }}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 학점별 분류 탭 -->
            <div v-show="activeTab === 'category'" class="tab-panel">
              <div class="category-list">
                <div
                  v-for="(courses, category) in coursesByCategory"
                  :key="category"
                  class="category-section"
                >
                  <h3 class="category-title">
                    {{ category }}
                    <span class="category-credits">({{ getCategoryCredits(courses) }}학점)</span>
                  </h3>
                  <div class="course-items">
                    <div v-for="course in courses" :key="course.subjId" class="course-item">
                      <div class="course-header">
                        <span class="course-name">{{ course.subjKnm || course.name }}</span>
                        <span class="course-credits">{{ parseCredits(course.crd || course.credits) }}학점</span>
                      </div>
                      <div class="course-details">
                        <span class="course-grade">{{ course.grade }}학년</span>
                        <span class="course-professor">{{ course.wkLecrEmpnm || course.professor }}</span>
                      </div>
                      <div class="course-schedule">
                        <span
                          v-for="(schedule, idx) in (course.schedules || course.schedule_info)"
                          :key="idx"
                          class="schedule-time"
                        >
                          {{ getDayKorean(schedule.day) }} {{ formatTimeSlot(schedule.start_time || schedule.start) }}-{{ formatTimeSlot(schedule.end_time || schedule.end) }}
                          <span v-if="schedule.location" class="schedule-location">({{ schedule.location }})</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 학년별 수강 과목 탭 -->
            <div v-show="activeTab === 'grade'" class="tab-panel">
              <div class="grade-list">
                <div
                  v-for="(courses, grade) in coursesByGrade"
                  :key="grade"
                  class="grade-section"
                >
                  <h3 class="grade-title">
                    {{ grade }}학년
                    <span class="grade-count">({{ courses.length }}과목, {{ getGradeCredits(courses) }}학점)</span>
                  </h3>
                  <div class="course-items">
                    <div v-for="course in courses" :key="course.subjId" class="course-item">
                      <div class="course-header">
                        <span class="course-name">{{ course.subjKnm || course.name }}</span>
                        <span class="course-credits">{{ parseCredits(course.crd || course.credits) }}학점</span>
                      </div>
                      <div class="course-details">
                        <span class="course-category">{{ course.curiCparNm || course.category }}</span>
                        <span class="course-professor">{{ course.wkLecrEmpnm || course.professor }}</span>
                      </div>
                      <div class="course-schedule">
                        <span
                          v-for="(schedule, idx) in (course.schedules || course.schedule_info)"
                          :key="idx"
                          class="schedule-time"
                        >
                          {{ getDayKorean(schedule.day) }} {{ formatTimeSlot(schedule.start_time || schedule.start) }}-{{ formatTimeSlot(schedule.end_time || schedule.end) }}
                          <span v-if="schedule.location" class="schedule-location">({{ schedule.location }})</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 피드백 섹션 -->
        <div class="feedback-section" v-if="!feedbackSubmitted">
          <h2 class="feedback-title">시간표 피드백</h2>
          <p class="feedback-description">생성된 시간표에 대한 의견을 알려주세요!</p>

          <div class="feedback-form">
            <textarea
              v-model="feedbackText"
              class="feedback-input"
              :class="{ 'error': feedbackError && !feedbackText.trim() }"
              placeholder="시간표 최적화 서비스에 대한 개선사항 및 의견을 자유롭게 작성해주세요. (필수 입력)"
              rows="4"
              :disabled="isSubmitting"
            ></textarea>

            <div v-if="feedbackError" class="feedback-error">
              {{ feedbackError }}
            </div>

            <button
              class="submit-button"
              @click="submitFeedback"
              :disabled="isSubmitting || !feedbackText.trim()"
              :class="{ 'disabled': !feedbackText.trim() }"
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
        <Transition name="notification">
          <div v-if="saveSuccess" class="save-notification success">
            <span class="notification-icon">✓</span>
            시간표가 클립보드에 복사되었습니다!
          </div>
        </Transition>

        <Transition name="notification">
          <div v-if="saveError" class="save-notification error">
            <span class="notification-icon">⚠</span>
            {{ saveError }}
          </div>
        </Transition>
      </div>
    </div>
    <AppFooter type="full" />
  </div>
</template>

<script>
import { API_CONFIG } from '@/config/api'
import html2canvas from 'html2canvas'
import AppFooter from './Footer.vue'

// 상수 정의
const TIME_CONSTANTS = {
  START_HOUR: 9,
  SLOT_DURATION: 30,
  TOTAL_SLOTS: 20
}

const TABS = [
  { id: 'summary', label: '수강 요약' },
  { id: 'category', label: '학점별 분류' },
  { id: 'grade', label: '학년별 수강 과목' }
]

const COLOR_PALETTE = [
  '#6366f1', // 보라계열 (primary 변형)
  '#8b5cf6', // 연보라
  '#06b6d4', // 청록색 (accent 변형)
  '#10b981', // 초록색 (success)
  '#f59e0b', // 주황색 (warning 변형)
  '#ef4444', // 빨간색 (error)
  '#64748b', // 회청색 (gray 변형)
  '#7c3aed', // 진보라
  '#0ea5e9', // 하늘색
  '#059669', // 진초록
  '#dc2626', // 진빨강
  '#7c2d12', // 갈색
  '#be185d', // 분홍색
  '#4338ca', // 남색
  '#1e40af', // 진파랑
  '#166534', // 진초록
  '#92400e', // 황토색
  '#7e22ce'  // 자주색
]

// 유틸리티 함수들
const parseCredits = (creditString) => {
  if (typeof creditString === 'number') return creditString
  if (typeof creditString === 'string') {
    const match = creditString.match(/^(\d+)/)
    return match ? parseInt(match[1]) : 0
  }
  return 0
}

const formatTimeSlot = (timeSlot) => {
  if (typeof timeSlot === 'number') {
    const hour = Math.floor((timeSlot - 1) / 2) + TIME_CONSTANTS.START_HOUR
    const minute = ((timeSlot - 1) % 2) * TIME_CONSTANTS.SLOT_DURATION
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
  }
  return timeSlot
}

const getDayKorean = (day) => {
  const dayMap = {
    'MON': '월', 'TUE': '화', 'WED': '수', 'THU': '목', 'FRI': '금',
    'monday': '월', 'tuesday': '화', 'wednesday': '수', 'thursday': '목', 'friday': '금'
  }
  return dayMap[day] || day
}

export default {
  name: 'ScheduleComponent',
  components: {
    AppFooter
  },
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
  emits: ['restart'],
  data() {
    return {
      // 탭 관련
      activeTab: 'summary',
      tabs: TABS,

      // 피드백 관련
      feedbackText: '',
      feedbackSubmitted: false,
      isSubmitting: false,
      feedbackError: null,

      // 저장 관련
      isSaving: false,
      saveSuccess: false,
      saveError: null,

      // 과목 데이터
      selectedCourses: [],
      coursesSummary: null,

      colorMap: new Map()
    }
  },
  computed: {
    // 시간표 아이템
    scheduleItems() {
      return this.scheduleData.length > 0 ? this.scheduleData : this.generateDummySchedule()
    },

    // 시간 슬롯 배열
    timeSlots() {
      const slots = []
      for (let i = 0; i < TIME_CONSTANTS.TOTAL_SLOTS; i++) {
        const hour = Math.floor(i / 2) + TIME_CONSTANTS.START_HOUR
        const minute = (i % 2) * TIME_CONSTANTS.SLOT_DURATION
        slots.push(`${hour}:${minute.toString().padStart(2, '0')}`)
      }
      return slots
    },

    // 진행률 계산
    progressPercentage() {
      if (!this.coursesSummary || !this.userPreferences.desired_credits) return 0
      return Math.min((this.coursesSummary.totalCredits / this.userPreferences.desired_credits) * 100, 100)
    },

    // 카테고리별 과목 그룹화
    coursesByCategory() {
      const grouped = {}
      this.selectedCourses.forEach(course => {
        const category = course.curiCparNm || course.category || '기타'
        if (!grouped[category]) grouped[category] = []
        grouped[category].push(course)
      })
      return grouped
    },

    // 학년별 과목 그룹화
    coursesByGrade() {
      const grouped = {}
      this.selectedCourses.forEach(course => {
        const grade = course.grade || '미분류'
        if (!grouped[grade]) grouped[grade] = []
        grouped[grade].push(course)
      })
      return grouped
    },

    // 요일별 수업 분포
    dayDistribution() {
      const distribution = { '월': 0, '화': 0, '수': 0, '목': 0, '금': 0 }

      this.selectedCourses.forEach(course => {
        const schedules = course.schedules || course.schedule_info || []
        schedules.forEach(schedule => {
          const day = schedule.day
          if (day in distribution) {
            distribution[day]++
          }
        })
      })

      return distribution
    },

    // 시간대별 분석
    timeAnalysis() {
      let morning = 0, afternoon = 0, remote = 0

      this.selectedCourses.forEach(course => {
        const schedules = course.schedules || course.schedule_info || []
        schedules.forEach(schedule => {
          const startTime = schedule.start_time || schedule.start
          const location = schedule.location || ''

          // 원격 수업 판별 (온라인, 비대면 등의 키워드 포함)
          if (location.includes('온라인') || location.includes('비대면') || location.includes('원격') ||
              location.includes('사이버') || location.includes('ZOOM') || location.includes('Teams')) {
            remote++
          }
          // 시간대별 분류 (1교시 = 9:00, 18교시 = 17:30 기준)
          else if (startTime >= 1 && startTime <= 8) { // 9:00 ~ 12:30
            morning++
          } else if (startTime >= 9 && startTime <= 18) { // 13:00 ~ 17:30
            afternoon++
          }
        })
      })

      return { morning, afternoon, remote }
    },

    // 학습 패턴 인사이트
    learningInsights() {
      const insights = []

      // 요일 집중도 분석
      const dayValues = Object.values(this.dayDistribution)
      const maxDayCount = Math.max(...dayValues)
      const maxDay = Object.keys(this.dayDistribution).find(day => this.dayDistribution[day] === maxDayCount)

      if (maxDayCount > 2) {
        insights.push({
          id: 1,
          type: 'warning',
          emoji: '⚠️',
          message: `${maxDay}요일에 ${maxDayCount}개 수업이 집중되어 있어요. 체력 관리에 신경 쓰세요!`
        })
      }

      // 시간대 분석
      if (this.timeAnalysis.morning > this.timeAnalysis.afternoon) {
        insights.push({
          id: 2,
          type: 'positive',
          emoji: '🌅',
          message: '오전 수업 위주로 구성되어 하루를 효율적으로 활용할 수 있어요!'
        })
      }

      // 학점 달성도
      const achievementRate = (this.coursesSummary?.totalCredits / this.userPreferences.desired_credits) * 100
      if (achievementRate >= 90) {
        insights.push({
          id: 3,
          type: 'success',
          emoji: '🎯',
          message: `목표 학점의 ${Math.round(achievementRate)}%를 달성했습니다!`
        })
      }

      return insights.length > 0 ? insights : [{
        id: 0,
        type: 'info',
        emoji: '📊',
        message: '균형 잡힌 시간표가 구성되었습니다!'
      }]
    },

    // 맞춤 추천사항
    recommendations() {
      const recs = []

      // 공강일 추천
      const hasFreeDays = Object.values(this.dayDistribution).some(count => count === 0)
      if (hasFreeDays) {
        recs.push({
          id: 1,
          type: 'success',
          badge: '👍',
          message: '공강일이 있어 휴식과 자율학습 시간을 확보할 수 있어요!'
        })
      }

      // 전공 비율 분석
      if (this.coursesSummary) {
        const majorCredits = (this.coursesSummary.creditsByCategory.전공필수 || 0) +
                            (this.coursesSummary.creditsByCategory.전공선택 || 0)
        const majorRatio = majorCredits / this.coursesSummary.totalCredits

        if (majorRatio > 0.7) {
          recs.push({
            id: 2,
            type: 'info',
            badge: '📚',
            message: '전공 과목 위주로 구성되어 전문성 향상에 도움이 됩니다!'
          })
        }
      }

      // 시간 효율성
      if (this.timeAnalysis.morning > 2) {
        recs.push({
          id: 3,
          type: 'tip',
          badge: '⏰',
          message: '오전 수업이 많으니 충분한 수면과 아침 식사를 챙기세요!'
        })
      }

      // 원격 수업 관련 추천
      if (this.timeAnalysis.remote > 0) {
        recs.push({
          id: 4,
          type: 'info',
          badge: '💻',
          message: `원격 수업 ${this.timeAnalysis.remote}개가 있어 이동시간을 절약할 수 있어요!`
        })
      }

      return recs.length > 0 ? recs : [{
        id: 0,
        type: 'default',
        badge: '✨',
        message: '잘 구성된 시간표입니다. 학업에 집중하세요!'
      }]
    }
  },
  watch: {
    // 저장 상태 자동 초기화
    saveSuccess(newVal) {
      if (newVal) {
        setTimeout(() => {
          this.saveSuccess = false
        }, 3000)
      }
    },
    saveError(newVal) {
      if (newVal) {
        setTimeout(() => {
          this.saveError = null
        }, 5000)
      }
    }
  },
  created() {
    if (this.apiResult?.selected) {
      this.processSelectedCourses(this.apiResult.selected)
    }
  },
  methods: {
    // 데이터 처리 메소드들
    processSelectedCourses(courses) {
      this.selectedCourses = courses

      const totalCredits = courses.reduce((sum, course) => {
        return sum + parseCredits(course.crd || course.credits)
      }, 0)

      const creditsByCategory = {}
      courses.forEach(course => {
        const category = course.curiCparNm || course.category || '기타'
        const credits = parseCredits(course.crd || course.credits)
        creditsByCategory[category] = (creditsByCategory[category] || 0) + credits
      })

      const coursesByGrade = {}
      courses.forEach(course => {
        const grade = course.grade || '미분류'
        coursesByGrade[grade] = (coursesByGrade[grade] || 0) + 1
      })

      this.coursesSummary = {
        totalCredits,
        totalCourses: courses.length,
        creditsByCategory,
        coursesByGrade
      }
    },

    // 유틸리티 메소드들
    parseCredits,
    formatTimeSlot,
    getDayKorean,

    calculateGridRow(hour, minute = 0) {
      const hourOffset = (hour - TIME_CONSTANTS.START_HOUR) * 2
      const minuteOffset = minute === 30 ? 1 : 0
      return hourOffset + minuteOffset + 1
    },

    calculateGridSpan(durationHours) {
      return durationHours * 2
    },

    getCategoryClass(category) {
      const classMap = {
        '전공필수': 'major-required',
        '전공선택': 'major-elective',
        '공학기초': 'engineering-basic'
      }
      return classMap[category] || 'others'
    },

    getDayBarWidth(count) {
      const dayValues = Object.values(this.dayDistribution)
      const maxCount = Math.max(...dayValues)
      return count > 0 ? (count / maxCount) * 100 : 0
    },

    getCategoryCredits(courses) {
      return courses.reduce((sum, course) => {
        return sum + parseCredits(course.crd || course.credits)
      }, 0)
    },

    getGradeCredits(courses) {
      return courses.reduce((sum, course) => {
        return sum + parseCredits(course.crd || course.credits)
      }, 0)
    },

    // API 호출 메소드들
    async submitFeedback() {
      if (!this.feedbackText.trim()) {
        this.feedbackError = "피드백 의견을 입력해주세요."
        return
      }

      try {
        this.isSubmitting = true
        this.feedbackError = null

        const feedbackData = {
          comment: this.feedbackText.trim(),
          schedule: this.scheduleData || [],
          preferences: this.userPreferences
        }

        const apiUrl = API_CONFIG.getFullUrl(API_CONFIG.endpoints.FEEDBACK)
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(feedbackData)
        })

        if (!response.ok) {
          throw new Error(`서버 응답 오류: ${response.status}`)
        }

        await response.json()
        this.feedbackSubmitted = true

        // 스크롤 처리
        this.$nextTick(() => {
          const successEl = this.$el.querySelector('.feedback-success')
          if (successEl) {
            successEl.scrollIntoView({ behavior: 'smooth' })
          }
        })

      } catch (error) {
        console.error('피드백 제출 오류:', error)
        this.feedbackError = "피드백 제출 중 오류가 발생했습니다. 나중에 다시 시도해주세요."
      } finally {
        this.isSubmitting = false
      }
    },

    async onSave() {
      if (this.isSaving) return

      this.isSaving = true
      this.saveSuccess = false
      this.saveError = null

      try {
        const timetableEl = this.$el.querySelector('.timetable')
        if (!timetableEl) {
          throw new Error('시간표 요소를 찾을 수 없습니다.')
        }

        const canvas = await html2canvas(timetableEl, {
          backgroundColor: '#ffffff',
          scale: 2,
          useCORS: true,
          logging: false
        })

        canvas.toBlob(async (blob) => {
          try {
            if (navigator.clipboard && navigator.clipboard.write) {
              const clipboardItem = new ClipboardItem({ 'image/png': blob })
              await navigator.clipboard.write([clipboardItem])
            } else {
              // 구형 브라우저용 다운로드
              const url = URL.createObjectURL(blob)
              const a = document.createElement('a')
              a.href = url
              a.download = '내_시간표.png'
              document.body.appendChild(a)
              a.click()
              document.body.removeChild(a)
              URL.revokeObjectURL(url)
            }
            this.saveSuccess = true
          } catch (clipError) {
            console.error('클립보드 저장 실패:', clipError)
            this.saveError = '클립보드에 저장할 수 없습니다. 권한을 확인하거나 다시 시도해주세요.'
          } finally {
            this.isSaving = false
          }
        }, 'image/png')

      } catch (error) {
        console.error('이미지 생성 오류:', error)
        this.saveError = '시간표 이미지를 생성할 수 없습니다. 다시 시도해주세요.'
        this.isSaving = false
      }
    },

    onRestart() {
      this.$emit('restart')
    },

    // 랜덤 색상 생성 메소드 추가
    getRandomColor(index) {
      const key = `${index}`
      if (!this.colorMap.has(key)) {
        const colorIndex = index % COLOR_PALETTE.length
        this.colorMap.set(key, COLOR_PALETTE[colorIndex])
      }
      return this.colorMap.get(key)
    },

    generateDummySchedule() {
      return [
        { day: 1, startHour: 9, startMinute: 0, duration: 2, title: '공업수학' },
        { day: 1, startHour: 13, startMinute: 0, duration: 2, title: '대학영어' },
        { day: 2, startHour: 10, startMinute: 0, duration: 2, title: '일반물리' },
        { day: 3, startHour: 14, startMinute: 0, duration: 3, title: '종합설계' },
        { day: 4, startHour: 9, startMinute: 0, duration: 1, title: '러닝' },
        { day: 5, startHour: 11, startMinute: 0, duration: 2, title: 'OR' },
        { day: 5, startHour: 15, startMinute: 0, duration: 2, title: '알바' }
      ]
    }
  }
}
</script>

<style scoped>
/* ==========================================================================
   1. 기본 레이아웃
   ========================================================================== */
.schedule-page {
  width: 100%;
  min-height: 100vh;
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  display: flex;
  flex-direction: column;
}

.schedule-container {
  flex: 1;
  width: 100%;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
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
   3. 시간표 스타일
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
  position: relative;
}

.time-column {
  width: 60px;
  flex-shrink: 0;
  z-index: 2;
  background-color: #f8f9fa;
  border-right: 1px solid #e9ecef;
}

.time {
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--gray-color);
  font-size: 12px;
  border-bottom: 1px solid #e9ecef;
  box-sizing: border-box;
}

.schedule-grid {
  flex-grow: 1;
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  grid-template-rows: repeat(20, 30px);
  position: relative;
  min-height: 540px;
  border: 1px solid #e9ecef;
  border-left: none;
}

.grid-row-divider {
  position: absolute;
  left: 0;
  right: 0;
  height: 1px;
  background-color: #e9ecef;
  z-index: 1;
}

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
  z-index: 5;
  transition: transform 0.2s, box-shadow 0.2s;
  word-wrap: break-word;      /* 추가: 긴 단어 줄바꿈 */
  word-break: break-word;     /* 추가: 단어 중간에서도 줄바꿈 */
  hyphens: auto;              /* 추가: 하이픈으로 단어 분리 */
}

.schedule-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  z-index: 10;
}

.item-title {
  overflow: visible;          /* 수정: hidden -> visible */
  text-overflow: clip;        /* 수정: ellipsis -> clip */
  white-space: normal;        /* 수정: nowrap -> normal */
  font-weight: bold;
  margin-bottom: 2px;
  word-wrap: break-word;      /* 추가 */
  word-break: break-word;     /* 추가 */
  line-height: 1.2;          /* 추가: 줄 간격 조정 */
}

.item-location {
  font-size: 0.8rem;
  opacity: 0.8;
  word-wrap: break-word;      /* 추가 */
  word-break: break-word;     /* 추가 */
  line-height: 1.1;          /* 추가: 줄 간격 조정 */
}

/* ==========================================================================
   4. 탭 메뉴 스타일
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

.tab-menu {
  display: flex;
  justify-content: center;
  margin-bottom: 30px;
  border-bottom: 2px solid #e9ecef;
}

.tab-button {
  padding: 12px 24px;
  border: none;
  background: none;
  font-size: 16px;
  font-weight: 500;
  color: var(--gray-color);
  cursor: pointer;
  border-bottom: 3px solid transparent;
  transition: all 0.3s ease;
  margin: 0 8px;
}

.tab-button:hover {
  color: var(--primary-color);
}

.tab-button.active {
  color: var(--primary-color);
  border-bottom-color: var(--primary-color);
  font-weight: 600;
}

.tab-content {
  min-height: 200px;
}

.tab-panel {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* ==========================================================================
   5. 수강 요약 스타일
   ========================================================================== */
.summary-header {
  margin-bottom: 30px;
}

.summary-main-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20px;
  padding: 30px;
  color: white;
  text-align: center;
  box-shadow: 0 8px 32px rgba(102, 126, 234, 0.3);
  position: relative;
  overflow: hidden;
}

.summary-main-card::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -50%;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
  border-radius: 50%;
}

.summary-icon {
  font-size: 48px;
  margin-bottom: 15px;
  display: block;
}

.summary-title {
  font-size: 36px;
  font-weight: 700;
  margin: 0 0 8px 0;
  text-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

.summary-subtitle {
  font-size: 16px;
  opacity: 0.9;
  margin: 0 0 20px 0;
}

.credits-progress {
  background: rgba(255,255,255,0.2);
  border-radius: 20px;
  padding: 15px;
  margin-top: 20px;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: rgba(255,255,255,0.3);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
}

.progress-fill {
  height: 100%;
  background: white;
  border-radius: 4px;
  transition: width 1.5s ease;
  box-shadow: 0 0 10px rgba(255,255,255,0.5);
}

.progress-text {
  font-size: 14px;
  opacity: 0.9;
}

/* ==========================================================================
   6. 분석 그리드 스타일
   ========================================================================== */
.analysis-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 25px;
}

.analysis-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.analysis-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 30px rgba(0,0,0,0.15);
}

.card-header {
  padding: 20px 20px 0 20px;
}

.card-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 18px;
  font-weight: 600;
  color: var(--dark-color);
  margin: 0 0 20px 0;
}

.card-icon {
  font-size: 20px;
}

/* 카테고리 분류 스타일 */
.category-breakdown {
  padding: 20px 20px 20px 20px;
}

.category-item {
  margin-bottom: 15px;
}

.category-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.category-name {
  font-weight: 500;
  color: var(--dark-color);
}

.category-credits {
  font-weight: 600;
  color: var(--primary-color);
}

.category-bar {
  height: 6px;
  background: #f1f3f4;
  border-radius: 3px;
  overflow: hidden;
}

.category-bar .bar-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 1s ease;
}

.major-required .bar-fill { background: linear-gradient(90deg, #ff6b6b, #ee5a24); }
.major-elective .bar-fill { background: linear-gradient(90deg, #4ecdc4, #44bd87); }
.engineering-basic .bar-fill { background: linear-gradient(90deg, #45b7d1, #4d79a4); }
.others .bar-fill { background: linear-gradient(90deg, #f39c12, #d68910); }

/* 요일별 수업 분포 스타일 */
.day-distribution {
  padding: 20px 20px 20px 20px;
}

.day-item {
  margin-bottom: 12px;
}

.day-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.day-name {
  font-weight: 500;
  color: var(--dark-color);
}

.day-count {
  font-size: 14px;
  color: var(--gray-color);
}

.day-bar {
  height: 4px;
  background: #f1f3f4;
  border-radius: 2px;
  overflow: hidden;
}

.day-bar .bar-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--primary-color), var(--secondary-color));
  border-radius: 2px;
  transition: width 1s ease;
}

/* 시간대 분석 스타일 */
.time-stats {
  padding: 20px 20px 20px 20px;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.time-stat-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 10px;
  transition: background 0.3s ease;
}

.time-stat-item:hover {
  background: #e9ecef;
}

.stat-icon {
  font-size: 24px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-icon.morning { background: linear-gradient(135deg, #ffeaa7, #fdcb6e); }
.stat-icon.afternoon { background: linear-gradient(135deg, #fd79a8, #e84393); }
.stat-icon.evening { background: linear-gradient(135deg, #74b9ff, #0984e3); }

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-label {
  font-size: 14px;
  color: var(--gray-color);
  margin-bottom: 2px;
}

.stat-value {
  font-size: 18px;
  font-weight: 600;
  color: var(--dark-color);
}

/* 인사이트 카드 스타일 */
.insights-content {
  padding: 20px 20px 20px 20px;
}

.insight-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 15px;
  margin-bottom: 12px;
  background: #f8f9fa;
  border-radius: 12px;
  border-left: 4px solid transparent;
  transition: all 0.3s ease;
}

.insight-item:hover {
  background: white;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.insight-item.warning { border-left-color: #f39c12; background: #fff8e1; }
.insight-item.positive { border-left-color: #27ae60; background: #e8f5e8; }
.insight-item.success { border-left-color: #3498db; background: #e3f2fd; }
.insight-item.info { border-left-color: #9b59b6; background: #f3e5f5; }

.insight-icon {
  font-size: 20px;
  margin-top: 2px;
}

.insight-text {
  font-size: 14px;
  line-height: 1.5;
  color: var(--dark-color);
}

/* 추천사항 스타일 */
.recommendations-content {
  padding: 20px 20px 20px 20px;
}

.recommendation-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  margin-bottom: 10px;
  background: #f8f9fa;
  border-radius: 10px;
  transition: all 0.3s ease;
}

.recommendation-item:hover {
  background: white;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.rec-badge {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  flex-shrink: 0;
}

.rec-badge.success { background: linear-gradient(135deg, #00b894, #00a085); }
.rec-badge.info { background: linear-gradient(135deg, #0984e3, #74b9ff); }
.rec-badge.tip { background: linear-gradient(135deg, #fdcb6e, #e17055); }
.rec-badge.default { background: linear-gradient(135deg, #a29bfe, #6c5ce7); }

.rec-text {
  font-size: 14px;
  line-height: 1.4;
  color: var(--dark-color);
}

/* ==========================================================================
   7. 과목 리스트 스타일
   ========================================================================== */
.category-list, .grade-list {
  display: flex;
  flex-direction: column;
  gap: 25px;
}

.category-section, .grade-section {
  border: 1px solid #e9ecef;
  border-radius: 12px;
  overflow: hidden;
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.category-title, .grade-title {
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  color: white;
  padding: 15px 20px;
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.category-credits, .grade-count {
  font-size: 14px;
  opacity: 0.9;
  background: rgba(255, 255, 255, 0.9);
  color: var(--primary-color);
  padding: 4px 12px;
  border-radius: 20px;
  font-weight: 600;
}

.course-items {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.course-item {
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 15px;
  transition: all 0.2s ease;
}

.course-item:hover {
  background-color: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
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
  background-color: #e9ecef;
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
   8. 피드백 섹션
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

.feedback-form {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
  margin-top: 15px;
}

.feedback-input {
  width: 100%;
  padding: 12px;
  border: 2px solid #d1d5db;
  border-radius: 8px;
  resize: vertical;
  font-family: inherit;
  margin-bottom: 15px;
  transition: border-color 0.3s ease;
}

.feedback-input:focus {
  outline: none;
  border-color: var(--primary-color);
}

.feedback-input.error {
  border-color: #e53e3e;
  background-color: #fff5f5;
}

.feedback-error {
  color: #e53e3e;
  background-color: #fff5f5;
  border-left: 3px solid #e53e3e;
  padding: 10px;
  margin-bottom: 15px;
  border-radius: 4px;
  font-size: 14px;
  width: 100%;
  box-sizing: border-box;
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
  width: auto;
  min-width: 200px;
  text-align: center;
}

.submit-button:hover:not(:disabled) {
  background-color: var(--secondary-color);
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(67, 97, 238, 0.3);
}

.submit-button:disabled,
.submit-button.disabled {
  background-color: #cbd5e0;
  color: #a0aec0;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
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

/* ==========================================================================
   9. 액션 버튼
   ========================================================================== */
.action-buttons {
  display: flex;
  justify-content: center;
  gap: 16px;
  padding: 30px;
  border-top: 1px solid #e9ecef;
}

.action-buttons.with-margin {
  margin-top: 20px;
}

.action-button {
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.restart-button {
  background-color: #e9ecef;
  color: var(--gray-color);
}

.restart-button:hover {
  background-color: #dee2e6;
  transform: translateY(-1px);
}

.save-button {
  background-color: var(--primary-color);
  color: white;
}

.save-button:hover:not(:disabled) {
  background-color: var(--secondary-color);
  transform: translateY(-1px);
}

.save-button:disabled {
  background-color: #cbd5e0;
  color: #9ca3af;
  cursor: not-allowed;
  transform: none;
}

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

/* ==========================================================================
   10. 저장 알림
   ========================================================================== */
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

/* 알림 트랜지션 */
.notification-enter-active, .notification-leave-active {
  transition: all 0.3s ease;
}

.notification-enter-from {
  transform: translate(-50%, 20px);
  opacity: 0;
}

.notification-leave-to {
  opacity: 0;
}

/* ==========================================================================
   11. 반응형 디자인
   ========================================================================== */
@media (max-width: 768px) {
  .schedule-card {
    max-width: 95%;
    margin: 10px;
  }

  .title {
    font-size: 24px;
  }

  .desktop-only {
    display: none;
  }

  .schedule-item {
    font-size: 11px;
    padding: 2px;
    line-height: 1.1;
  }

  .item-title {
    font-size: 11px;
    line-height: 1.1;
    margin-bottom: 1px;
  }

  .tab-menu {
    flex-direction: column;
    gap: 8px;
  }

  .tab-button {
    margin: 0;
    padding: 10px 16px;
  }

  .analysis-grid {
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

  .category-title, .grade-title {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .action-buttons {
    flex-direction: column;
    gap: 12px;
    padding: 20px;
  }

  .action-button {
    width: 100%;
  }

  .schedule-content {
    padding: 20px;
  }

  .feedback-section {
    padding: 20px;
  }

  .course-info {
    padding: 20px;
  }

  .schedule-header {
    padding: 20px;
  }
}

@media (max-width: 480px) {
  .schedule-container {
    padding: 10px;
  }

  .summary-title {
    font-size: 28px;
  }

  .summary-icon {
    font-size: 36px;
  }

  .time {
    font-size: 10px;
  }

  .schedule-item {
    font-size: 10px;
    padding: 2px;
  }

  .analysis-card {
    margin: 0 -10px;
  }

  .submit-button {
    min-width: 150px;
  }
}

/* ==========================================================================
   12. 성능 최적화 및 접근성
   ========================================================================== */
@media (prefers-reduced-motion: reduce) {
  .analysis-card,
  .course-item,
  .submit-button,
  .action-button,
  .progress-fill,
  .bar-fill,
  .tab-panel {
    animation: none !important;
    transition: none !important;
  }
}

@media (prefers-contrast: high) {
  .analysis-card {
    border: 2px solid var(--border-color);
  }

  .course-item {
    border: 2px solid #dee2e6;
  }
}

/* 포커스 상태 개선 */
.tab-button:focus,
.submit-button:focus,
.action-button:focus {
  outline: 2px solid var(--primary-color);
  outline-offset: 2px;
}

.feedback-input:focus {
  box-shadow: 0 0 0 3px rgba(67, 97, 238, 0.1);
}
</style>

