// app/notes/page.tsx
// 노트 목록 페이지
// 로그인한 사용자의 노트 목록을 페이지네이션과 함께 표시
// 관련 파일: lib/actions/notes.ts, components/notes/note-card.tsx

import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { getNotes } from '@/lib/actions/notes'
import { NoteCard } from '@/components/notes/note-card'
import { Pagination } from '@/components/notes/pagination'
import { EmptyState } from '@/components/notes/empty-state'
import { NoteListSkeleton } from '@/components/notes/note-card-skeleton'

interface NotesPageProps {
  searchParams: Promise<{ page?: string }>
}

async function NotesList({ page }: { page: number }) {
  const result = await getNotes(page)

  if (!result.success) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
        <p className="text-red-800">{result.error}</p>
      </div>
    )
  }

  if (result.notes.length === 0) {
    return <EmptyState />
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {result.notes.map((note) => (
          <NoteCard
            key={note.id}
            id={note.id}
            title={note.title}
            content={note.content}
            createdAt={note.createdAt}
          />
        ))}
      </div>

      {result.totalPages > 1 && (
        <Pagination
          currentPage={result.currentPage}
          totalPages={result.totalPages}
          baseUrl="/notes"
        />
      )}
    </>
  )
}

export default async function NotesPage({ searchParams }: NotesPageProps) {
  // 사용자 인증 확인
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // 로그인하지 않은 경우 로그인 페이지로 리다이렉트
  if (!user) {
    redirect('/auth/signin')
  }

  // URL에서 페이지 번호 추출
  const params = await searchParams
  const page = parseInt(params.page || '1', 10)

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

      <Suspense fallback={<NoteListSkeleton />}>
        <NotesList page={page} />
      </Suspense>
    </div>
  )
}

