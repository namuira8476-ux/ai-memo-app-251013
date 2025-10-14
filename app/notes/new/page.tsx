// app/notes/new/page.tsx
// 노트 생성 페이지
// 로그인한 사용자만 접근 가능하며 NoteForm 컴포넌트를 렌더링
// 관련 파일: components/notes/note-form.tsx, lib/supabase/server.ts

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { NoteForm } from '@/components/notes/note-form'

export default async function NewNotePage() {
  // 사용자 인증 확인
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // 로그인하지 않은 경우 로그인 페이지로 리다이렉트
  if (!user) {
    redirect('/auth/signin')
  }

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">새 노트 작성</h1>
        <p className="mt-2 text-sm text-gray-600">
          제목과 내용을 입력하여 새로운 노트를 만드세요
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <NoteForm mode="create" />
      </div>
    </div>
  )
}

