// app/notes/[id]/note-detail-client.tsx
// 노트 상세 페이지 클라이언트 컴포넌트
// AI 요약 생성 기능을 포함한 인터랙티브 UI
// 관련 파일: app/notes/[id]/page.tsx, components/notes/note-summary-section.tsx

'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { DeleteNoteDialog } from '@/components/notes/delete-note-dialog'
import { NoteSummarySection } from '@/components/notes/note-summary-section'
import { MarkdownEditor } from '@/components/notes/markdown-editor'
import { updateNoteContent, generateNoteSummary } from '@/lib/actions/notes'

interface NoteDetailClientProps {
  note: {
    id: string
    title: string
    content: string
    summary?: string
    createdAt: Date | string
    updatedAt: Date | string
  }
  isModified: boolean
}

export function NoteDetailClient({ note, isModified }: NoteDetailClientProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [currentSummary, setCurrentSummary] = useState(note.summary)
  const [isUpdating, setIsUpdating] = useState(false)
  const [currentContent, setCurrentContent] = useState(note.content)

  // 날짜 포맷팅 함수 (클라이언트 컴포넌트 내부에서 정의)
  const formatDate = (date: Date | string): string => {
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date))
  }

  const handleContentUpdate = async (content: string) => {
    setIsUpdating(true)
    try {
      const result = await updateNoteContent(note.id, content)
      
      if (result.success) {
        setCurrentContent(content)
        // 페이지 새로고침으로 최신 데이터 반영
        window.location.reload()
      } else {
        console.error('내용 업데이트 실패:', result.error)
        alert(result.error || '내용 업데이트에 실패했습니다.')
      }
    } catch (error) {
      console.error('내용 업데이트 중 오류:', error)
      alert('내용 업데이트 중 오류가 발생했습니다.')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleGenerate = async () => {
    setIsGenerating(true)
    try {
      const result = await generateNoteSummary(note.id)
      
      if (result.success) {
        setCurrentSummary(result.summary)
      } else {
        console.error('AI 생성 실패:', result.error)
      }
    } catch (error) {
      console.error('AI 생성 중 오류:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      {/* 헤더 영역 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4 break-words">
          {note.title}
        </h1>
        <div className="flex flex-wrap gap-4 text-sm text-gray-500">
          <span>작성: {formatDate(note.createdAt)}</span>
          {isModified && (
            <span>수정: {formatDate(note.updatedAt)}</span>
          )}
        </div>
      </div>

      {/* 마크다운 편집기 */}
      <MarkdownEditor
        initialContent={currentContent}
        onSave={handleContentUpdate}
        onCancel={() => {}}
        isLoading={isUpdating}
      />

      {/* AI 요약 섹션 */}
      <NoteSummarySection
        summary={currentSummary}
        onGenerate={handleGenerate}
        isLoading={isGenerating}
      />

      {/* 액션 버튼 */}
      <div className="flex flex-wrap gap-4">
        <Link href="/notes">
          <Button variant="outline">
            목록으로 돌아가기
          </Button>
        </Link>
        <Link href={`/notes/${note.id}/edit`}>
          <Button variant="default">
            수정하기
          </Button>
        </Link>
        <DeleteNoteDialog noteId={note.id} noteTitle={note.title} />
      </div>
    </div>
  )
}

