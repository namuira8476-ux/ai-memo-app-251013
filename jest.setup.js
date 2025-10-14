// jest.setup.js
// Jest 테스트 설정 파일
// 테스트 환경에서 사용할 전역 설정을 정의합니다
// 관련 파일: jest.config.js, __tests__/signup-form.test.tsx

import '@testing-library/jest-dom'
import { TextEncoder, TextDecoder } from 'util'

// Polyfill for TextEncoder/TextDecoder
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder

// 테스트 환경 변수 설정
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://bfiigzhcyahgevvmtewr.supabase.co'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJmaWlnemhjeWFoZ2V2dm10ZXdyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAzMzM0OTcsImV4cCI6MjA3NTkwOTQ5N30._qJ-UjyVTTYeE8CgRwgjVASOmQ1YE-DYOgV2Cq-lSCo'
