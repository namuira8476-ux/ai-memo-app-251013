// components/notes/note-card-skeleton.tsx
// 노트 목록 로딩 중 표시하는 스켈레톤 UI 컴포넌트
// NoteCard와 동일한 레이아웃으로 로딩 상태를 시각화
// 관련 파일: app/notes/page.tsx, components/notes/note-card.tsx

import { Skeleton } from '@/components/ui/skeleton'

export function NoteCardSkeleton() {
  return (
    <div className="border rounded-lg p-4 bg-white">
      <Skeleton className="h-6 w-3/4 mb-2" />
      <Skeleton className="h-4 w-full mb-1" />
      <Skeleton className="h-4 w-full mb-1" />
      <Skeleton className="h-4 w-2/3 mb-3" />
      <Skeleton className="h-3 w-32" />
    </div>
  )
}

export function NoteListSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[...Array(6)].map((_, i) => (
        <NoteCardSkeleton key={i} />
      ))}
    </div>
  )
}

