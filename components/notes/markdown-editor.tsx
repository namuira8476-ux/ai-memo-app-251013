// components/notes/markdown-editor.tsx
// 마크다운 편집기 컴포넌트
// 노트 내용을 마크다운으로 편집할 수 있는 기능
// 관련 파일: app/notes/[id]/note-detail-client.tsx, lib/actions/notes.ts

'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { Button } from '@/components/ui/button'
import { Save, Edit3, X } from 'lucide-react'

// 동적 임포트로 SSR 문제 방지
const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { 
  ssr: false,
  loading: () => <div className="h-64 bg-gray-100 rounded animate-pulse"></div>
})

// MDViewer 제거 - 간단한 텍스트 표시로 대체

interface MarkdownEditorProps {
  initialContent: string
  onSave: (content: string) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
  defaultEditMode?: boolean // 새로 추가: 기본 편집 모드 여부
}

export function MarkdownEditor({ 
  initialContent, 
  onSave, 
  onCancel, 
  isLoading = false,
  defaultEditMode = false
}: MarkdownEditorProps) {
  const [content, setContent] = useState(initialContent)
  const [isEditing, setIsEditing] = useState(defaultEditMode)

  const handleSave = async () => {
    try {
      await onSave(content)
      // defaultEditMode가 true면 편집 모드 유지
      if (!defaultEditMode) {
        setIsEditing(false)
      }
    } catch (error) {
      console.error('저장 중 오류:', error)
    }
  }

  const handleCancel = () => {
    setContent(initialContent)
    setIsEditing(false)
    onCancel()
  }

  if (!isEditing) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <Edit3 className="h-5 w-5 text-blue-600" />
            노트 내용
          </h2>
          <Button
            onClick={() => setIsEditing(true)}
            variant="outline"
            size="sm"
          >
            <Edit3 className="mr-2 h-4 w-4" />
            마크다운으로 편집
          </Button>
        </div>
        
        <div className="prose prose-sm max-w-none">
          <div className="whitespace-pre-wrap text-gray-800">
            {initialContent}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
          <Edit3 className="h-5 w-5 text-blue-600" />
          마크다운 편집기
        </h2>
        <div className="flex gap-2">
          <Button
            onClick={handleSave}
            disabled={isLoading}
            size="sm"
          >
            {isLoading ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                저장 중...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                저장
              </>
            )}
          </Button>
          {!defaultEditMode && (
            <Button
              onClick={handleCancel}
              disabled={isLoading}
              variant="outline"
              size="sm"
            >
              <X className="mr-2 h-4 w-4" />
              취소
            </Button>
          )}
        </div>
      </div>
      
      <div className="min-h-[400px]">
        <MDEditor
          value={content}
          onChange={(val) => setContent(val || '')}
          data-color-mode="light"
          height={400}
          preview="live"
          visibleDragbar={false}
        />
      </div>
      
      <div className="mt-4 text-sm text-gray-500">
        💡 마크다운 문법을 사용하여 텍스트를 포맷팅할 수 있습니다. 
        <a 
          href="https://www.markdownguide.org/basic-syntax/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 ml-1"
        >
          마크다운 가이드 보기
        </a>
      </div>
    </div>
  )
}
