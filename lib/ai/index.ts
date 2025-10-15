// lib/ai/index.ts
// AI 모듈의 메인 진입점
// 모든 AI 관련 기능을 외부에서 쉽게 사용할 수 있도록 export
// 관련 파일: lib/ai/gemini-client.ts, lib/ai/summarize.ts, lib/ai/tag.ts, lib/ai/logger.ts

// Gemini API 클라이언트 관련
export {
  initializeGeminiClient,
  getGeminiClient,
  isGeminiAvailable,
  estimateTokenCount,
  isTokenLimitExceeded,
  truncateToTokenLimit,
  type SummaryResponse,
  type TagResponse,
  type GeminiError
} from './gemini-client';

// 요약 생성 관련
export {
  generateSummary,
  validateSummaryQuality
} from './summarize';

// 태그 생성 관련
export {
  generateTags,
  validateTagQuality,
  normalizeTags
} from './tag';

// 로깅 및 모니터링 관련
export {
  logApiCall,
  logError,
  logSuccess,
  getTodayTokenUsage,
  getRecentApiLogs,
  getApiStats,
  cleanupLogs,
  type ApiCallLog,
  type TokenUsage
} from './logger';

// 설정 관련
export {
  hasGeminiApiKey,
  getDevFallback,
  getGeminiApiKey,
  isProduction
} from './config';

