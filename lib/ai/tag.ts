// lib/ai/tag.ts
// 노트 내용 기반 자동 태그 생성
// Gemini API를 사용하여 노트와 관련된 최대 6개의 태그 생성
// 관련 파일: lib/ai/gemini-client.ts, lib/ai/config.ts

import { getGeminiClient, isGeminiAvailable, truncateToTokenLimit, TagResponse } from './gemini-client';
import { getDevFallback } from './config';

/**
 * 노트 내용을 기반으로 태그를 생성합니다.
 * @param content 태그를 생성할 노트 내용
 * @returns 생성된 태그 또는 에러
 */
export async function generateTags(content: string): Promise<{
  success: boolean;
  tags?: TagResponse;
  error?: string;
}> {
  try {
    // API 키가 없으면 개발 환경 fallback 반환
    if (!isGeminiAvailable()) {
      const fallback = getDevFallback();
      return {
        success: true,
        tags: {
          tags: fallback.tags,
          model: 'dev-fallback',
          createdAt: new Date()
        }
      };
    }

    // 입력 내용 검증
    if (!content || content.trim().length === 0) {
      return {
        success: false,
        error: '태그를 생성할 내용이 없습니다.'
      };
    }

    // 토큰 제한에 맞게 내용 자르기
    const truncatedContent = truncateToTokenLimit(content, 8000);

    // Gemini API 클라이언트 가져오기
    const client = getGeminiClient();
    if (!client) {
      throw new Error('Gemini API 클라이언트를 초기화할 수 없습니다.');
    }

    // 태그 생성 프롬프트
    const prompt = `다음 노트 내용을 분석하여 가장 관련성이 높은 태그를 최대 6개까지 생성해주세요. 태그는 쉼표로 구분하여 나열해주세요.

노트 내용:
${truncatedContent}

태그:`;

    // API 호출
    const model = client.getGenerativeModel({ 
      model: 'gemini-2.0-flash-001',
      generationConfig: {
        temperature: 0.2, // 일관성 있는 태그를 위해 낮은 온도 설정
        maxOutputTokens: 200, // 태그 길이 제한
      }
    });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    if (!text) {
      throw new Error('API 응답에서 텍스트를 찾을 수 없습니다.');
    }

    // 태그 파싱 및 정리
    const rawTags = text.trim();
    const tags = parseTags(rawTags);

    if (tags.length === 0) {
      throw new Error('생성된 태그가 없습니다.');
    }

    const tagResponse: TagResponse = {
      tags,
      model: 'gemini-2.0-flash-001',
      createdAt: new Date()
    };

    return {
      success: true,
      tags: tagResponse
    };

  } catch (error) {
    console.error('태그 생성 중 오류 발생:', error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : '태그 생성 중 알 수 없는 오류가 발생했습니다.'
    };
  }
}

/**
 * API 응답에서 태그를 파싱합니다.
 * @param rawTags 원본 태그 문자열
 * @returns 정리된 태그 배열
 */
function parseTags(rawTags: string): string[] {
  // 쉼표, 줄바꿈, 세미콜론으로 분리
  const tags = rawTags
    .split(/[,;\n]/)
    .map(tag => tag.trim())
    .filter(tag => tag.length > 0)
    .map(tag => {
      // 특수문자 제거 및 정리
      return tag
        .replace(/[^\w\s가-힣]/g, '') // 영문, 숫자, 한글만 유지
        .trim()
        .toLowerCase();
    })
    .filter(tag => tag.length >= 2 && tag.length <= 20) // 길이 제한
    .slice(0, 6); // 최대 6개

  // 중복 제거
  return [...new Set(tags)];
}

/**
 * 태그 품질을 검증합니다.
 * @param tags 검증할 태그 배열
 * @returns 품질 검증 결과
 */
export function validateTagQuality(tags: string[]): {
  isValid: boolean;
  issues: string[];
} {
  const issues: string[] = [];

  // 기본 검증
  if (!tags || tags.length === 0) {
    issues.push('태그가 없습니다.');
    return { isValid: false, issues };
  }

  if (tags.length > 6) {
    issues.push('태그가 6개를 초과합니다.');
  }

  // 각 태그 검증
  tags.forEach((tag, index) => {
    if (!tag || tag.trim().length === 0) {
      issues.push(`${index + 1}번째 태그가 비어있습니다.`);
    } else if (tag.length < 2) {
      issues.push(`${index + 1}번째 태그가 너무 짧습니다: "${tag}"`);
    } else if (tag.length > 20) {
      issues.push(`${index + 1}번째 태그가 너무 깁니다: "${tag}"`);
    }
  });

  // 중복 검사
  const uniqueTags = new Set(tags);
  if (uniqueTags.size !== tags.length) {
    issues.push('중복된 태그가 있습니다.');
  }

  return {
    isValid: issues.length === 0,
    issues
  };
}

/**
 * 태그를 정규화합니다.
 * @param tags 정규화할 태그 배열
 * @returns 정규화된 태그 배열
 */
export function normalizeTags(tags: string[]): string[] {
  return tags
    .map(tag => tag.trim().toLowerCase())
    .filter(tag => tag.length >= 2 && tag.length <= 20)
    .slice(0, 6);
}

