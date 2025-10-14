// components/notes/empty-state.tsx
// 노트가 없을 때 표시하는 빈 상태 UI 컴포넌트
// 사용자에게 첫 노트 작성을 안내
// 관련 파일: app/notes/page.tsx

import Link from 'next/link'
import { Button } from '@/components/ui/button'

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4">
      <div className="text-center max-w-md">
        <div className="mb-6">
          <svg
            className="mx-auto h-16 w-16 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          아직 작성된 노트가 없습니다
        </h3>
        <p className="text-gray-600 mb-6">
          첫 노트를 작성하고 아이디어를 기록해보세요!
        </p>
        <Link href="/notes/new">
          <Button size="lg">
            새 노트 작성
          </Button>
        </Link>
      </div>
    </div>
  )
}

