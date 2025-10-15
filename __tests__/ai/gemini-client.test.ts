// __tests__/ai/gemini-client.test.ts
// Gemini API 클라이언트 테스트
// 클라이언트 초기화, 토큰 관리, 에러 핸들링 테스트

import {
  initializeGeminiClient,
  getGeminiClient,
  isGeminiAvailable,
  estimateTokenCount,
  isTokenLimitExceeded,
  truncateToTokenLimit,
  hasGeminiApiKey,
  getGeminiApiKey
} from '@/lib/ai';

// Gemini API Mock
jest.mock('@google/genai', () => ({
  GoogleGenAI: jest.fn(() => ({
    models: {
      generateContent: jest.fn(),
      embedContent: jest.fn()
    }
  }))
}));

describe('Gemini API Client', () => {
  beforeEach(() => {
    // 환경변수 초기화
    delete process.env.GEMINI_API_KEY;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('API Key Management', () => {
    it('should return false when API key is not set', () => {
      expect(hasGeminiApiKey()).toBe(false);
    });

    it('should return false when API key is placeholder', () => {
      process.env.GEMINI_API_KEY = 'your_gemini_api_key_here';
      expect(hasGeminiApiKey()).toBe(false);
    });

    it('should return true when valid API key is set', () => {
      process.env.GEMINI_API_KEY = 'valid-api-key-123';
      expect(hasGeminiApiKey()).toBe(true);
    });

    it('should return null when API key is not available', () => {
      expect(getGeminiApiKey()).toBeNull();
    });

    it('should return API key when available', () => {
      process.env.GEMINI_API_KEY = 'valid-api-key-123';
      expect(getGeminiApiKey()).toBe('valid-api-key-123');
    });
  });

  describe('Client Initialization', () => {
    it('should return null when API key is not set', () => {
      const client = initializeGeminiClient();
      expect(client).toBeNull();
    });

    it('should initialize client when API key is available', () => {
      process.env.GEMINI_API_KEY = 'valid-api-key-123';
      const client = initializeGeminiClient();
      expect(client).not.toBeNull();
    });

    it('should return existing client on subsequent calls', () => {
      process.env.GEMINI_API_KEY = 'valid-api-key-123';
      const client1 = getGeminiClient();
      const client2 = getGeminiClient();
      expect(client1).toBe(client2);
    });

    it('should return false when Gemini is not available', () => {
      expect(isGeminiAvailable()).toBe(false);
    });

    it('should return true when Gemini is available', () => {
      process.env.GEMINI_API_KEY = 'valid-api-key-123';
      expect(isGeminiAvailable()).toBe(true);
    });
  });

  describe('Token Management', () => {
    it('should estimate token count correctly', () => {
      const text = 'Hello world';
      const tokens = estimateTokenCount(text);
      expect(tokens).toBeGreaterThan(0);
      expect(tokens).toBeLessThanOrEqual(20); // 대략적인 범위
    });

    it('should handle empty text', () => {
      expect(estimateTokenCount('')).toBe(0);
    });

    it('should detect token limit exceeded', () => {
      const longText = 'word '.repeat(10000); // 매우 긴 텍스트
      expect(isTokenLimitExceeded(longText, 1000)).toBe(true);
    });

    it('should not exceed token limit for short text', () => {
      const shortText = 'Hello world';
      expect(isTokenLimitExceeded(shortText, 1000)).toBe(false);
    });

    it('should truncate text to token limit', () => {
      const longText = 'word '.repeat(10000);
      const truncated = truncateToTokenLimit(longText, 1000);
      expect(truncated.length).toBeLessThan(longText.length);
      expect(truncated).toContain('...');
    });

    it('should not truncate text within limit', () => {
      const shortText = 'Hello world';
      const truncated = truncateToTokenLimit(shortText, 1000);
      expect(truncated).toBe(shortText);
    });
  });

  describe('Error Handling', () => {
    it('should handle initialization errors gracefully', () => {
      // Mock GoogleGenAI to throw error
      const { GoogleGenAI } = require('@google/genai');
      GoogleGenAI.mockImplementation(() => {
        throw new Error('Initialization failed');
      });

      process.env.GEMINI_API_KEY = 'valid-api-key-123';
      const client = initializeGeminiClient();
      expect(client).toBeNull();
    });
  });
});



