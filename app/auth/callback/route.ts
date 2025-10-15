// app/auth/callback/route.ts
// Supabase Auth 콜백 핸들러
// 이메일 링크의 토큰을 처리하고 적절한 페이지로 리다이렉트합니다
// 관련 파일: lib/supabase/server.ts, app/auth/update-password/page.tsx

import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') || '/auth/update-password'
  const error = requestUrl.searchParams.get('error')
  const error_description = requestUrl.searchParams.get('error_description')

  // 에러가 있는 경우
  if (error) {
    return NextResponse.redirect(
      new URL(`/auth/reset-password?error=${error_description || error}`, requestUrl.origin)
    )
  }

  // code가 있는 경우 세션 교환
  if (code) {
    const supabase = await createClient()
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

    if (exchangeError) {
      console.error('코드 교환 오류:', exchangeError)
      return NextResponse.redirect(
        new URL('/auth/reset-password?error=invalid-token', requestUrl.origin)
      )
    }

    // 성공 시 다음 페이지로 리다이렉트
    return NextResponse.redirect(new URL(next, requestUrl.origin))
  }

  // code가 없는 경우
  return NextResponse.redirect(
    new URL('/auth/reset-password?error=no-code', requestUrl.origin)
  )
}








