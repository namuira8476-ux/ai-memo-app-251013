// app/test-gemini/page.tsx
// Gemini API 테스트 페이지
// 구현된 AI 기능들을 간단하게 테스트할 수 있는 페이지
// 관련 파일: lib/ai/index.ts, lib/actions/notes.ts

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'

export default function TestGeminiPage() {
  const [testText, setTestText] = useState('')
  const [summary, setSummary] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleTestSummary = async () => {
    if (!testText.trim()) {
      setError('테스트할 텍스트를 입력해주세요.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/test-gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'summarize',
          content: testText,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setSummary(data.summary)
      } else {
        setError(data.error || '요약 생성에 실패했습니다.')
      }
    } catch (err) {
      setError('요약 생성 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleTestTags = async () => {
    if (!testText.trim()) {
      setError('테스트할 텍스트를 입력해주세요.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/test-gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'tags',
          content: testText,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setTags(data.tags)
      } else {
        setError(data.error || '태그 생성에 실패했습니다.')
      }
    } catch (err) {
      setError('태그 생성 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleTestBoth = async () => {
    if (!testText.trim()) {
      setError('테스트할 텍스트를 입력해주세요.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/test-gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'both',
          content: testText,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setSummary(data.summary)
        setTags(data.tags)
      } else {
        setError(data.error || 'AI 처리에 실패했습니다.')
      }
    } catch (err) {
      setError('AI 처리 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const clearResults = () => {
    setSummary('')
    setTags([])
    setError('')
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Gemini API 테스트</h1>
        <p className="text-gray-600">
          구현된 AI 기능들을 테스트해보세요. 요약과 태그 생성 기능을 확인할 수 있습니다.
        </p>
      </div>

      <div className="space-y-6">
        {/* 입력 섹션 */}
        <div className="border rounded-lg p-6 bg-white shadow-sm">
          <h2 className="text-xl font-semibold mb-2">테스트 텍스트 입력</h2>
          <p className="text-gray-600 mb-4">
            요약과 태그를 생성할 텍스트를 입력하세요.
          </p>
          
          <Textarea
            placeholder="테스트할 텍스트를 입력하세요..."
            value={testText}
            onChange={(e) => setTestText(e.target.value)}
            rows={6}
            className="w-full mb-4"
          />
          
          <div className="flex gap-2 flex-wrap">
            <Button 
              onClick={handleTestSummary} 
              disabled={loading}
              variant="default"
            >
              요약 생성
            </Button>
            <Button 
              onClick={handleTestTags} 
              disabled={loading}
              variant="default"
            >
              태그 생성
            </Button>
            <Button 
              onClick={handleTestBoth} 
              disabled={loading}
              variant="default"
            >
              둘 다 생성
            </Button>
            <Button 
              onClick={clearResults} 
              disabled={loading}
              variant="outline"
            >
              결과 지우기
            </Button>
          </div>
        </div>

        {/* 에러 표시 */}
        {error && (
          <div className="border border-red-200 bg-red-50 rounded-lg p-4">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* 로딩 표시 */}
        {loading && (
          <div className="border rounded-lg p-4 bg-blue-50">
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <p className="text-gray-600">AI 처리 중...</p>
            </div>
          </div>
        )}

        {/* 결과 섹션 */}
        {(summary || tags.length > 0) && (
          <div className="grid gap-6 md:grid-cols-2">
            {/* 요약 결과 */}
            {summary && (
              <div className="border rounded-lg p-6 bg-white shadow-sm">
                <h3 className="text-lg font-semibold mb-2">생성된 요약</h3>
                <p className="text-gray-600 mb-4">AI가 생성한 요약입니다.</p>
                <div className="whitespace-pre-wrap text-sm bg-gray-50 p-3 rounded">
                  {summary}
                </div>
              </div>
            )}

            {/* 태그 결과 */}
            {tags.length > 0 && (
              <div className="border rounded-lg p-6 bg-white shadow-sm">
                <h3 className="text-lg font-semibold mb-2">생성된 태그</h3>
                <p className="text-gray-600 mb-4">AI가 생성한 태그입니다.</p>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag, index) => (
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
        <div className="border rounded-lg p-6 bg-gray-50">
          <h3 className="text-lg font-semibold mb-2">사용법</h3>
          <div className="space-y-2 text-sm text-gray-600">
            <p>• <strong>요약 생성</strong>: 입력된 텍스트를 3-6개의 핵심 포인트로 요약합니다.</p>
            <p>• <strong>태그 생성</strong>: 입력된 텍스트와 관련된 최대 6개의 태그를 생성합니다.</p>
            <p>• <strong>둘 다 생성</strong>: 요약과 태그를 동시에 생성합니다.</p>
            <p>• API 키가 설정되지 않은 경우 개발용 fallback 메시지가 표시됩니다.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
