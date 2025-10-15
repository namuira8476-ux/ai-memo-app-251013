// components/notes/note-summary-section.tsx
// 노트 요약 섹션 컴포넌트
// AI 요약 생성 및 표시 기능
// 관련 파일: app/notes/[id]/note-detail-client.tsx, lib/actions/notes.ts

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2, Sparkles } from 'lucide-react'

interface NoteSummarySectionProps {
  noteId: string
  summary?: string
  onGenerate: () => void
  isLoading: boolean
}

export function NoteSummarySection({ 
  noteId, 
  summary, 
  onGenerate, 
  isLoading 
}: NoteSummarySectionProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-blue-600" />
          AI 요약
        </h2>
        <Button
          onClick={onGenerate}
          disabled={isLoading}
          variant="outline"
          size="sm"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              생성 중...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              요약 생성
            </>
          )}
        </Button>
      </div>

      {isLoading && (
        <div className="space-y-4">
          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
        </div>
      )}

      {summary && !isLoading && (
        <div className="prose prose-sm max-w-none">
          <p className="text-gray-700 leading-relaxed">{summary}</p>
        </div>
      )}

      {!summary && !isLoading && (
        <p className="text-gray-500 text-sm">
          AI 요약을 생성하려면 위의 버튼을 클릭하세요.
        </p>
      )}
    </div>
  )
}

