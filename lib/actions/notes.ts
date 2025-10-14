// lib/actions/notes.ts
// 노트 관련 Server Actions
// 노트 생성, 수정, 삭제 등의 서버 측 비즈니스 로직 처리
// 관련 파일: drizzle/schema.ts, lib/db.ts, lib/supabase/server.ts

'use server'

import { db } from '@/lib/db'
import { notes } from '@/drizzle/schema'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

/**
 * 노트 생성 Server Action
 * 로그인한 사용자의 새로운 노트를 생성합니다.
 * 
 * @param data - 노트 제목과 본문
 * @returns 성공 여부, 생성된 노트 ID, 에러 메시지
 */
export async function createNote(data: {
  title: string
  content: string
}): Promise<{ success: boolean; noteId?: string; error?: string }> {
  try {
    // 1. 사용자 인증 확인
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return {
        success: false,
        error: '로그인이 필요합니다',
      }
    }

    // 2. 입력 데이터 유효성 검증
    const { title, content } = data

    if (!title || title.trim().length === 0) {
      return {
        success: false,
        error: '제목을 입력해주세요',
      }
    }

    if (title.length > 200) {
      return {
        success: false,
        error: '제목은 200자 이내로 입력해주세요',
      }
    }

    if (!content || content.trim().length === 0) {
      return {
        success: false,
        error: '내용을 입력해주세요',
      }
    }

    if (content.length > 10000) {
      return {
        success: false,
        error: '내용은 10,000자 이내로 입력해주세요',
      }
    }

    // 3. DrizzleORM insert 쿼리 실행
    const [newNote] = await db.insert(notes).values({
      userId: user.id,
      title: title.trim(),
      content: content.trim(),
    }).returning({ id: notes.id })

    // 4. 노트 목록 페이지 캐시 무효화
    revalidatePath('/notes')

    // 5. 성공 응답 반환
    return {
      success: true,
      noteId: newNote.id,
    }
  } catch (error) {
    // 6. 에러 핸들링
    console.error('노트 생성 중 오류 발생:', error)
    return {
      success: false,
      error: '노트 저장에 실패했습니다. 잠시 후 다시 시도해주세요.',
    }
  }
}

