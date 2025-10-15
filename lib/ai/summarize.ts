// lib/ai/summarize.ts
// 노트 내용 기반 자동 요약 생성
// Gemini API를 사용하여 노트를 3-6개 불릿 포인트로 요약
// 관련 파일: lib/ai/gemini-client.ts, lib/ai/config.ts

import { getGeminiClient, isGeminiAvailable, truncateToTokenLimit, SummaryResponse } from './gemini-client';
import { getDevFallback } from './config';

/**
 * 노트 내용을 기반으로 요약을 생성합니다.
 * @param content 요약할 노트 내용
 * @returns 생성된 요약 또는 에러
 */
export async function generateSummary(content: string): Promise<{
  success: boolean;
  summary?: SummaryResponse;
  error?: string;
}> {
  try {
    // API 키가 없으면 개발 환경 fallback 반환
    if (!isGeminiAvailable()) {
      const fallback = getDevFallback();
      return {
        success: true,
        summary: {
          content: fallback.summary,
          model: 'dev-fallback',
          createdAt: new Date()
        }
      };
    }

    // 입력 내용 검증
    if (!content || content.trim().length === 0) {
      return {
        success: false,
        error: '요약할 내용이 없습니다.'
      };
    }

    // 토큰 제한에 맞게 내용 자르기
    const truncatedContent = truncateToTokenLimit(content, 8000);

    // Gemini API 클라이언트 가져오기
    const client = getGeminiClient();
    if (!client) {
      throw new Error('Gemini API 클라이언트를 초기화할 수 없습니다.');
    }

    // 요약 프롬프트 생성
    const prompt = `다음 노트 내용을 3-6개의 핵심 포인트로 간결하게 요약해주세요. 각 포인트는 핵심 내용을 담고 있어야 하며, 일반 텍스트로 작성해주세요. 마크다운이나 특수 기호는 사용하지 마세요.

노트 내용:
${truncatedContent}

요약:`;

    // API 호출
    const model = client.getGenerativeModel({ 
      model: 'gemini-2.0-flash-001',
      generationConfig: {
        temperature: 0.3, // 일관성 있는 요약을 위해 낮은 온도 설정
        maxOutputTokens: 500, // 요약 길이 제한
      }
    });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    if (!text) {
      throw new Error('API 응답에서 텍스트를 찾을 수 없습니다.');
    }

    // 응답 정리 및 검증
    const summaryText = text.trim();
    if (summaryText.length === 0) {
      throw new Error('생성된 요약이 비어있습니다.');
    }

    const summaryResponse: SummaryResponse = {
      content: summaryText,
      model: 'gemini-2.0-flash-001',
      createdAt: new Date()
    };

    return {
      success: true,
      summary: summaryResponse
    };

  } catch (error) {
    console.error('요약 생성 중 오류 발생:', error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : '요약 생성 중 알 수 없는 오류가 발생했습니다.'
    };
  }
}

/**
 * 요약 품질을 검증합니다.
 * @param summary 검증할 요약 텍스트
 * @returns 품질 검증 결과
 */
export function validateSummaryQuality(summary: string): {
  isValid: boolean;
  issues: string[];
} {
  const issues: string[] = [];

  // 기본 검증
  if (!summary || summary.trim().length === 0) {
    issues.push('요약이 비어있습니다.');
  }

  if (summary.length < 10) {
    issues.push('요약이 너무 짧습니다.');
  }

  if (summary.length > 2000) {
    issues.push('요약이 너무 깁니다.');
  }

  // 핵심 포인트 검증 (줄바꿈으로 구분)
  const lines = summary.split('\n').filter(line => line.trim().length > 0);
  if (lines.length < 3) {
    issues.push('요약에 핵심 포인트가 3개 미만입니다.');
  }

  if (lines.length > 6) {
    issues.push('요약에 핵심 포인트가 6개를 초과합니다.');
  }

  return {
    isValid: issues.length === 0,
    issues
  };
}
