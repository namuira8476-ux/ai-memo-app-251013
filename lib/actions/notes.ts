// lib/actions/notes.ts
// 노트 관련 Server Actions
// 노트 생성, 수정, 삭제 등의 서버 측 비즈니스 로직 처리
// 관련 파일: drizzle/schema.ts, lib/db.ts, lib/supabase/server.ts

'use server'

import { db } from '@/lib/db'
import { notes, userProfiles } from '@/drizzle/schema'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { eq, desc, count } from 'drizzle-orm'

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

    // 3. user_profiles에 사용자가 없으면 추가 (자동 생성)
    try {
      await db.insert(userProfiles).values({
        id: user.id,
        onboardingCompleted: false,
      })
    } catch (e) {
      // user_profiles에 이미 존재하는 경우 무시
    }

    // 4. DrizzleORM insert 쿼리 실행
    const [newNote] = await db.insert(notes).values({
      userId: user.id,
      title: title.trim(),
      content: content.trim(),
    }).returning({ id: notes.id })

    // 5. 노트 목록 페이지 캐시 무효화
    revalidatePath('/notes')

    // 6. 성공 응답 반환
    return {
      success: true,
      noteId: newNote.id,
    }
  } catch (error) {
    // 7. 에러 핸들링
    console.error('노트 생성 중 오류 발생:', error)
    return {
      success: false,
      error: '노트 저장에 실패했습니다. 잠시 후 다시 시도해주세요.',
    }
  }
}

/**
 * 노트 목록 조회 Server Action
 * 로그인한 사용자의 노트 목록을 페이지네이션과 함께 조회합니다.
 * 
 * @param page - 조회할 페이지 번호 (기본값: 1)
 * @returns 노트 목록, 페이지네이션 정보, 에러 메시지
 */
export async function getNotes(page: number = 1) {
  try {
    // 1. 사용자 인증 확인
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return {
        success: false,
        error: '로그인이 필요합니다.',
        notes: [],
        totalCount: 0,
        currentPage: 1,
        totalPages: 0,
      }
    }

    // 2. 페이지네이션 계산
    const limit = 20
    const validPage = Math.max(1, Math.floor(page)) // 최소 1, 정수로 변환
    const offset = (validPage - 1) * limit

    // 3. DrizzleORM 쿼리: 노트 목록 + 전체 개수 병렬 실행
    const [notesList, totalCountResult] = await Promise.all([
      db.select()
        .from(notes)
        .where(eq(notes.userId, user.id))
        .orderBy(desc(notes.createdAt))
        .limit(limit)
        .offset(offset),
      
      db.select({ count: count() })
        .from(notes)
        .where(eq(notes.userId, user.id))
    ])

    const totalCount = Number(totalCountResult[0]?.count ?? 0)
    const totalPages = Math.ceil(totalCount / limit)

    return {
      success: true,
      notes: notesList,
      totalCount,
      currentPage: validPage,
      totalPages,
    }
  } catch (error) {
    console.error('노트 목록 조회 중 오류 발생:', error)
    return {
      success: false,
      error: '노트 목록을 불러오는데 실패했습니다.',
      notes: [],
      totalCount: 0,
      currentPage: 1,
      totalPages: 0,
    }
  }
}

