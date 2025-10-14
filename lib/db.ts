// lib/db.ts
// Drizzle ORM 데이터베이스 클라이언트 설정
// Supabase Postgres와 연결하여 타입 안전한 쿼리 제공
// 관련 파일: drizzle/schema.ts, lib/supabase/server.ts

import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from '@/drizzle/schema'

// Supabase 데이터베이스 연결 URL
// 환경 변수에서 읽어오며, 서버 사이드에서만 사용
const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error(
    'DATABASE_URL 환경변수가 설정되지 않았습니다. ' +
    '.env.local 파일에 DATABASE_URL을 추가해주세요. ' +
    '형식: postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres'
  )
}

// Postgres 클라이언트 생성
// max: 최대 연결 수 제한 (Vercel serverless 환경 고려)
const client = postgres(connectionString, {
  max: 1,
  idle_timeout: 20,
  max_lifetime: 60 * 30,
})

// Drizzle 클라이언트 생성 및 export
export const db = drizzle(client, { schema })


