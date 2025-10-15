// app/notes/[id]/edit/page.tsx
// 노트 수정 페이지
// 기존 노트를 불러와서 수정 폼을 표시
// 관련 파일: lib/actions/notes.ts, components/notes/note-edit-form.tsx

import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getNoteById } from '@/lib/actions/notes'
import { NoteEditForm } from '@/components/notes/note-edit-form'

interface NoteEditPageProps {
  params: Promise<{ id: string }>
}

export default async function NoteEditPage({ params }: NoteEditPageProps) {
  // 1. 사용자 인증 확인
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/auth/signin')
  }

  // 2. 노트 ID 추출
  const { id } = await params
  
  // 3. 노트 조회
  const result = await getNoteById(id)
  
  if (!result.success || !result.note) {
    notFound()
  }

  return (
    <div className="container max-w-2xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">노트 수정</h1>
        <p className="mt-2 text-sm text-gray-600">
          노트의 제목과 내용을 수정하세요
        </p>
      </div>

      <NoteEditForm noteId={id} initialData={result.note} />
    </div>
  )
}







