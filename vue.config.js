const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  transpileDependencies: true,
  // GitHub Pages 배포를 위한 설정 추가
  publicPath: process.env.NODE_ENV === 'production'
    ? '/tos/'  // 여기에 GitHub 저장소 이름을 입력해주세요
    : '/'
})