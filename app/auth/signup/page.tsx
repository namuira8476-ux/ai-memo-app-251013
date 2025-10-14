// app/auth/signup/page.tsx
// 회원가입 페이지
// 사용자가 이메일과 비밀번호로 회원가입할 수 있는 페이지입니다
// 관련 파일: components/auth/signup-form.tsx, lib/supabase/server.ts

import { SignUpForm } from '@/components/auth/signup-form'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function SignUpPage() {
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
            AI 메모장 회원가입
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            이메일과 비밀번호로 계정을 만들어보세요
          </p>
        </div>
        
        <div className="bg-white py-8 px-6 shadow rounded-lg">
          <SignUpForm />
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              이미 계정이 있으신가요?{' '}
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
