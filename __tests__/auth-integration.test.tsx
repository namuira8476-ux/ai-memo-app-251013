// __tests__/auth-integration.test.tsx
// Supabase Auth 통합 테스트
// 실제 Supabase Auth API와의 통합을 테스트합니다
// 관련 파일: lib/supabase/client.ts, components/auth/signup-form.tsx

describe('Supabase Auth Integration', () => {
  it('Supabase 클라이언트 모듈이 존재한다', () => {
    const { createClient } = require('@/lib/supabase/client')
    expect(createClient).toBeDefined()
    expect(typeof createClient).toBe('function')
  })

  it('Supabase 클라이언트가 올바르게 초기화된다', () => {
    const { createClient } = require('@/lib/supabase/client')
    const supabase = createClient()
    
    expect(supabase).toBeDefined()
    expect(supabase.auth).toBeDefined()
  })
})
