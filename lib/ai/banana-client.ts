// lib/ai/gemini-image-client.ts
// Gemini 2.5 Flash Image API 클라이언트
// Google의 Gemini 모델을 사용한 이미지 생성 기능
// 관련 파일: lib/ai/config.ts, lib/ai/logger.ts

import { logSuccess, logError } from './logger'

export interface ImageGenerationResponse {
  success: boolean
  imageUrl?: string
  error?: string
  model: string
  createdAt: Date
}

/**
 * Gemini API 키 존재 여부를 검증합니다.
 */
export function hasGeminiApiKey(): boolean {
  return !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here'
}

/**
 * Gemini API 키를 안전하게 가져옵니다.
 */
export function getGeminiApiKey(): string | null {
  if (!hasGeminiApiKey()) {
    return null
  }
  return process.env.GEMINI_API_KEY || null
}

/**
 * 텍스트 프롬프트를 기반으로 이미지를 생성합니다.
 * @param prompt 이미지 생성용 텍스트 프롬프트
 * @returns 생성된 이미지 URL 또는 에러
 */
export async function generateImageFromPrompt(prompt: string): Promise<ImageGenerationResponse> {
  const startTime = Date.now()

  try {
    // Gemini API 키 검증
    const geminiApiKey = process.env.GEMINI_API_KEY
    if (!geminiApiKey || geminiApiKey === 'your_gemini_api_key_here') {
      console.warn('개발 환경: Gemini API 키가 설정되지 않아 더미 이미지를 반환합니다.')
      return {
        success: true,
        imageUrl: 'https://picsum.photos/600/400?random=1',
        model: 'dev-fallback',
        createdAt: new Date()
      }
    }

    // 입력 검증
    if (!prompt || prompt.trim().length === 0) {
      throw new Error('이미지 생성 프롬프트가 필요합니다.')
    }

    // 프롬프트 최적화
    const optimizedPrompt = optimizeImagePrompt(prompt)

    // Gemini 2.5 Flash Image API 호출
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent', {
      method: 'POST',
      headers: {
        'x-goog-api-key': geminiApiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: optimizedPrompt }
          ]
        }]
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Gemini API 호출 실패: ${response.status} ${response.statusText} - ${errorText}`)
    }

    const data = await response.json()
    
    // Gemini API 응답에서 이미지 데이터 추출
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts) {
      throw new Error('API 응답에서 이미지 데이터를 찾을 수 없습니다.')
    }

    const imagePart = data.candidates[0].content.parts.find((part: { inlineData?: { data: string; mimeType: string } }) => part.inlineData)
    if (!imagePart || !imagePart.inlineData) {
      throw new Error('API 응답에서 이미지 데이터를 찾을 수 없습니다.')
    }

    // Base64 이미지 데이터를 Data URL로 변환
    const imageData = imagePart.inlineData.data
    const mimeType = imagePart.inlineData.mimeType || 'image/png'
    const imageUrl = `data:${mimeType};base64,${imageData}`

    const duration = Date.now() - startTime
    logSuccess('summarize', duration, 1)

    return {
      success: true,
      imageUrl: imageUrl,
      model: 'gemini-2.5-flash-image',
      createdAt: new Date()
    }

  } catch (error) {
    const duration = Date.now() - startTime
    logError('gemini-image-generation', error instanceof Error ? error.message : 'Unknown error', { prompt, duration })

    return {
      success: false,
      error: error instanceof Error ? error.message : '이미지 생성 중 알 수 없는 오류가 발생했습니다.',
      model: 'gemini-2.5-flash-image',
      createdAt: new Date()
    }
  }
}

/**
 * 이미지 생성 프롬프트를 최적화합니다.
 * @param prompt 원본 프롬프트
 * @returns 최적화된 프롬프트
 */
function optimizeImagePrompt(prompt: string): string {
  // 기본 키워드 추가
  const baseKeywords = 'high quality, detailed, professional, beautiful'
  
  // 프롬프트 길이 제한 (Banana API 제한)
  const maxLength = 200
  let optimizedPrompt = `${prompt}, ${baseKeywords}`
  
  if (optimizedPrompt.length > maxLength) {
    optimizedPrompt = optimizedPrompt.substring(0, maxLength - 3) + '...'
  }

  return optimizedPrompt
}

// 이미지 품질 검증 함수 (현재 사용하지 않음)
// async function validateImageQuality(imageUrl: string): Promise<boolean> {
//   return true
// }

/**
 * 요약 텍스트를 기반으로 이미지 생성 프롬프트를 생성합니다.
 * @param summary 요약 텍스트
 * @returns 이미지 생성 프롬프트
 */
export function createImagePromptFromSummary(summary: string): string {
  if (!summary || summary.trim().length === 0) {
    return 'abstract, modern, minimalist design'
  }

  // 요약에서 키워드 추출
  const keywords = extractKeywordsFromSummary(summary)
  
  // 프롬프트 생성
  const prompt = keywords.length > 0 
    ? keywords.join(', ')
    : 'abstract, modern, minimalist design'

  return prompt
}

/**
 * 요약 텍스트에서 이미지 생성에 유용한 키워드를 추출합니다.
 * @param summary 요약 텍스트
 * @returns 추출된 키워드 배열
 */
function extractKeywordsFromSummary(summary: string): string[] {
  // 일반적인 명사와 형용사 추출
  const words = summary.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2)

  // 이미지 생성에 유용한 키워드 필터링
  const usefulKeywords = words.filter(word => 
    !['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'].includes(word)
  )

  // 상위 5개 키워드 반환
  return usefulKeywords.slice(0, 5)
}

