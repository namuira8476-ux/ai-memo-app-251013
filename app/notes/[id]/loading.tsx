// app/notes/[id]/loading.tsx
// 노트 상세 페이지 로딩 UI (스켈레톤)
// Suspense 경계로 자동으로 사용됨
// 관련 파일: app/notes/[id]/page.tsx, components/ui/skeleton.tsx

import { Skeleton } from '@/components/ui/skeleton'

export default function NoteDetailLoading() {
  return (
    <div className="container max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      {/* 헤더 영역 스켈레톤 */}
      <div className="mb-8">
        <Skeleton className="h-10 w-3/4 mb-4" />
        <Skeleton className="h-4 w-48" />
      </div>

      {/* 본문 영역 스켈레톤 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <Skeleton className="h-4 w-full mb-3" />
        <Skeleton className="h-4 w-full mb-3" />
        <Skeleton className="h-4 w-full mb-3" />
        <Skeleton className="h-4 w-3/4 mb-3" />
        <Skeleton className="h-4 w-5/6" />
      </div>

      {/* 액션 버튼 스켈레톤 */}
      <div className="flex flex-wrap gap-4">
        <Skeleton className="h-10 w-36" />
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-24" />
      </div>
    </div>
  )
}






