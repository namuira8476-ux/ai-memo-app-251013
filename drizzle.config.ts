// drizzle.config.ts
// Drizzle Kit 설정 파일
// 데이터베이스 마이그레이션과 스키마 관리를 위한 설정
// 관련 파일: drizzle/schema.ts, .env.local

import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: './drizzle/schema.ts',
  out: './drizzle/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
})


