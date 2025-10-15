// app/notes/[id]/page.tsx
// 노트 상세 조회 페이지
// 특정 ID의 노트 전체 내용을 표시
// 관련 파일: lib/actions/notes.ts, app/notes/[id]/loading.tsx, app/notes/[id]/not-found.tsx

import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getNoteById } from '@/lib/actions/notes'
import { Button } from '@/components/ui/button'
import { DeleteNoteDialog } from '@/components/notes/delete-note-dialog'
import { NoteDetailClient } from './note-detail-client'

interface NoteDetailPageProps {
  params: Promise<{ id: string }>
}


export default async function NoteDetailPage({ params }: NoteDetailPageProps) {
  // 1. 사용자 인증 확인
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/signin')
  }

  // 2. URL params에서 노트 ID 추출
  const { id } = await params

  // 3. 노트 조회
  const result = await getNoteById(id)

  if (!result.success || !result.note) {
    notFound()
  }

  const note = result.note

  // 4. 작성 날짜와 수정 날짜 비교
  const isModified = new Date(note.updatedAt).getTime() !== new Date(note.createdAt).getTime()

  return (
    <NoteDetailClient 
      note={note} 
      isModified={isModified}
    />
  )
}

