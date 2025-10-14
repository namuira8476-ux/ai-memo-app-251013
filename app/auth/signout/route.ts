// app/auth/signout/route.ts
// 로그아웃 서버 액션
// 사용자를 Supabase에서 로그아웃시키고 홈페이지로 리다이렉트합니다
// 관련 파일: lib/supabase/server.ts, app/page.tsx

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function POST() {
  const supabase = await createClient()
  
  await supabase.auth.signOut()
  
  redirect('/')
}
