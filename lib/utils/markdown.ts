// lib/utils/markdown.ts
// 마크다운 관련 유틸리티 함수들
// 마크다운 문법 제거, 텍스트 추출 등
// 관련 파일: components/notes/note-card.tsx, components/notes/markdown-viewer.tsx

/**
 * 마크다운 문법을 제거하고 순수 텍스트만 추출합니다.
 * @param markdown 마크다운 텍스트
 * @returns 순수 텍스트
 */
export function stripMarkdown(markdown: string): string {
  return markdown
    // 헤딩 제거 (# ## ### 등)
    .replace(/^#{1,6}\s+/gm, '')
    // 볼드/이탤릭 제거 (**text**, *text*, __text__, _text_)
    .replace(/(\*\*|__)(.*?)\1/g, '$2')
    .replace(/(\*|_)(.*?)\1/g, '$2')
    // 코드 블록 제거 (```code```)
    .replace(/```[\s\S]*?```/g, '')
    // 인라인 코드 제거 (`code`)
    .replace(/`([^`]+)`/g, '$1')
    // 링크 제거 ([text](url))
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
    // 이미지 제거 (![alt](url))
    .replace(/!\[([^\]]*)\]\([^\)]+\)/g, '')
    // 인용 제거 (>)
    .replace(/^\s*>\s+/gm, '')
    // 리스트 마커 제거 (-, *, +, 1. 등)
    .replace(/^\s*[-*+]\s+/gm, '')
    .replace(/^\s*\d+\.\s+/gm, '')
    // 구분선 제거 (---, ***, ___)
    .replace(/^\s*[-*_]{3,}\s*$/gm, '')
    // 여러 줄바꿈을 하나로
    .replace(/\n{3,}/g, '\n\n')
    // 앞뒤 공백 제거
    .trim()
}

/**
 * 마크다운 문법이 포함되어 있는지 체크합니다.
 * @param text 체크할 텍스트
 * @returns 마크다운 문법 포함 여부
 */
export function hasMarkdownSyntax(text: string): boolean {
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

/**
 * 텍스트를 지정된 길이로 자르고 말줄임표를 추가합니다.
 * @param text 자를 텍스트
 * @param maxLength 최대 길이
 * @returns 잘린 텍스트
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text
  }
  
  return text.substring(0, maxLength) + '...'
}

