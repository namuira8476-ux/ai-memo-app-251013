// lib/ai/gemini-client.ts
// Gemini API 클라이언트 초기화 및 관리
// Google Generative AI SDK를 사용하여 Gemini API와 통신
// 관련 파일: lib/ai/config.ts, lib/ai/summarize.ts, lib/ai/tag.ts

import { GoogleGenerativeAI } from '@google/generative-ai';
import { getGeminiApiKey, hasGeminiApiKey } from './config';

// API 응답 타입 정의
export interface SummaryResponse {
  content: string;
  model: string;
  createdAt: Date;
}

export interface TagResponse {
  tags: string[];
  model: string;
  createdAt: Date;
}

export interface GeminiError {
  message: string;
  code?: string;
  details?: Record<string, unknown>;
}

// Gemini API 클라이언트 인스턴스
let geminiClient: GoogleGenerativeAI | null = null;

/**
 * Gemini API 클라이언트를 초기화합니다.
 * @returns 초기화된 클라이언트 또는 null
 */
export function initializeGeminiClient(): GoogleGenerativeAI | null {
  if (!hasGeminiApiKey()) {
    console.warn('Gemini API 키가 설정되지 않았습니다.');
    return null;
  }

  try {
    const apiKey = getGeminiApiKey();
    if (!apiKey) {
      throw new Error('API 키를 가져올 수 없습니다.');
    }

    geminiClient = new GoogleGenerativeAI(apiKey);
    console.log('Gemini API 클라이언트가 성공적으로 초기화되었습니다.');
    return geminiClient;
  } catch (error) {
    console.error('Gemini API 클라이언트 초기화 실패:', error);
    return null;
  }
}

/**
 * 초기화된 Gemini API 클라이언트를 반환합니다.
 * @returns 클라이언트 인스턴스 또는 null
 */
export function getGeminiClient(): GoogleGenerativeAI | null {
  if (!geminiClient) {
    return initializeGeminiClient();
  }
  return geminiClient;
}

/**
 * Gemini API 클라이언트가 사용 가능한지 확인합니다.
 * @returns 사용 가능하면 true
 */
export function isGeminiAvailable(): boolean {
  return hasGeminiApiKey() && getGeminiClient() !== null;
}

/**
 * 토큰 수를 대략적으로 계산합니다.
 * @param text 계산할 텍스트
 * @returns 예상 토큰 수
 */
export function estimateTokenCount(text: string): number {
  // 빈 텍스트 처리
  if (!text || text.trim().length === 0) {
    return 0;
  }
  
  // 대략적인 계산: 공백으로 분리된 단어 수 * 1.3
  const words = text.split(/\s+/).filter(word => word.length > 0).length;
  return Math.ceil(words * 1.3);
}

/**
 * 텍스트가 토큰 제한을 초과하는지 확인합니다.
 * @param text 확인할 텍스트
 * @param maxTokens 최대 토큰 수 (기본값: 8000)
 * @returns 제한을 초과하면 true
 */
export function isTokenLimitExceeded(text: string, maxTokens: number = 8000): boolean {
  return estimateTokenCount(text) > maxTokens;
}

/**
 * 텍스트를 토큰 제한에 맞게 자릅니다.
 * @param text 자를 텍스트
 * @param maxTokens 최대 토큰 수 (기본값: 8000)
 * @returns 잘린 텍스트
 */
export function truncateToTokenLimit(text: string, maxTokens: number = 8000): string {
  if (!isTokenLimitExceeded(text, maxTokens)) {
    return text;
  }

  // 단어 단위로 자르기
  const words = text.split(/\s+/);
  let truncatedText = '';
  let currentTokens = 0;

  for (const word of words) {
    const wordTokens = estimateTokenCount(word);
    if (currentTokens + wordTokens > maxTokens) {
      break;
    }
    truncatedText += (truncatedText ? ' ' : '') + word;
    currentTokens += wordTokens;
  }

  return truncatedText + (truncatedText.length < text.length ? '...' : '');
}