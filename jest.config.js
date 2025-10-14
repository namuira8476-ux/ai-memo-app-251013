// jest.config.js
// Jest 테스트 설정
// React 컴포넌트와 Supabase Auth 테스트를 위한 Jest 설정입니다
// 관련 파일: __tests__/signup-form.test.tsx, __tests__/auth-integration.test.tsx

const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // Next.js 앱의 경로를 제공합니다
  dir: './',
})

// Jest에 전달할 사용자 정의 설정
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jsdom',
  testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/node_modules/'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  testEnvironmentOptions: {
    customExportConditions: [''],
  },
}

// createJestConfig는 async이므로 next/jest가 Next.js 설정을 로드할 수 있도록 합니다
module.exports = createJestConfig(customJestConfig)
