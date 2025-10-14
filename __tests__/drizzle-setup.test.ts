// __tests__/drizzle-setup.test.ts
// DrizzleORM 환경 설정 및 DB 연결 검증 테스트
// Story 2.0: DrizzleORM 환경 설정
// 관련 파일: lib/db.ts, drizzle/schema.ts

/**
 * 테스트 목적:
 * 1. DrizzleORM 클라이언트가 올바르게 초기화되는지 확인
 * 2. 스키마가 올바르게 정의되어 있는지 확인
 * 3. DATABASE_URL 환경변수 누락 시 에러 처리 확인
 */

describe('DrizzleORM 환경 설정', () => {
  // 원본 환경변수 백업
  const originalEnv = process.env.DATABASE_URL

  afterEach(() => {
    // 각 테스트 후 환경변수 복원
    if (originalEnv) {
      process.env.DATABASE_URL = originalEnv
    }
  })

  describe('스키마 정의 검증', () => {
    it('모든 테이블 스키마가 올바르게 export되어 있어야 함', () => {
      // 동적 import를 사용하여 스키마 로드
      const schema = require('@/drizzle/schema')

      // 필수 테이블들이 export되어 있는지 확인
      expect(schema.userProfiles).toBeDefined()
      expect(schema.notes).toBeDefined()
      expect(schema.noteTags).toBeDefined()
      expect(schema.summaries).toBeDefined()
    })

    it('테이블 relations가 올바르게 정의되어 있어야 함', () => {
      const schema = require('@/drizzle/schema')

      // Relations가 정의되어 있는지 확인
      expect(schema.userProfilesRelations).toBeDefined()
      expect(schema.notesRelations).toBeDefined()
      expect(schema.noteTagsRelations).toBeDefined()
      expect(schema.summariesRelations).toBeDefined()
    })
  })

  describe('환경변수 검증', () => {
    it('DATABASE_URL이 없으면 에러를 발생시켜야 함', () => {
      // DATABASE_URL 제거
      delete process.env.DATABASE_URL

      // 모듈 캐시 클리어
      jest.resetModules()

      // lib/db.ts를 require할 때 에러가 발생해야 함
      expect(() => {
        require('@/lib/db')
      }).toThrow('DATABASE_URL 환경변수가 설정되지 않았습니다')
    })

    it('DATABASE_URL이 있으면 db 클라이언트가 생성되어야 함', () => {
      // 유효한 DATABASE_URL 설정 (테스트용 더미 값)
      process.env.DATABASE_URL = 'postgresql://postgres:password@localhost:5432/test'

      // 모듈 캐시 클리어
      jest.resetModules()

      // db 클라이언트를 import해도 에러가 발생하지 않아야 함
      expect(() => {
        const { db } = require('@/lib/db')
        expect(db).toBeDefined()
      }).not.toThrow()
    })
  })

  describe('drizzle.config.ts 검증', () => {
    it('drizzle.config.ts가 올바른 설정을 가지고 있어야 함', () => {
      // drizzle.config.ts 파일이 존재하는지 확인
      expect(() => {
        require('@/drizzle.config')
      }).not.toThrow()
    })
  })
})

/**
 * 통합 테스트 참고사항:
 * 
 * 실제 DB 연결 테스트는 .env.local에 DATABASE_URL이 설정된 경우에만 실행 가능합니다.
 * 로컬 개발 환경에서 수동으로 실행하려면:
 * 
 * 1. .env.local 파일에 DATABASE_URL 추가
 * 2. pnpm drizzle-kit:push 실행하여 스키마 적용
 * 3. 수동으로 간단한 쿼리 테스트:
 * 
 * import { db } from '@/lib/db'
 * import { userProfiles } from '@/drizzle/schema'
 * 
 * // 예시: user_profiles 테이블 조회
 * const users = await db.select().from(userProfiles).limit(1)
 * console.log('DB 연결 성공:', users)
 */


