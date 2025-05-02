<template>
    <div class="optimization-container">
      <div class="cube-container" ref="cubeContainer"></div>

      <div class="status-message" :class="{ 'completed': optimizationCompleted }">
        {{ statusMessage }}
      </div>

      <div class="timetable-container">
        <div class="timetable">
          <div class="timetable-row header-row">
            <div class="timetable-cell header-cell"></div>
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
              class="timetable-cell"
              :style="{
                backgroundColor: cell.color,
                opacity: cell.opacity
              }"
            ></div>
          </div>
        </div>
      </div>

      <div class="button-container" v-if="optimizationCompleted">
        <button class="action-button" @click="onContinue">
          시간표 확인하기
        </button>
      </div>
    </div>
  </template>

  <script>
  import * as THREE from 'three';
  import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

  export default {
    name: 'OptimizationComponent',
    data() {
      return {
        scene: null,
        camera: null,
        renderer: null,
        cube: null,
        cubeGroup: null,
        controls: null,
        raycaster: null,
        optimizationStep: 0,
        maxOptimizationSteps: 50,
        optimizationInterval: null,
        optimizationCompleted: false,
        statusMessage: "시간표 최적화 진행 중...",
        timetableCells: [],
        timeSlots: 7,
        daysOfWeek: 5,
        solvedFaces: 0,
        colors: ['#f44336', '#4CAF50', '#2196F3', '#FFEB3B', '#FF9800', '#9C27B0'],
        optimizationMessages: [
          "사용자 선호도 분석 중...",
          "과목 간 시간 배치 최적화 중...",
          "시간대별 집중력 패턴 고려 중...",
          "균형 잡힌 시간표 계산 중...",
          "최종 시간표 생성 중..."
        ]
      }
    },
    mounted() {
      this.initTimetable();
      this.initThree();
      this.startOptimization();
    },
    beforeUnmount() {
      this.stopOptimization();
      window.removeEventListener('resize', this.onWindowResize);
      this.renderer.dispose();
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
      initThree() {
        // Three.js 초기화
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0xf8f9fa);

        // 카메라 설정
        this.camera = new THREE.PerspectiveCamera(
          75,
          this.$refs.cubeContainer.clientWidth / this.$refs.cubeContainer.clientHeight,
          0.1,
          1000
        );
        this.camera.position.z = 5;

        // 렌더러 설정
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(
          this.$refs.cubeContainer.clientWidth,
          this.$refs.cubeContainer.clientHeight
        );
        this.$refs.cubeContainer.appendChild(this.renderer.domElement);

        // 큐브 생성
        this.createRubiksCube();

        // 조명 추가
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(5, 5, 5);
        this.scene.add(directionalLight);

        // 컨트롤 추가
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.autoRotate = true;
        this.controls.autoRotateSpeed = 1;

        // 창 크기 변경 이벤트
        window.addEventListener('resize', this.onWindowResize);

        // 애니메이션 시작
        this.animate();
      },
      createRubiksCube() {
        // 루빅스 큐브 그룹 생성
        this.cubeGroup = new THREE.Group();

        // 큐브 크기
        const size = 1;
        const gap = 0.1;
        const cubeSize = size - gap;

        // 큐브 배열 (3x3x3)
        for (let x = 0; x < 3; x++) {
          for (let y = 0; y < 3; y++) {
            for (let z = 0; z < 3; z++) {
              // 중앙 큐브는 생략 (보이지 않으므로)
              if (x === 1 && y === 1 && z === 1) continue;

              const geometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
              const materials = [];

              // 큐브 면 색상 설정 (외부 면만 색상 지정)
              const faceColors = [
                x === 0 ? this.colors[0] : 0x111111, // 왼쪽 면 (빨강)
                x === 2 ? this.colors[1] : 0x111111, // 오른쪽 면 (초록)
                y === 0 ? this.colors[2] : 0x111111, // 아래 면 (파랑)
                y === 2 ? this.colors[3] : 0x111111, // 위 면 (노랑)
                z === 0 ? this.colors[4] : 0x111111, // 뒷면 (주황)
                z === 2 ? this.colors[5] : 0x111111  // 앞면 (보라)
              ];

              // 각 면에 대한 재질 생성
              for (let i = 0; i < 6; i++) {
                // 초기에는 모든 면을 회색으로 설정 (최적화 과정에서 색상이 변경됨)
                const color = 0x555555; // 최적화 전 회색
                materials.push(new THREE.MeshStandardMaterial({
                  color: color,
                  roughness: 0.2,
                  metalness: 0.1
                }));
              }

              const cubeMesh = new THREE.Mesh(geometry, materials);
              cubeMesh.position.set(
                (x - 1) * size,
                (y - 1) * size,
                (z - 1) * size
              );

              // 큐브 정보 저장
              cubeMesh.userData = {
                originalColors: faceColors,
                position: {x, y, z}
              };

              this.cubeGroup.add(cubeMesh);
            }
          }
        }

        this.scene.add(this.cubeGroup);
      },
      animate() {
        requestAnimationFrame(this.animate);

        // 컨트롤 업데이트
        this.controls.update();

        // 렌더링
        this.renderer.render(this.scene, this.camera);
      },
      onWindowResize() {
        // 창 크기 변경 시 카메라와 렌더러 업데이트
        this.camera.aspect = this.$refs.cubeContainer.clientWidth / this.$refs.cubeContainer.clientHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(
          this.$refs.cubeContainer.clientWidth,
          this.$refs.cubeContainer.clientHeight
        );
      },
      startOptimization() {
        // 최적화 시작
        this.optimizationInterval = setInterval(() => {
          this.optimizationStep++;

          // 루빅스 큐브 업데이트
          this.updateRubiksCube();

          // 시간표 업데이트
          this.updateTimetable();

          // 최적화 메시지 업데이트
          if (this.optimizationStep % 10 === 0) {
            const messageIndex = Math.floor(this.optimizationStep / 10) % this.optimizationMessages.length;
            this.statusMessage = this.optimizationMessages[messageIndex];
          }

          // 최적화 완료
          if (this.optimizationStep >= this.maxOptimizationSteps) {
            this.completeOptimization();
          }
        }, 200); // 200ms마다 업데이트
      },
      updateRubiksCube() {
        // 최적화 단계에 따라 루빅스 큐브의 색상 업데이트
        const progress = this.optimizationStep / this.maxOptimizationSteps;

        // 큐브 면 색상 업데이트
        this.cubeGroup.children.forEach((cubeMesh, index) => {
          const targetColors = cubeMesh.userData.originalColors;

          // 특정 단계마다 면을 해결
          const facesToSolve = Math.floor(progress * 6);

          // 각 면에 대한 색상 업데이트
          for (let i = 0; i < 6; i++) {
            // 해결된 면은 원래 색상으로, 아직 해결되지 않은 면은 회색으로
            if (i < facesToSolve) {
              cubeMesh.material[i].color.set(targetColors[i]);
            } else {
              // 랜덤하게 일부 면만 업데이트하여 점진적인 변화 효과
              if (Math.random() > 0.7) {
                const randomColor = this.colors[Math.floor(Math.random() * this.colors.length)];
                cubeMesh.material[i].color.set(randomColor);
              }
            }
          }

          // 큐브 회전
          if (index % 3 === 0 && Math.random() > 0.8) {
            const randomAxis = ['x', 'y', 'z'][Math.floor(Math.random() * 3)];
            const randomAngle = Math.PI / 2 * (Math.random() > 0.5 ? 1 : -1);

            // 큐브 그룹 회전
            if (randomAxis === 'x') {
              this.cubeGroup.rotation.x += randomAngle / 10;
            } else if (randomAxis === 'y') {
              this.cubeGroup.rotation.y += randomAngle / 10;
            } else {
              this.cubeGroup.rotation.z += randomAngle / 10;
            }
          }
        });

        // 최적화 마지막 단계에서는 완전히 정렬된 큐브 표시
        if (this.optimizationStep >= this.maxOptimizationSteps - 5) {
          this.cubeGroup.children.forEach((cubeMesh) => {
            const targetColors = cubeMesh.userData.originalColors;
            for (let i = 0; i < 6; i++) {
              cubeMesh.material[i].color.set(targetColors[i]);
            }
          });

          // 큐브 정돈
          this.cubeGroup.rotation.set(0, 0, 0);
        }
      },
      updateTimetable() {
        // 최적화 단계에 따라 시간표 업데이트
        const progress = this.optimizationStep / this.maxOptimizationSteps;

        // 시간표 셀 업데이트
        for (let row = 0; row < this.timeSlots; row++) {
          for (let col = 0; col < this.daysOfWeek; col++) {
            // 최적화 진행 중에는 랜덤하게 색상 변경
            if (this.optimizationStep < this.maxOptimizationSteps - 5) {
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
            } else {
              // 최적화 마지막 단계에서는 최종 시간표 표시
              // 이미지에 있는 패턴과 유사하게 최종 시간표 설정
              if (row === 1 && col === 0) {
                this.timetableCells[row][col].color = '#e67e22';
                this.timetableCells[row][col].opacity = 1;
              } else if (row === 2 && col === 0) {
                this.timetableCells[row][col].color = '#e67e22';
                this.timetableCells[row][col].opacity = 1;
              } else if (row >= 2 && row <= 3 && col === 2) {
                this.timetableCells[row][col].color = '#f1c40f';
                this.timetableCells[row][col].opacity = 1;
              } else if (row >= 3 && row <= 5 && col === 1) {
                this.timetableCells[row][col].color = '#e74c3c';
                this.timetableCells[row][col].opacity = 1;
              } else if (row >= 5 && row <= 6 && col === 3) {
                this.timetableCells[row][col].color = '#2ecc71';
                this.timetableCells[row][col].opacity = 1;
              } else if (row >= 2 && row <= 3 && col === 4) {
                this.timetableCells[row][col].color = '#f39c12';
                this.timetableCells[row][col].opacity = 1;
              } else {
                this.timetableCells[row][col].color = 'white';
                this.timetableCells[row][col].opacity = 1;
              }
            }
          }
        }
      },
      completeOptimization() {
        // 최적화 완료
        clearInterval(this.optimizationInterval);
        this.optimizationCompleted = true;
        this.statusMessage = "최적화 완료! 당신의 맞춤형 시간표가 준비되었습니다.";

        // 자동 회전 중지
        this.controls.autoRotate = false;

        // 큐브 회전 최종 위치 설정
        this.cubeGroup.rotation.set(0, Math.PI / 4, 0);
      },
      stopOptimization() {
        if (this.optimizationInterval) {
          clearInterval(this.optimizationInterval);
        }
      },
      onContinue() {
        this.$emit('optimization-completed');
      }
    }
  }
  </script>

  <style scoped>
  .optimization-container {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 20px;
    background-color: #f0f2f5;
    min-height: 100vh;
  }

  .cube-container {
    width: 100%;
    height: 300px;
    margin-bottom: 20px;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
  }

  .status-message {
    font-size: 1.2rem;
    font-weight: 500;
    margin-bottom: 20px;
    padding: 10px 20px;
    border-radius: 8px;
    background-color: #4361ee;
    color: white;
    text-align: center;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
  }

  .status-message.completed {
    background-color: #10b981;
    font-size: 1.4rem;
    padding: 12px 24px;
  }

  .timetable-container {
    width: 100%;
    max-width: 800px;
    margin-bottom: 30px;
    border-radius: 12px;
    overflow: hidden;
    background-color: white;
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
  }

  .timetable {
    width: 100%;
    border-collapse: collapse;
  }

  .timetable-row {
    display: flex;
    border-bottom: 1px solid #e5e7eb;
  }

  .timetable-row:last-child {
    border-bottom: none;
  }

  .timetable-cell {
    flex: 1;
    padding: 15px;
    border-right: 1px solid #e5e7eb;
    min-height: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background-color 0.3s, opacity 0.3s;
  }

  .timetable-cell:last-child {
    border-right: none;
  }

  .header-row {
    background-color: #f8fafc;
    font-weight: 600;
  }

  .header-cell {
    text-align: center;
  }

  .time-cell {
    flex: 0 0 80px;
    background-color: #f8fafc;
    font-weight: 500;
    color: #4b5563;
  }

  .button-container {
    margin-top: 20px;
  }

  .action-button {
    background-color: #10b981;
    color: white;
    border: none;
    border-radius: 8px;
    padding: 12px 24px;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 8px rgba(16, 185, 129, 0.2);
  }

  .action-button:hover {
    background-color: #059669;
    transform: translateY(-2px);
    box-shadow: 0 6px 12px rgba(16, 185, 129, 0.3);
  }

  @media (max-width: 768px) {
    .time-cell {
      flex: 0 0 60px;
    }

    .timetable-cell {
      padding: 10px;
      min-height: 40px;
    }

    .status-message {
      font-size: 1rem;
    }
  }
  </style>