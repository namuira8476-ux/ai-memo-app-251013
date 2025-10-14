// app/notes/page.tsx
// 노트 목록 페이지
// 로그인한 사용자의 노트 목록을 표시 (이후 Story에서 구현 예정)
// 관련 파일: lib/supabase/server.ts, lib/db.ts, drizzle/schema.ts

import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'

export default async function NotesPage() {
  // 사용자 인증 확인
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // 로그인하지 않은 경우 로그인 페이지로 리다이렉트
  if (!user) {
    redirect('/auth/signin')
  }

  return (
    <div className="container max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">내 노트</h1>
          <p className="mt-2 text-sm text-gray-600">
            노트 목록을 관리하세요
          </p>
        </div>
        <Link href="/notes/new">
          <Button>
            새 노트 작성
          </Button>
        </Link>
      </div>

      {/* 임시 빈 상태 UI - 이후 Story에서 실제 목록 구현 예정 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
        <p className="text-gray-500 mb-4">아직 작성된 노트가 없습니다</p>
        <Link href="/notes/new">
          <Button variant="outline">
            첫 번째 노트 만들기
          </Button>
        </Link>
      </div>
    </div>
  )
}

