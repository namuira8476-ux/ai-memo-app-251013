// lib/ai/config.ts
// Gemini API 설정 및 검증 유틸리티
// 환경변수 관리 및 API 키 검증을 담당
// 관련 파일: .env.local, next.config.ts, lib/ai/gemini-client.ts

/**
 * Gemini API 키 존재 여부를 검증합니다.
 * @returns API 키가 존재하면 true, 없으면 false
 */
export function hasGeminiApiKey(): boolean {
  return !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here';
}

/**
 * 개발 환경에서 API 키가 없을 때 사용할 기본값을 반환합니다.
 * @returns 개발 환경용 fallback 값
 */
export function getDevFallback(): {
  summary: string;
  tags: string[];
} {
  return {
    summary: "AI 요약 기능을 사용하려면 Gemini API 키를 설정해주세요.\n\n개발 환경에서는 API 키가 없을 때 이 메시지가 표시됩니다.\n\n프로덕션 환경에서는 실제 AI 요약이 생성됩니다.",
    tags: ["ai-required", "api-key-missing"]
  };
}

/**
 * 환경변수에서 Gemini API 키를 안전하게 가져옵니다.
 * @returns API 키 또는 null
 */
export function getGeminiApiKey(): string | null {
  if (!hasGeminiApiKey()) {
    return null;
  }
  return process.env.GEMINI_API_KEY || null;
}

/**
 * 현재 환경이 프로덕션인지 확인합니다.
 * @returns 프로덕션 환경이면 true
 */
export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}
