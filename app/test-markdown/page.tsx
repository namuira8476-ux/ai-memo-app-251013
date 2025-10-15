// app/test-markdown/page.tsx
// 마크다운 편집기 테스트 페이지
// 마크다운 편집기 기능을 테스트할 수 있는 페이지
// 관련 파일: components/notes/markdown-editor.tsx

'use client'

import { useState } from 'react'
import { MarkdownEditor } from '@/components/notes/markdown-editor'

export default function TestMarkdownPage() {
  const [isUpdating, setIsUpdating] = useState(false)
  const [testContent, setTestContent] = useState(`# 마크다운 편집기 테스트

이것은 **마크다운 편집기** 테스트 페이지입니다.

## 기능 테스트

- [x] 마크다운 문법 지원
- [x] 실시간 미리보기
- [x] 편집 모드 전환
- [x] 저장 기능

### 코드 블록 테스트

\`\`\`javascript
function hello() {
  console.log("Hello, Markdown Editor!");
}
\`\`\`

### 링크 테스트

[Google](https://google.com)으로 이동하기

### 이미지 테스트

![이미지](https://via.placeholder.com/300x200)

> 이것은 인용문입니다.

---

**굵은 글씨**와 *기울임 글씨*를 테스트해보세요.`)

  const handleSave = async (content: string) => {
    setIsUpdating(true)
    try {
      // 실제 저장 로직 대신 시뮬레이션
      await new Promise(resolve => setTimeout(resolve, 1000))
      setTestContent(content)
      alert('내용이 저장되었습니다!')
    } catch (error) {
      console.error('저장 중 오류:', error)
      alert('저장 중 오류가 발생했습니다.')
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          마크다운 편집기 테스트
        </h1>
        <p className="text-gray-600">
          마크다운 편집기의 기능을 테스트해보세요. 편집 버튼을 클릭하여 마크다운 모드로 전환할 수 있습니다.
        </p>
      </div>

      <MarkdownEditor
        initialContent={testContent}
        onSave={handleSave}
        onCancel={() => {}}
        isLoading={isUpdating}
      />

      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">
          테스트 가이드
        </h3>
        <ul className="text-blue-800 space-y-1">
          <li>• "마크다운으로 편집" 버튼을 클릭하여 편집 모드로 전환</li>
          <li>• 마크다운 문법을 사용하여 텍스트 포맷팅</li>
          <li>• 실시간 미리보기로 결과 확인</li>
          <li>• "저장" 버튼으로 변경사항 저장</li>
          <li>• "취소" 버튼으로 변경사항 취소</li>
        </ul>
      </div>
    </div>
  )
}

