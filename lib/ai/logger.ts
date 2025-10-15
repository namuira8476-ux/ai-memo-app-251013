// lib/ai/logger.ts
// AI 관련 로깅 및 모니터링
// API 호출, 토큰 사용량, 에러 등을 추적하고 기록
// 관련 파일: lib/ai/gemini-client.ts, lib/ai/summarize.ts, lib/ai/tag.ts

export interface ApiCallLog {
  timestamp: Date;
  operation: 'summarize' | 'tag' | 'client_init';
  success: boolean;
  duration: number; // milliseconds
  tokenCount?: number;
  error?: string;
  model?: string;
}

export interface TokenUsage {
  date: string; // YYYY-MM-DD format
  totalTokens: number;
  summarizeTokens: number;
  tagTokens: number;
  apiCalls: number;
}

// 메모리 기반 로그 저장소 (프로덕션에서는 데이터베이스 사용 권장)
const apiCallLogs: ApiCallLog[] = [];
const tokenUsageMap = new Map<string, TokenUsage>();

/**
 * API 호출을 로깅합니다.
 * @param log 로그 데이터
 */
export function logApiCall(log: Omit<ApiCallLog, 'timestamp'>): void {
  const fullLog: ApiCallLog = {
    ...log,
    timestamp: new Date()
  };

  apiCallLogs.push(fullLog);
  
  // 콘솔 로깅 (개발 환경)
  if (process.env.NODE_ENV === 'development') {
    console.log(`[AI API] ${log.operation}: ${log.success ? 'SUCCESS' : 'FAILED'} (${log.duration}ms)`, {
      tokenCount: log.tokenCount,
      error: log.error,
      model: log.model
    });
  }

  // 토큰 사용량 업데이트
  if (log.tokenCount && log.tokenCount > 0) {
    updateTokenUsage(log.operation, log.tokenCount);
  }
}

/**
 * 토큰 사용량을 업데이트합니다.
 * @param operation 작업 유형
 * @param tokenCount 사용된 토큰 수
 */
function updateTokenUsage(operation: 'summarize' | 'tag' | 'client_init', tokenCount: number): void {
  const today = new Date().toISOString().split('T')[0];
  
  const existing = tokenUsageMap.get(today) || {
    date: today,
    totalTokens: 0,
    summarizeTokens: 0,
    tagTokens: 0,
    apiCalls: 0
  };

  existing.totalTokens += tokenCount;
  existing.apiCalls += 1;

  if (operation === 'summarize') {
    existing.summarizeTokens += tokenCount;
  } else if (operation === 'tag') {
    existing.tagTokens += tokenCount;
  }

  tokenUsageMap.set(today, existing);
}

/**
 * 오늘의 토큰 사용량을 반환합니다.
 * @returns 오늘의 토큰 사용량
 */
export function getTodayTokenUsage(): TokenUsage | null {
  const today = new Date().toISOString().split('T')[0];
  return tokenUsageMap.get(today) || null;
}

/**
 * 최근 API 호출 로그를 반환합니다.
 * @param limit 반환할 로그 수 (기본값: 50)
 * @returns 최근 API 호출 로그
 */
export function getRecentApiLogs(limit: number = 50): ApiCallLog[] {
  return apiCallLogs
    .slice()
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, limit);
}

/**
 * 에러 로그를 기록합니다.
 * @param operation 작업 유형
 * @param error 에러 객체 또는 메시지
 * @param context 추가 컨텍스트
 */
export function logError(
  operation: string, 
  error: Error | string, 
  context?: Record<string, unknown>
): void {
  const errorMessage = error instanceof Error ? error.message : error;
  const errorStack = error instanceof Error ? error.stack : undefined;

  console.error(`[AI ERROR] ${operation}:`, {
    message: errorMessage,
    stack: errorStack,
    context,
    timestamp: new Date().toISOString()
  });

  // API 호출 로그에도 기록
  logApiCall({
    operation: operation as 'summarize' | 'tag' | 'client_init',
    success: false,
    duration: 0,
    error: errorMessage
  });
}

/**
 * 성공적인 API 호출을 로깅합니다.
 * @param operation 작업 유형
 * @param duration 호출 시간 (ms)
 * @param tokenCount 사용된 토큰 수
 * @param model 사용된 모델
 */
export function logSuccess(
  operation: 'summarize' | 'tag' | 'client_init',
  duration: number,
  tokenCount?: number,
  model?: string
): void {
  logApiCall({
    operation,
    success: true,
    duration,
    tokenCount,
    model
  });
}

/**
 * API 호출 통계를 반환합니다.
 * @param days 통계를 가져올 일수 (기본값: 7)
 * @returns API 호출 통계
 */
export function getApiStats(days: number = 7): {
  totalCalls: number;
  successRate: number;
  averageDuration: number;
  totalTokens: number;
  errorCount: number;
} {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  const recentLogs = apiCallLogs.filter(log => log.timestamp >= cutoffDate);
  
  const totalCalls = recentLogs.length;
  const successCalls = recentLogs.filter(log => log.success).length;
  const totalDuration = recentLogs.reduce((sum, log) => sum + log.duration, 0);
  const totalTokens = recentLogs.reduce((sum, log) => sum + (log.tokenCount || 0), 0);
  const errorCount = recentLogs.filter(log => !log.success).length;

  return {
    totalCalls,
    successRate: totalCalls > 0 ? (successCalls / totalCalls) * 100 : 0,
    averageDuration: totalCalls > 0 ? totalDuration / totalCalls : 0,
    totalTokens,
    errorCount
  };
}

/**
 * 로그를 정리합니다. (메모리 관리)
 * @param daysToKeep 보관할 일수 (기본값: 30)
 */
export function cleanupLogs(daysToKeep: number = 30): void {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

  // API 호출 로그 정리
  const logsToKeep = apiCallLogs.filter(log => log.timestamp >= cutoffDate);
  apiCallLogs.length = 0;
  apiCallLogs.push(...logsToKeep);

  // 토큰 사용량 맵 정리
  for (const [date] of tokenUsageMap.entries()) {
    if (new Date(date) < cutoffDate) {
      tokenUsageMap.delete(date);
    }
  }

  console.log(`[AI Logger] 로그 정리 완료. ${logsToKeep.length}개 로그 보관.`);
}
