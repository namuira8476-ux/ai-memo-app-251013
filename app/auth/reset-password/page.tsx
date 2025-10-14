// app/auth/reset-password/page.tsx
// 비밀번호 재설정 요청 페이지
// 사용자가 이메일을 입력하여 비밀번호 재설정 이메일을 요청하는 페이지입니다
// 관련 파일: components/auth/password-reset-request-form.tsx, lib/supabase/server.ts

import { PasswordResetRequestForm } from '@/components/auth/password-reset-request-form'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function ResetPasswordPage() {
  const supabase = await createClient()
  
  // 이미 로그인된 사용자는 홈으로 리다이렉트
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    redirect('/')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            비밀번호 재설정
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            가입하신 이메일을 입력하시면 비밀번호 재설정 링크를 발송해드립니다
          </p>
        </div>
        
        <div className="bg-white py-8 px-6 shadow rounded-lg">
          <PasswordResetRequestForm />
          
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

