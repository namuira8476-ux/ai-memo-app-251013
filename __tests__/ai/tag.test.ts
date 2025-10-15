// __tests__/ai/tag.test.ts
// 태그 생성 기능 테스트
// generateTags 함수의 다양한 시나리오 테스트

import { generateTags, validateTagQuality, normalizeTags } from '@/lib/ai';

// Gemini API Mock
jest.mock('@google/genai', () => ({
  GoogleGenAI: jest.fn(() => ({
    models: {
      generateContent: jest.fn()
    }
  }))
}));

describe('Tag Generation', () => {
  beforeEach(() => {
    // 환경변수 초기화
    delete process.env.GEMINI_API_KEY;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('generateTags', () => {
    it('should return dev fallback when API key is not set', async () => {
      const result = await generateTags('Test content');
      
      expect(result.success).toBe(true);
      expect(result.tags).toBeDefined();
      expect(result.tags?.model).toBe('dev-fallback');
      expect(result.tags?.tags).toContain('ai-required');
    });

    it('should return dev fallback for empty content', async () => {
      const result = await generateTags('');
      
      expect(result.success).toBe(true);
      expect(result.tags?.model).toBe('dev-fallback');
    });

    it('should return dev fallback for whitespace-only content', async () => {
      const result = await generateTags('   \n\t   ');
      
      expect(result.success).toBe(true);
      expect(result.tags?.model).toBe('dev-fallback');
    });

    it('should handle API call with valid content', async () => {
      process.env.GEMINI_API_KEY = 'valid-api-key-123';
      
      // Mock successful API response
      const { GoogleGenAI } = require('@google/genai');
      const mockGenerateContent = jest.fn().mockResolvedValue({
        text: 'javascript, programming, web development, tutorial, coding'
      });
      
      GoogleGenAI.mockImplementation(() => ({
        models: {
          generateContent: mockGenerateContent
        }
      }));

      const result = await generateTags('This is a JavaScript programming tutorial about web development.');
      
      expect(result.success).toBe(true);
      expect(result.tags).toBeDefined();
      expect(result.tags?.tags).toContain('javascript');
      expect(result.tags?.tags).toContain('programming');
      expect(result.tags?.model).toBe('gemini-2.0-flash-001');
      expect(mockGenerateContent).toHaveBeenCalledWith({
        model: 'gemini-2.0-flash-001',
        contents: expect.stringContaining('태그를 생성해주세요'),
        config: {
          temperature: 0.2,
          maxOutputTokens: 200
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

      const result = await generateTags('Valid test content');
      
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

      const result = await generateTags('Valid test content');
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('생성된 태그가 없습니다.');
    });

    it('should parse tags correctly from various formats', async () => {
      process.env.GEMINI_API_KEY = 'valid-api-key-123';
      
      // Mock response with different separators
      const { GoogleGenAI } = require('@google/genai');
      const mockGenerateContent = jest.fn().mockResolvedValue({
        text: 'tag1, tag2; tag3\ntag4'
      });
      
      GoogleGenAI.mockImplementation(() => ({
        models: {
          generateContent: mockGenerateContent
        }
      }));

      const result = await generateTags('Valid test content');
      
      expect(result.success).toBe(true);
      expect(result.tags?.tags).toEqual(['tag1', 'tag2', 'tag3', 'tag4']);
    });

    it('should filter out invalid tags', async () => {
      process.env.GEMINI_API_KEY = 'valid-api-key-123';
      
      // Mock response with invalid tags
      const { GoogleGenAI } = require('@google/genai');
      const mockGenerateContent = jest.fn().mockResolvedValue({
        text: 'a, valid-tag, x, another-valid-tag, very-long-tag-name-that-exceeds-limit'
      });
      
      GoogleGenAI.mockImplementation(() => ({
        models: {
          generateContent: mockGenerateContent
        }
      }));

      const result = await generateTags('Valid test content');
      
      expect(result.success).toBe(true);
      expect(result.tags?.tags).toEqual(['valid-tag', 'another-valid-tag']);
    });

    it('should limit tags to maximum 6', async () => {
      process.env.GEMINI_API_KEY = 'valid-api-key-123';
      
      // Mock response with many tags
      const { GoogleGenAI } = require('@google/genai');
      const mockGenerateContent = jest.fn().mockResolvedValue({
        text: 'tag1, tag2, tag3, tag4, tag5, tag6, tag7, tag8'
      });
      
      GoogleGenAI.mockImplementation(() => ({
        models: {
          generateContent: mockGenerateContent
        }
      }));

      const result = await generateTags('Valid test content');
      
      expect(result.success).toBe(true);
      expect(result.tags?.tags).toHaveLength(6);
    });
  });

  describe('validateTagQuality', () => {
    it('should validate good tags', () => {
      const goodTags = ['javascript', 'programming', 'web'];
      const result = validateTagQuality(goodTags);
      
      expect(result.isValid).toBe(true);
      expect(result.issues).toHaveLength(0);
    });

    it('should detect empty tags array', () => {
      const result = validateTagQuality([]);
      
      expect(result.isValid).toBe(false);
      expect(result.issues).toContain('태그가 없습니다.');
    });

    it('should detect too many tags', () => {
      const manyTags = ['tag1', 'tag2', 'tag3', 'tag4', 'tag5', 'tag6', 'tag7'];
      const result = validateTagQuality(manyTags);
      
      expect(result.isValid).toBe(false);
      expect(result.issues).toContain('태그가 6개를 초과합니다.');
    });

    it('should detect empty tag', () => {
      const result = validateTagQuality(['valid-tag', '', 'another-tag']);
      
      expect(result.isValid).toBe(false);
      expect(result.issues).toContain('2번째 태그가 비어있습니다.');
    });

    it('should detect too short tag', () => {
      const result = validateTagQuality(['valid-tag', 'x', 'another-tag']);
      
      expect(result.isValid).toBe(false);
      expect(result.issues).toContain('2번째 태그가 너무 짧습니다: "x"');
    });

    it('should detect too long tag', () => {
      const longTag = 'very-long-tag-name-that-exceeds-twenty-characters';
      const result = validateTagQuality(['valid-tag', longTag]);
      
      expect(result.isValid).toBe(false);
      expect(result.issues).toContain(`2번째 태그가 너무 깁니다: "${longTag}"`);
    });

    it('should detect duplicate tags', () => {
      const result = validateTagQuality(['tag1', 'tag2', 'tag1']);
      
      expect(result.isValid).toBe(false);
      expect(result.issues).toContain('중복된 태그가 있습니다.');
    });
  });

  describe('normalizeTags', () => {
    it('should normalize tags correctly', () => {
      const tags = ['JavaScript', 'PROGRAMMING', 'Web Development'];
      const normalized = normalizeTags(tags);
      
      expect(normalized).toEqual(['javascript', 'programming', 'web development']);
    });

    it('should filter out invalid tags', () => {
      const tags = ['a', 'valid-tag', 'x', 'very-long-tag-name-that-exceeds-limit'];
      const normalized = normalizeTags(tags);
      
      expect(normalized).toEqual(['valid-tag']);
    });

    it('should limit to 6 tags', () => {
      const tags = ['tag1', 'tag2', 'tag3', 'tag4', 'tag5', 'tag6', 'tag7', 'tag8'];
      const normalized = normalizeTags(tags);
      
      expect(normalized).toHaveLength(6);
    });

    it('should handle empty array', () => {
      const normalized = normalizeTags([]);
      
      expect(normalized).toEqual([]);
    });
  });
});
