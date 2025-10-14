// app/auth/update-password/page.tsx
// 새 비밀번호 설정 페이지
// 비밀번호 재설정 이메일의 링크를 통해 접근하여 새 비밀번호를 설정하는 페이지입니다
// 관련 파일: components/auth/password-update-form.tsx, lib/supabase/server.ts

import { PasswordUpdateForm } from '@/components/auth/password-update-form'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function UpdatePasswordPage() {
  const supabase = await createClient()
  
  // 현재 사용자 정보 확인 (비밀번호 재설정 토큰이 유효한지 확인)
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/auth/reset-password?error=no-user')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            새 비밀번호 설정
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            새로운 비밀번호를 입력해주세요
          </p>
        </div>
        
        <div className="bg-white py-8 px-6 shadow rounded-lg">
          <PasswordUpdateForm />
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              비밀번호를 기억하셨나요?{' '}
              <a href="/auth/signin" className="font-medium text-blue-600 hover:text-blue-500">
                로그인하기
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

