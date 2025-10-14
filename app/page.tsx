// app/page.tsx
// AI 메모장 홈페이지
// 인증 상태에 따라 다른 UI를 보여주는 메인 페이지입니다
// 관련 파일: lib/supabase/server.ts, app/auth/signup/page.tsx

import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">AI 메모장</h1>
            </div>
            <div className="flex items-center space-x-4">
              {user ? (
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-700">
                    안녕하세요, {user.email}님!
                  </span>
                  <form action="/auth/signout" method="post">
                    <Button type="submit" variant="outline">
                      로그아웃
                    </Button>
                  </form>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link href="/auth/signin">
                    <Button variant="outline">로그인</Button>
                  </Link>
                  <Link href="/auth/signup">
                    <Button>회원가입</Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            AI 메모장에 오신 것을 환영합니다
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            음성과 텍스트로 메모를 작성하고, AI가 자동으로 요약과 태깅을 제공합니다.
          </p>
          
          {!user && (
            <div className="mt-8">
              <div className="inline-flex rounded-md shadow">
                <Link href="/auth/signup">
                  <Button size="lg" className="px-8 py-3">
                    지금 시작하기
                  </Button>
                </Link>
              </div>
            </div>
          )}
          
          {user && (
            <div className="mt-8">
              <div className="bg-white rounded-lg shadow p-6 max-w-md mx-auto">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  메모 작성하기
                </h3>
                <p className="text-gray-600 mb-4">
                  아직 메모 기능이 구현되지 않았습니다. 곧 만나보실 수 있습니다!
                </p>
                <Button disabled>
                  메모 작성 (준비 중)
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
