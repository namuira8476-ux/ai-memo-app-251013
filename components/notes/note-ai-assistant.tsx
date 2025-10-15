// components/notes/note-ai-assistant.tsx
// 노트 작성 시 AI 도우미 컴포넌트
// 실시간으로 요약과 태그를 생성하여 작성 도움을 제공
// 관련 파일: lib/ai/index.ts, components/notes/note-form.tsx

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { generateSummary, generateTags } from '@/lib/ai'

interface NoteAIAssistantProps {
  content: string
  onSummaryGenerated: (summary: string) => void
  onTagsGenerated: (tags: string[]) => void
  disabled?: boolean
}

export function NoteAIAssistant({ 
  content, 
  onSummaryGenerated, 
  onTagsGenerated, 
  disabled = false 
}: NoteAIAssistantProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [generatedSummary, setGeneratedSummary] = useState('')
  const [generatedTags, setGeneratedTags] = useState<string[]>([])

  const handleGenerateSummary = async () => {
    if (!content.trim()) {
      setError('내용을 먼저 입력해주세요.')
      return
    }

    setIsGenerating(true)
    setError(null)

    try {
      console.log('요약 생성 시작:', content.substring(0, 50) + '...')
      const result = await generateSummary(content)
      console.log('요약 결과:', result)

      if (result.success) {
        const summary = result.summary?.content || ''
        setGeneratedSummary(summary)
        onSummaryGenerated(summary)
      } else {
        setError(result.error || '요약 생성에 실패했습니다.')
      }
    } catch (err) {
      console.error('요약 생성 중 오류:', err)
      setError('요약 생성 중 오류가 발생했습니다.')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleGenerateTags = async () => {
    if (!content.trim()) {
      setError('내용을 먼저 입력해주세요.')
      return
    }

    setIsGenerating(true)
    setError(null)

    try {
      console.log('태그 생성 시작:', content.substring(0, 50) + '...')
      const result = await generateTags(content)
      console.log('태그 결과:', result)

      if (result.success) {
        const tags = result.tags?.tags || []
        setGeneratedTags(tags)
        onTagsGenerated(tags)
      } else {
        setError(result.error || '태그 생성에 실패했습니다.')
      }
    } catch (err) {
      console.error('태그 생성 중 오류:', err)
      setError('태그 생성 중 오류가 발생했습니다.')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleGenerateBoth = async () => {
    if (!content.trim()) {
      setError('내용을 먼저 입력해주세요.')
      return
    }

    setIsGenerating(true)
    setError(null)

    try {
      console.log('요약 및 태그 생성 시작:', content.substring(0, 50) + '...')
      const [summaryResult, tagsResult] = await Promise.all([
        generateSummary(content),
        generateTags(content)
      ])

      console.log('요약 결과:', summaryResult)
      console.log('태그 결과:', tagsResult)

      if (summaryResult.success && tagsResult.success) {
        const summary = summaryResult.summary?.content || ''
        const tags = tagsResult.tags?.tags || []
        
        setGeneratedSummary(summary)
        setGeneratedTags(tags)
        onSummaryGenerated(summary)
        onTagsGenerated(tags)
      } else {
        const errors = []
        if (!summaryResult.success) errors.push(`요약: ${summaryResult.error}`)
        if (!tagsResult.success) errors.push(`태그: ${tagsResult.error}`)
        setError(errors.join(', '))
      }
    } catch (err) {
      console.error('AI 처리 중 오류:', err)
      setError('AI 처리 중 오류가 발생했습니다.')
    } finally {
      setIsGenerating(false)
    }
  }

  const clearResults = () => {
    setGeneratedSummary('')
    setGeneratedTags([])
    setError(null)
  }

  return (
    <div className="border rounded-lg p-4 bg-gray-50 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">🤖 AI 도우미</h3>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleGenerateSummary}
            disabled={disabled || isGenerating || !content.trim()}
          >
            요약 생성
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleGenerateTags}
            disabled={disabled || isGenerating || !content.trim()}
          >
            태그 생성
          </Button>
          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={handleGenerateBoth}
            disabled={disabled || isGenerating || !content.trim()}
          >
            둘 다 생성
          </Button>
          {(generatedSummary || generatedTags.length > 0) && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={clearResults}
              disabled={disabled || isGenerating}
            >
              지우기
            </Button>
          )}
        </div>
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div className="p-3 rounded-md bg-red-50 border border-red-200">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* 로딩 표시 */}
      {isGenerating && (
        <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-md">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <p className="text-sm text-gray-600">AI 처리 중...</p>
        </div>
      )}

      {/* 생성된 결과들 */}
      {(generatedSummary || generatedTags.length > 0) && (
        <div className="space-y-4">
          {/* 요약 결과 */}
          {generatedSummary && (
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">생성된 요약</Label>
              <Textarea
                value={generatedSummary}
                readOnly
                className="w-full min-h-[80px] bg-white"
                placeholder="AI가 생성한 요약이 여기에 표시됩니다"
              />
            </div>
          )}

          {/* 태그 결과 */}
          {generatedTags.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">생성된 태그</Label>
              <div className="flex flex-wrap gap-2 p-3 bg-white rounded-md border">
                {generatedTags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 사용법 안내 */}
      <div className="text-xs text-gray-500">
        💡 팁: 내용을 입력한 후 AI 버튼을 클릭하면 요약과 태그를 자동으로 생성해드립니다.
      </div>
    </div>
  )
}

