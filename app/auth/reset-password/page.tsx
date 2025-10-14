// app/auth/reset-password/page.tsx
// 비밀번호 재설정 요청 페이지
// 사용자가 이메일을 입력하여 비밀번호 재설정 이메일을 요청하는 페이지입니다
// 관련 파일: components/auth/password-reset-request-form.tsx, lib/supabase/server.ts

import { PasswordResetRequestForm } from '@/components/auth/password-reset-request-form'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const supabase = await createClient()
  const params = await searchParams
  
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
          {params.error && (
            <div className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded-md">
              {params.error === 'invalid-token' && '비밀번호 재설정 링크가 유효하지 않거나 만료되었습니다. 다시 요청해주세요.'}
              {params.error === 'no-user' && '사용자 정보를 찾을 수 없습니다. 다시 요청해주세요.'}
              {params.error.includes('expired') && '비밀번호 재설정 링크가 만료되었습니다. 다시 요청해주세요.'}
              {params.error.includes('invalid') && !params.error.includes('expired') && '비밀번호 재설정 링크가 유효하지 않습니다. 다시 요청해주세요.'}
              {!params.error.includes('expired') && !params.error.includes('invalid') && params.error !== 'invalid-token' && params.error !== 'no-user' && 
                '비밀번호 재설정 중 오류가 발생했습니다. 다시 시도해주세요.'}
            </div>
          )}
          
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

