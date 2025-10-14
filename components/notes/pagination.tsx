// components/notes/pagination.tsx
// 노트 목록 페이지네이션 UI 컴포넌트
// 이전/다음 버튼과 현재 페이지 정보를 표시
// 관련 파일: app/notes/page.tsx, lib/actions/notes.ts

'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface PaginationProps {
  currentPage: number
  totalPages: number
  baseUrl: string
}

export function Pagination({ currentPage, totalPages, baseUrl }: PaginationProps) {
  const hasPrevious = currentPage > 1
  const hasNext = currentPage < totalPages

  return (
    <div className="flex items-center justify-center gap-4 mt-8">
      {hasPrevious ? (
        <Link href={`${baseUrl}?page=${currentPage - 1}`}>
          <Button variant="outline" size="sm">
            이전
          </Button>
        </Link>
      ) : (
        <Button variant="outline" size="sm" disabled>
          이전
        </Button>
      )}
      
      <span className="text-sm text-gray-600 min-w-[60px] text-center">
        {currentPage} / {totalPages}
      </span>
      
      {hasNext ? (
        <Link href={`${baseUrl}?page=${currentPage + 1}`}>
          <Button variant="outline" size="sm">
            다음
          </Button>
        </Link>
      ) : (
        <Button variant="outline" size="sm" disabled>
          다음
        </Button>
      )}
    </div>
  )
}

