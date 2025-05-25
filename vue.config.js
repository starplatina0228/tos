const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  transpileDependencies: true,
  // GitHub Pages 배포를 위한 설정 추가
  publicPath: process.env.NODE_ENV === 'production'
    ? '/tos/'
    : '/'
})