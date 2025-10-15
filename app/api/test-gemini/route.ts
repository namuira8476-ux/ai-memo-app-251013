// app/api/test-gemini/route.ts
// Gemini API 테스트용 API 라우트
// 클라이언트에서 AI 기능을 테스트할 수 있도록 하는 엔드포인트
// 관련 파일: lib/ai/index.ts, app/test-gemini/page.tsx

import { NextRequest, NextResponse } from 'next/server'
import { generateSummary, generateTags } from '@/lib/ai'

export async function POST(request: NextRequest) {
  try {
    console.log('=== API 요청 수신 ===')
    const { action, content } = await request.json()
    console.log('액션:', action)
    console.log('내용 길이:', content?.length || 0)

    if (!content || typeof content !== 'string') {
      console.log('❌ 내용 검증 실패')
      return NextResponse.json({
        success: false,
        error: '텍스트 내용이 필요합니다.'
      })
    }

    switch (action) {
      case 'summarize': {
        console.log('📝 요약 생성 시작')
        const result = await generateSummary(content)
        console.log('요약 결과:', result.success ? '성공' : '실패')
        if (result.success) {
          console.log('✅ 요약 생성 성공')
          return NextResponse.json({
            success: true,
            summary: result.summary?.content || ''
          })
        } else {
          console.log('❌ 요약 생성 실패:', result.error)
          return NextResponse.json(result)
        }
      }

      case 'tags': {
        const result = await generateTags(content)
        if (result.success) {
          return NextResponse.json({
            success: true,
            tags: result.tags?.tags || []
          })
        } else {
          return NextResponse.json(result)
        }
      }

      case 'both': {
        const [summaryResult, tagsResult] = await Promise.all([
          generateSummary(content),
          generateTags(content)
        ])

        if (!summaryResult.success) {
          return NextResponse.json({
            success: false,
            error: `요약 생성 실패: ${summaryResult.error}`
          })
        }

        if (!tagsResult.success) {
          return NextResponse.json({
            success: false,
            error: `태그 생성 실패: ${tagsResult.error}`
          })
        }

        return NextResponse.json({
          success: true,
          summary: summaryResult.summary?.content || '',
          tags: tagsResult.tags?.tags || []
        })
      }

      default:
        return NextResponse.json({
          success: false,
          error: '지원하지 않는 액션입니다. (summarize, tags, both)'
        })
    }

  } catch (error) {
    console.error('Gemini API 테스트 중 오류:', error)
    return NextResponse.json({
      success: false,
      error: '서버 오류가 발생했습니다.'
    })
  }
}
