// lib/actions/onboarding.ts
// 온보딩 관련 서버 액션
// 온보딩 완료 상태를 Supabase Auth user_metadata에 저장
// 관련 파일: app/onboarding/page.tsx, components/signup-form.tsx

'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

/**
 * 온보딩 완료 처리
 * 사용자의 user_metadata에 onboarding_completed = true 저장
 */
export async function completeOnboarding() {
  const supabase = await createClient()
  
  // 현재 사용자 확인
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  
  if (userError || !user) {
    console.error('사용자 정보 조회 오류:', userError)
    return { success: false, error: '사용자 정보를 찾을 수 없습니다.' }
  }
  
  // user_metadata 업데이트
  const { error: updateError } = await supabase.auth.updateUser({
    data: { onboarding_completed: true }
  })
  
  if (updateError) {
    console.error('온보딩 완료 처리 오류:', updateError)
    return { success: false, error: '온보딩 완료 처리에 실패했습니다.' }
  }
  
  return { success: true }
}

/**
 * 온보딩 건너뛰기 처리
 * 온보딩 완료와 동일하게 처리 (user_metadata에 onboarding_completed = true 저장)
 */
export async function skipOnboarding() {
  return await completeOnboarding()
}

/**
 * 온보딩 완료 여부 확인
 */
export async function checkOnboardingStatus() {
  const supabase = await createClient()
  
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    return { completed: false }
  }
  
  const onboardingCompleted = user.user_metadata?.onboarding_completed === true
  
  return { completed: onboardingCompleted }
}






