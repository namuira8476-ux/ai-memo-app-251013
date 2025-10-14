// components/notes/note-card.tsx
// 개별 노트를 카드 형태로 표시하는 컴포넌트
// 노트 제목, 본문 미리보기, 작성 날짜를 표시하고 클릭 시 상세 페이지로 이동
// 관련 파일: app/notes/page.tsx, app/notes/[id]/page.tsx

'use client'

import Link from 'next/link'

interface NoteCardProps {
  id: string
  title: string
  content: string
  createdAt: Date | string
}

export function NoteCard({ id, title, content, createdAt }: NoteCardProps) {
  // 본문 150자 제한
  const preview = content.length > 150 
    ? content.substring(0, 150) + '...' 
    : content

  // 날짜 포맷팅
  const formattedDate = new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(createdAt))

  return (
    <Link href={`/notes/${id}`} className="block">
      <div className="border rounded-lg p-4 hover:shadow-md hover:border-gray-400 transition-all cursor-pointer bg-white">
        <h3 className="font-semibold text-lg mb-2 text-gray-900 line-clamp-2">
          {title}
        </h3>
        <p className="text-gray-600 text-sm mb-3 line-clamp-3">
          {preview}
        </p>
        <time className="text-xs text-gray-400">
          {formattedDate}
        </time>
      </div>
    </Link>
  )
}

