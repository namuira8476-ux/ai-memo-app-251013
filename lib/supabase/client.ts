// lib/supabase/client.ts
// 클라이언트 사이드 Supabase 클라이언트 설정
// 브라우저에서 사용할 Supabase 클라이언트를 초기화하고 내보냅니다
// 관련 파일: lib/supabase/server.ts, app/auth/signup/page.tsx, components/auth/signup-form.tsx

import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
