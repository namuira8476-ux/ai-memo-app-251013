// __tests__/ai/summarize.test.ts
// 요약 생성 기능 테스트
// generateSummary 함수의 다양한 시나리오 테스트

import { generateSummary, validateSummaryQuality } from '@/lib/ai';

// Gemini API Mock
jest.mock('@google/genai', () => ({
  GoogleGenAI: jest.fn(() => ({
    models: {
      generateContent: jest.fn()
    }
  }))
}));

describe('Summary Generation', () => {
  beforeEach(() => {
    // 환경변수 초기화
    delete process.env.GEMINI_API_KEY;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('generateSummary', () => {
    it('should return dev fallback when API key is not set', async () => {
      const result = await generateSummary('Test content');
      
      expect(result.success).toBe(true);
      expect(result.summary).toBeDefined();
      expect(result.summary?.model).toBe('dev-fallback');
      expect(result.summary?.content).toContain('API 키를 설정해주세요');
    });

    it('should return dev fallback for empty content', async () => {
      const result = await generateSummary('');
      
      expect(result.success).toBe(true);
      expect(result.summary?.model).toBe('dev-fallback');
    });

    it('should return dev fallback for whitespace-only content', async () => {
      const result = await generateSummary('   \n\t   ');
      
      expect(result.success).toBe(true);
      expect(result.summary?.model).toBe('dev-fallback');
    });

    it('should handle API call with valid content', async () => {
      process.env.GEMINI_API_KEY = 'valid-api-key-123';
      
      // Mock successful API response
      const { GoogleGenAI } = require('@google/genai');
      const mockGenerateContent = jest.fn().mockResolvedValue({
        text: '• 첫 번째 요약 포인트\n• 두 번째 요약 포인트\n• 세 번째 요약 포인트'
      });
      
      GoogleGenAI.mockImplementation(() => ({
        models: {
          generateContent: mockGenerateContent
        }
      }));

      const result = await generateSummary('This is a test content for summarization.');
      
      expect(result.success).toBe(true);
      expect(result.summary).toBeDefined();
      expect(result.summary?.content).toContain('요약 포인트');
      expect(result.summary?.model).toBe('gemini-2.0-flash-001');
      expect(mockGenerateContent).toHaveBeenCalledWith({
        model: 'gemini-2.0-flash-001',
        contents: expect.stringContaining('요약해주세요'),
        config: {
          temperature: 0.3,
          maxOutputTokens: 500
        }
      });
    });

    it('should handle API errors gracefully', async () => {
      process.env.GEMINI_API_KEY = 'valid-api-key-123';
      
      // Mock API error
      const { GoogleGenAI } = require('@google/genai');
      const mockGenerateContent = jest.fn().mockRejectedValue(new Error('API Error'));
      
      GoogleGenAI.mockImplementation(() => ({
        models: {
          generateContent: mockGenerateContent
        }
      }));

      const result = await generateSummary('Valid test content');
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('API Error');
    });

    it('should handle empty API response', async () => {
      process.env.GEMINI_API_KEY = 'valid-api-key-123';
      
      // Mock empty response
      const { GoogleGenAI } = require('@google/genai');
      const mockGenerateContent = jest.fn().mockResolvedValue({
        text: ''
      });
      
      GoogleGenAI.mockImplementation(() => ({
        models: {
          generateContent: mockGenerateContent
        }
      }));

      const result = await generateSummary('Valid test content');
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('생성된 요약이 비어있습니다.');
    });

    it('should truncate long content to token limit', async () => {
      process.env.GEMINI_API_KEY = 'valid-api-key-123';
      
      const longContent = 'word '.repeat(20000); // 매우 긴 내용
      
      const { GoogleGenAI } = require('@google/genai');
      const mockGenerateContent = jest.fn().mockResolvedValue({
        text: '• 요약 포인트'
      });
      
      GoogleGenAI.mockImplementation(() => ({
        models: {
          generateContent: mockGenerateContent
        }
      }));

      const result = await generateSummary(longContent);
      
      expect(result.success).toBe(true);
      // API 호출 시 잘린 내용이 전달되었는지 확인
      const callArgs = mockGenerateContent.mock.calls[0][0];
      expect(callArgs.contents.length).toBeLessThan(longContent.length);
    });
  });

  describe('validateSummaryQuality', () => {
    it('should validate good summary', () => {
      const goodSummary = '• 첫 번째 포인트\n• 두 번째 포인트\n• 세 번째 포인트';
      const result = validateSummaryQuality(goodSummary);
      
      expect(result.isValid).toBe(true);
      expect(result.issues).toHaveLength(0);
    });

    it('should detect empty summary', () => {
      const result = validateSummaryQuality('');
      
      expect(result.isValid).toBe(false);
      expect(result.issues).toContain('요약이 비어있습니다.');
    });

    it('should detect too short summary', () => {
      const result = validateSummaryQuality('short');
      
      expect(result.isValid).toBe(false);
      expect(result.issues).toContain('요약이 너무 짧습니다.');
    });

    it('should detect too long summary', () => {
      const longSummary = 'a'.repeat(3000);
      const result = validateSummaryQuality(longSummary);
      
      expect(result.isValid).toBe(false);
      expect(result.issues).toContain('요약이 너무 깁니다.');
    });

    it('should detect insufficient bullet points', () => {
      const result = validateSummaryQuality('• 포인트 하나');
      
      expect(result.isValid).toBe(false);
      expect(result.issues).toContain('요약에 불릿 포인트가 3개 미만입니다.');
    });

    it('should detect too many bullet points', () => {
      const manyPoints = '• 포인트1\n• 포인트2\n• 포인트3\n• 포인트4\n• 포인트5\n• 포인트6\n• 포인트7\n• 포인트8';
      const result = validateSummaryQuality(manyPoints);
      
      expect(result.isValid).toBe(false);
      expect(result.issues).toContain('요약에 불릿 포인트가 6개를 초과합니다.');
    });
  });
});
