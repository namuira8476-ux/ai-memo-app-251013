// app/auth/signin/page.tsx
// 로그인 페이지
// 사용자가 이메일과 비밀번호로 로그인할 수 있는 페이지입니다
// 관련 파일: lib/supabase/server.ts, components/auth/signin-form.tsx

import { SignInForm } from '@/components/auth/signin-form'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function SignInPage({
  searchParams,
}: {
  searchParams: { message?: string }
}) {
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
            AI 메모장 로그인
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            이메일과 비밀번호로 로그인하세요
          </p>
        </div>
        
        <div className="bg-white py-8 px-6 shadow rounded-lg">
          {searchParams.message === 'password-updated' && (
            <div className="mb-4 text-sm text-green-600 bg-green-50 p-3 rounded-md">
              비밀번호가 성공적으로 업데이트되었습니다. 새 비밀번호로 로그인해주세요.
            </div>
          )}
          
          <SignInForm />
          
          <div className="mt-6 text-center space-y-2">
            <p className="text-sm text-gray-600">
              비밀번호를 잊으셨나요?{' '}
              <a href="/auth/reset-password" className="font-medium text-blue-600 hover:text-blue-500">
                비밀번호 재설정
              </a>
            </p>
            <p className="text-sm text-gray-600">
              계정이 없으신가요?{' '}
              <a href="/auth/signup" className="font-medium text-blue-600 hover:text-blue-500">
                회원가입하기
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
