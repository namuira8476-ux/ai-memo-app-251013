// __tests__/ai/logger.test.ts
// 로깅 및 모니터링 기능 테스트
// API 호출 로깅, 토큰 사용량 추적, 에러 로깅 테스트

import {
  logApiCall,
  logError,
  logSuccess,
  getTodayTokenUsage,
  getRecentApiLogs,
  getApiStats,
  cleanupLogs,
  type ApiCallLog
} from '@/lib/ai/logger';

describe('AI Logger', () => {
  beforeEach(() => {
    // 각 테스트 전에 로그 초기화
    cleanupLogs(0); // 모든 로그 삭제
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('logApiCall', () => {
    it('should log API call successfully', () => {
      const logData = {
        operation: 'summarize' as const,
        success: true,
        duration: 1000,
        tokenCount: 150,
        model: 'gemini-2.0-flash-001'
      };

      logApiCall(logData);

      const recentLogs = getRecentApiLogs(1);
      expect(recentLogs).toHaveLength(1);
      expect(recentLogs[0]).toMatchObject(logData);
      expect(recentLogs[0].timestamp).toBeInstanceOf(Date);
    });

    it('should log failed API call', () => {
      const logData = {
        operation: 'tag' as const,
        success: false,
        duration: 500,
        error: 'API Error'
      };

      logApiCall(logData);

      const recentLogs = getRecentApiLogs(1);
      expect(recentLogs).toHaveLength(1);
      expect(recentLogs[0]).toMatchObject(logData);
    });

    it('should update token usage when tokenCount is provided', () => {
      logApiCall({
        operation: 'summarize',
        success: true,
        duration: 1000,
        tokenCount: 100
      });

      logApiCall({
        operation: 'tag',
        success: true,
        duration: 500,
        tokenCount: 50
      });

      const todayUsage = getTodayTokenUsage();
      expect(todayUsage).not.toBeNull();
      expect(todayUsage?.totalTokens).toBe(150);
      expect(todayUsage?.summarizeTokens).toBe(100);
      expect(todayUsage?.tagTokens).toBe(50);
      expect(todayUsage?.apiCalls).toBe(2);
    });
  });

  describe('logError', () => {
    it('should log error with Error object', () => {
      const error = new Error('Test error');
      const context = { noteId: '123', operation: 'test' };

      logError('test-operation', error, context);

      const recentLogs = getRecentApiLogs(1);
      expect(recentLogs).toHaveLength(1);
      expect(recentLogs[0].operation).toBe('test-operation');
      expect(recentLogs[0].success).toBe(false);
      expect(recentLogs[0].error).toBe('Test error');
    });

    it('should log error with string message', () => {
      logError('test-operation', 'String error message');

      const recentLogs = getRecentApiLogs(1);
      expect(recentLogs).toHaveLength(1);
      expect(recentLogs[0].error).toBe('String error message');
    });
  });

  describe('logSuccess', () => {
    it('should log successful operation', () => {
      logSuccess('summarize', 1000, 150, 'gemini-2.0-flash-001');

      const recentLogs = getRecentApiLogs(1);
      expect(recentLogs).toHaveLength(1);
      expect(recentLogs[0]).toMatchObject({
        operation: 'summarize',
        success: true,
        duration: 1000,
        tokenCount: 150,
        model: 'gemini-2.0-flash-001'
      });
    });

    it('should log success without optional parameters', () => {
      logSuccess('tag', 500);

      const recentLogs = getRecentApiLogs(1);
      expect(recentLogs).toHaveLength(1);
      expect(recentLogs[0]).toMatchObject({
        operation: 'tag',
        success: true,
        duration: 500
      });
    });
  });

  describe('getTodayTokenUsage', () => {
    it('should return null when no usage today', () => {
      const usage = getTodayTokenUsage();
      expect(usage).toBeNull();
    });

    it('should return today usage when available', () => {
      logApiCall({
        operation: 'summarize',
        success: true,
        duration: 1000,
        tokenCount: 100
      });

      const usage = getTodayTokenUsage();
      expect(usage).not.toBeNull();
      expect(usage?.totalTokens).toBe(100);
      expect(usage?.summarizeTokens).toBe(100);
      expect(usage?.apiCalls).toBe(1);
    });
  });

  describe('getRecentApiLogs', () => {
    it('should return recent logs in reverse chronological order', () => {
      logApiCall({
        operation: 'summarize',
        success: true,
        duration: 1000,
        tokenCount: 100
      });

      logApiCall({
        operation: 'tag',
        success: true,
        duration: 500,
        tokenCount: 50
      });

      const logs = getRecentApiLogs(2);
      expect(logs).toHaveLength(2);
      expect(logs[0].operation).toBe('tag'); // 최신 것이 먼저
      expect(logs[1].operation).toBe('summarize');
    });

    it('should limit results to specified number', () => {
      // 5개의 로그 생성
      for (let i = 0; i < 5; i++) {
        logApiCall({
          operation: 'summarize',
          success: true,
          duration: 1000,
          tokenCount: 100
        });
      }

      const logs = getRecentApiLogs(3);
      expect(logs).toHaveLength(3);
    });
  });

  describe('getApiStats', () => {
    it('should return correct statistics', () => {
      // 성공한 호출 3개
      for (let i = 0; i < 3; i++) {
        logApiCall({
          operation: 'summarize',
          success: true,
          duration: 1000,
          tokenCount: 100
        });
      }

      // 실패한 호출 1개
      logApiCall({
        operation: 'tag',
        success: false,
        duration: 500,
        error: 'API Error'
      });

      const stats = getApiStats();
      expect(stats.totalCalls).toBe(4);
      expect(stats.successRate).toBe(75); // 3/4 * 100
      expect(stats.averageDuration).toBe(875); // (1000*3 + 500*1) / 4
      expect(stats.totalTokens).toBe(300); // 100*3
      expect(stats.errorCount).toBe(1);
    });

    it('should return zero stats when no calls', () => {
      const stats = getApiStats();
      expect(stats.totalCalls).toBe(0);
      expect(stats.successRate).toBe(0);
      expect(stats.averageDuration).toBe(0);
      expect(stats.totalTokens).toBe(0);
      expect(stats.errorCount).toBe(0);
    });
  });

  describe('cleanupLogs', () => {
    it('should clean up old logs', () => {
      // 오래된 로그 생성 (실제로는 현재 시간이지만 테스트용)
      logApiCall({
        operation: 'summarize',
        success: true,
        duration: 1000,
        tokenCount: 100
      });

      // 로그 정리 (0일 보관 = 모든 로그 삭제)
      cleanupLogs(0);

      const logs = getRecentApiLogs();
      expect(logs).toHaveLength(0);

      const usage = getTodayTokenUsage();
      expect(usage).toBeNull();
    });
  });
});




