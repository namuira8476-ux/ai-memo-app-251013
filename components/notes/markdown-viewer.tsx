// components/notes/markdown-viewer.tsx
// 마크다운 콘텐츠를 렌더링하는 뷰어 컴포넌트
// 마크다운 문법이 있으면 렌더링하고, 일반 텍스트는 그대로 표시
// 관련 파일: components/notes/markdown-editor.tsx, app/notes/[id]/note-detail-client.tsx

'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'

interface MarkdownViewerProps {
  content: string
  className?: string
}

export function MarkdownViewer({ content, className = '' }: MarkdownViewerProps) {
  // 마크다운 문법이 포함되어 있는지 간단히 체크
  const hasMarkdownSyntax = (text: string): boolean => {
    const markdownPatterns = [
      /^#{1,6}\s/m,           // 헤딩 (#, ##, ###)
      /\*\*.*?\*\*/,          // 볼드 (**text**)
      /\*.*?\*/,              // 이탤릭 (*text*)
      /`.*?`/,                // 코드 (`code`)
      /```[\s\S]*?```/,       // 코드 블록 (```code```)
      /^\s*[-*+]\s/m,         // 리스트 (-, *, +)
      /^\s*\d+\.\s/m,         // 번호 리스트 (1. 2. 3.)
      /\[.*?\]\(.*?\)/,       // 링크 ([text](url))
      /!\[.*?\]\(.*?\)/,      // 이미지 (![alt](url))
      /^\s*>\s/m,             // 인용 (>)
      /^\s*---\s*$/m,         // 구분선 (---)
    ]
    
    return markdownPatterns.some(pattern => pattern.test(text))
  }

  const isMarkdown = hasMarkdownSyntax(content)

  if (!isMarkdown) {
    // 일반 텍스트인 경우 그대로 표시
    return (
      <div className={`whitespace-pre-wrap text-gray-800 ${className}`}>
        {content}
      </div>
    )
  }

  // 마크다운 문법이 있는 경우 렌더링
  return (
    <div className={`prose prose-sm max-w-none ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          // 커스텀 스타일링
          h1: ({ ...props }) => <h1 className="text-3xl font-bold mb-4 mt-6" {...props} />,
          h2: ({ ...props }) => <h2 className="text-2xl font-bold mb-3 mt-5" {...props} />,
          h3: ({ ...props }) => <h3 className="text-xl font-bold mb-2 mt-4" {...props} />,
          p: ({ ...props }) => <p className="mb-4 text-gray-800 leading-relaxed" {...props} />,
          ul: ({ ...props }) => <ul className="list-disc list-inside mb-4 space-y-2" {...props} />,
          ol: ({ ...props }) => <ol className="list-decimal list-inside mb-4 space-y-2" {...props} />,
          li: ({ ...props }) => <li className="text-gray-800" {...props} />,
          code: ({ ...props }) => (
            <code className="bg-gray-100 text-red-600 px-1.5 py-0.5 rounded text-sm" {...props} />
          ),
          pre: ({ ...props }) => <pre className="mb-4 overflow-x-auto" {...props} />,
          blockquote: ({ ...props }) => (
            <blockquote className="border-l-4 border-gray-300 pl-4 italic text-gray-700 mb-4" {...props} />
          ),
          a: ({ ...props }) => (
            <a className="text-blue-600 hover:text-blue-800 underline" target="_blank" rel="noopener noreferrer" {...props} />
          ),
          hr: ({ ...props }) => <hr className="my-6 border-gray-300" {...props} />,
          table: ({ ...props }) => (
            <div className="overflow-x-auto mb-4">
              <table className="min-w-full divide-y divide-gray-200 border" {...props} />
            </div>
          ),
          thead: ({ ...props }) => <thead className="bg-gray-50" {...props} />,
          th: ({ ...props }) => <th className="px-4 py-2 text-left text-sm font-semibold text-gray-900" {...props} />,
          td: ({ ...props }) => <td className="px-4 py-2 text-sm text-gray-800 border-t" {...props} />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}

