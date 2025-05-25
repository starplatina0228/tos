<template>
  <footer :class="['cois-footer', `cois-footer--${type}`]">
    <!-- Simple 타입 (시작화면용) -->
    <div v-if="type === 'simple'" class="footer-content">
      <div class="footer-logo">
        <img :src="`${publicPath}images/COIS_2.png`" alt="COIS" class="logo-image">
      </div>
      <div class="footer-text">
        <p class="footer-description">
          Powered by <strong>COIS Lab</strong> -
          Computational Optimization for Intelligent Systems
        </p>
        <p class="footer-copyright">
          © 2025 COIS. 단국대학교 경영공학과
        </p>
      </div>
    </div>

    <!-- Full 타입 (메인화면용) -->
    <div v-else-if="type === 'full'" class="footer-container">
      <div class="footer-content">
        <div class="footer-info">
          <div class="footer-logo">
            <img :src="`${publicPath}images/COIS_2.png`" alt="COIS" class="logo-image">
          </div>
          <div class="footer-text">
            <h3 class="footer-title">COIS Lab</h3>
            <p class="footer-description">
              Computational Optimization for Intelligent Systems Driving Innovation with Optimization, Data Analytics, and AI/ML<br>
              Join COIS Lab to Solve Industrial Challenges and Grow with Us!
            </p>
            <div class="footer-contact">
              <div class="contact-item">
                <span class="contact-label">Tel.</span>
                <span class="contact-value">041-550-3572</span>
              </div>
              <div class="contact-item">
                <span class="contact-label">Email.</span>
                <span class="contact-value">cois.dankook@gmail.com</span>
              </div>
            </div>
          </div>
        </div>
        <div class="footer-bottom">
          <p class="footer-copyright">
            © 2025 COIS Lab, 단국대학교 경영공학과. All Rights Reserved.
          </p>
          <p class="footer-thanks">
            시간표 최적화 서비스를 이용해 주셔서 감사합니다! 🎓✨
          </p>
        </div>
      </div>
    </div>
  </footer>
</template>

<script>
export default {
  name: 'AppFooter',
  props: {
    type: {
      type: String,
      default: 'simple',
      validator(value) {
        return ['simple', 'full'].includes(value);
      },
    },
  },
  data() {
    return {
      publicPath: process.env.BASE_URL,
    };
  },
  mounted() {
    console.log('Environment:', process.env.NODE_ENV);
    console.log('publicPath:', this.publicPath);
    console.log('Image URL:', `${this.publicPath}images/COIS_2.png`);
  },
};
</script>

<style scoped>
/* ==========================================================================
   기본 푸터 스타일
   ========================================================================== */
.cois-footer {
  color: white;
  position: relative;
  overflow: hidden;
}

.cois-footer::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
}

/* ==========================================================================
   Simple 타입 (시작화면용)
   ========================================================================== */
.cois-footer--simple {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding: 20px 0;
}

.cois-footer--simple .footer-content {
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  padding: 0 20px;
}

.cois-footer--simple .footer-text {
  text-align: center;
}

.cois-footer--simple .footer-description {
  font-size: 14px;
  margin: 0 0 5px 0;
  opacity: 0.9;
  line-height: 1.4;
}

.cois-footer--simple .footer-copyright {
  font-size: 12px;
  margin: 0;
  opacity: 0.7;
}

/* ==========================================================================
   Full 타입 (메인화면용)
   ========================================================================== */
.cois-footer--full {
  background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
}

.cois-footer--full .footer-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px 20px;
}

.cois-footer--full .footer-content {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.cois-footer--full .footer-info {
  display: flex;
  gap: 30px;
  align-items: flex-start;
}

.cois-footer--full .footer-title {
  font-size: 24px;
  font-weight: 700;
  margin: 0 0 10px 0;
  color: #ffffff;
}

.cois-footer--full .footer-description {
  font-size: 16px;
  line-height: 1.6;
  margin: 0 0 20px 0;
  opacity: 0.9;
  color: #ecf0f1;
}

.cois-footer--full .footer-contact {
  display: flex;
  gap: 25px;
  flex-wrap: wrap;
}

.cois-footer--full .contact-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.cois-footer--full .contact-label {
  font-weight: 600;
  color: #bdc3c7;
  min-width: 50px;
}

.cois-footer--full .contact-value {
  color: white;
  font-weight: 500;
}

.cois-footer--full .footer-bottom {
  text-align: center;
  padding-top: 20px;
  border-top: 1px solid rgba(255,255,255,0.1);
}

.cois-footer--full .footer-copyright {
  font-size: 14px;
  color: #95a5a6;
  margin: 0 0 8px 0;
}

.cois-footer--full .footer-thanks {
  font-size: 16px;
  color: #ecf0f1;
  margin: 0;
  font-weight: 500;
}

/* ==========================================================================
   공통 요소 스타일
   ========================================================================== */
.footer-logo {
  flex-shrink: 0;
}

.logo-image {
  height: 80px;  /* 40px -> 60px로 증가 */
  width: auto;
  opacity: 0.9;
  transition: all 0.3s ease;
}

.cois-footer--full .logo-image {
  height: 100px;  /* 60px -> 80px로 증가 */
  filter: brightness(1) contrast(1);
}

.logo-image:hover {
  opacity: 1;
  transform: scale(1.05);
}

.cois-footer--full .logo-image:hover {
  filter: brightness(1.1) contrast(1.1);
}

.footer-text {
  flex: 1;
  color: white;
}

.footer-description strong {
  font-weight: 600;
  color: #ffffff;
}

/* ==========================================================================
   반응형 디자인
   ========================================================================== */
@media (max-width: 768px) {
  /* Simple 타입 반응형 */
  .cois-footer--simple .footer-content {
    flex-direction: column;
    gap: 15px;
    text-align: center;
  }

  .cois-footer--simple .logo-image {
    height: 35px;
  }

  .cois-footer--simple .footer-description {
    font-size: 13px;
  }

  .cois-footer--simple .footer-copyright {
    font-size: 11px;
  }

  /* Full 타입 반응형 */
  .cois-footer--full .footer-info {
    flex-direction: column;
    gap: 20px;
    text-align: center;
  }

  .cois-footer--full .footer-logo {
    align-self: center;
  }

  .cois-footer--full .logo-image {
    height: 50px;
  }

  .cois-footer--full .footer-title {
    font-size: 20px;
  }

  .cois-footer--full .footer-description {
    font-size: 14px;
  }

  .cois-footer--full .footer-contact {
    justify-content: center;
    gap: 20px;
  }

  .cois-footer--full .contact-item {
    flex-direction: column;
    gap: 4px;
    text-align: center;
  }

  .cois-footer--full .contact-label {
    min-width: auto;
    font-size: 12px;
  }

  .cois-footer--full .contact-value {
    font-size: 14px;
  }

  .cois-footer--full .footer-thanks {
    font-size: 14px;
  }
}

@media (max-width: 480px) {
  /* Simple 타입 모바일 */
  .cois-footer--simple {
    padding: 15px 0;
  }

  .cois-footer--simple .footer-content {
    gap: 12px;
  }

  .cois-footer--simple .logo-image {
    height: 45px;  /* 30px -> 45px로 증가 */
  }

  /* Full 타입 모바일 */
  .cois-footer--full .footer-container {
    padding: 30px 15px 15px;
  }

  .cois-footer--full .logo-image {
    height: 55px;  /* 40px -> 55px로 증가 */
  }

  .cois-footer--full .footer-title {
    font-size: 18px;
  }

  .cois-footer--full .footer-description {
    font-size: 13px;
  }

  .cois-footer--full .footer-copyright {
    font-size: 12px;
  }

  .cois-footer--full .footer-thanks {
    font-size: 13px;
  }
}
</style>