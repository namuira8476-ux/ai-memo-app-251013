// components/notes/sort-select.tsx
// 노트 정렬 옵션 선택 컴포넌트
// 사용자가 노트 목록 정렬 순서를 선택할 수 있는 드롭다운
// 관련 파일: components/ui/select.tsx, app/notes/page.tsx

'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface SortSelectProps {
  currentSort: string
}

export function SortSelect({ currentSort }: SortSelectProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleSortChange = (value: string) => {
    const params = new URLSearchParams(searchParams)
    params.set('sort', value)
    params.set('page', '1') // 정렬 변경 시 첫 페이지로
    router.push(`/notes?${params.toString()}`)
  }

  const getSortLabel = (sort: string): string => {
    switch (sort) {
      case 'newest':
        return '최신순'
      case 'oldest':
        return '오래된순'
      case 'title-asc':
        return '제목순 (A-Z)'
      case 'title-desc':
        return '제목순 (Z-A)'
      case 'updated':
        return '수정순'
      default:
        return '최신순'
    }
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-600">정렬:</span>
      <Select value={currentSort} onValueChange={handleSortChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="정렬 순서">
            {getSortLabel(currentSort)}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="newest">최신순</SelectItem>
          <SelectItem value="oldest">오래된순</SelectItem>
          <SelectItem value="title-asc">제목순 (A-Z)</SelectItem>
          <SelectItem value="title-desc">제목순 (Z-A)</SelectItem>
          <SelectItem value="updated">수정순</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}




