// app/notes/[id]/not-found.tsx
// 노트를 찾을 수 없을 때 표시하는 404 페이지
// notFound() 함수 호출 시 자동으로 렌더링됨
// 관련 파일: app/notes/[id]/page.tsx

import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NoteNotFound() {
  return (
    <div className="container max-w-4xl mx-auto px-4 py-20 text-center">
      <div className="max-w-md mx-auto">
        {/* 404 아이콘 */}
        <div className="mb-6">
          <svg
            className="mx-auto h-24 w-24 text-gray-400"
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
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          노트를 찾을 수 없습니다
        </h1>
        <p className="text-gray-600 mb-8">
          요청하신 노트가 존재하지 않거나 삭제되었습니다.
        </p>
        <Link href="/notes">
          <Button size="lg">
            목록으로 돌아가기
          </Button>
        </Link>
      </div>
    </div>
  )
}





