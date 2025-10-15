// lib/actions/notes.ts
// 노트 관련 Server Actions
// 노트 생성, 수정, 삭제 등의 서버 측 비즈니스 로직 처리
// 관련 파일: drizzle/schema.ts, lib/db.ts, lib/supabase/server.ts

'use server'

import { db } from '@/lib/db'
import { notes, userProfiles, summaries } from '@/drizzle/schema'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { eq, desc, asc, count, and } from 'drizzle-orm'
import { generateSummary, generateTags } from '@/lib/ai'
import { logSuccess, logError } from '@/lib/ai/logger'

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
 * 로그인한 사용자의 노트 목록을 페이지네이션 및 정렬과 함께 조회합니다.
 * 
 * @param page - 조회할 페이지 번호 (기본값: 1)
 * @param sortBy - 정렬 옵션 (기본값: 'newest')
 * @returns 노트 목록, 페이지네이션 정보, 에러 메시지
 */
export async function getNotes(
  page: number = 1,
  sortBy: 'newest' | 'oldest' | 'title-asc' | 'title-desc' | 'updated' = 'newest'
) {
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

    // 3. 정렬 옵션에 따른 orderBy 절 설정
    let orderByClause: any[]
    switch (sortBy) {
      case 'oldest':
        orderByClause = [asc(notes.createdAt)]
        break
      case 'title-asc':
        orderByClause = [asc(notes.title), desc(notes.createdAt)]
        break
      case 'title-desc':
        orderByClause = [desc(notes.title), desc(notes.createdAt)]
        break
      case 'updated':
        orderByClause = [desc(notes.updatedAt)]
        break
      case 'newest':
      default:
        orderByClause = [desc(notes.createdAt)]
        break
    }

    // 4. DrizzleORM 쿼리: 노트 목록 + 전체 개수 병렬 실행
    const [notesList, totalCountResult] = await Promise.all([
      db.select()
        .from(notes)
        .where(eq(notes.userId, user.id))
        .orderBy(...orderByClause)
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

/**
 * 노트 상세 조회 Server Action
 * 특정 ID의 노트를 조회합니다 (사용자 스코프 검증 포함)
 * 
 * @param noteId - 조회할 노트 ID
 * @returns 노트 정보 또는 null
 */
export async function getNoteById(noteId: string) {
  try {
    // 1. 사용자 인증 확인
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return {
        success: false,
        error: '로그인이 필요합니다.',
        note: null,
      }
    }

    // 2. DrizzleORM 쿼리: 특정 노트 조회 + 사용자 스코프
    const [note] = await db.select()
      .from(notes)
      .where(and(
        eq(notes.id, noteId),
        eq(notes.userId, user.id)
      ))
      .limit(1)

    if (!note) {
      return {
        success: false,
        error: '노트를 찾을 수 없습니다.',
        note: null,
      }
    }

    // 3. 요약 정보 조회
    const [summary] = await db.select()
      .from(summaries)
      .where(eq(summaries.noteId, noteId))
      .limit(1)

    return {
      success: true,
      note: {
        ...note,
        summary: summary?.content,
        imageUrl: note.imageUrl,
      },
    }
  } catch (error) {
    console.error('노트 조회 중 오류 발생:', error)
    return {
      success: false,
      error: '노트를 불러오는데 실패했습니다.',
      note: null,
    }
  }
}

/**
 * 노트 수정 Server Action
 * 로그인한 사용자의 노트를 수정합니다.
 * 
 * @param noteId - 수정할 노트 ID
 * @param data - 노트 제목과 본문
 * @returns 성공 여부, 에러 메시지
 */
export async function updateNote(noteId: string, data: { title: string; content: string }) {
  try {
    // 1. 사용자 인증 확인
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return {
        success: false,
        error: '로그인이 필요합니다.',
      }
    }

    // 2. 입력 검증
    const title = data.title.trim()
    const content = data.content.trim()

    if (!title || title.length < 1 || title.length > 100) {
      return {
        success: false,
        error: '제목은 1자 이상 100자 이하로 입력해주세요.',
      }
    }

    if (!content || content.length < 1) {
      return {
        success: false,
        error: '내용을 입력해주세요.',
      }
    }

    // 3. 노트 존재 및 권한 확인
    const [existingNote] = await db.select()
      .from(notes)
      .where(and(
        eq(notes.id, noteId),
        eq(notes.userId, user.id)
      ))
      .limit(1)

    if (!existingNote) {
      return {
        success: false,
        error: '노트를 찾을 수 없습니다.',
      }
    }

    // 4. DrizzleORM UPDATE 쿼리 실행
    await db.update(notes)
      .set({
        title,
        content,
        updatedAt: new Date(), // 명시적 업데이트
      })
      .where(eq(notes.id, noteId))

    // 5. 캐시 무효화
    revalidatePath('/notes')
    revalidatePath(`/notes/${noteId}`)

    return {
      success: true,
      noteId,
    }
  } catch (error) {
    console.error('노트 수정 중 오류 발생:', error)
    return {
      success: false,
      error: '노트 수정에 실패했습니다. 잠시 후 다시 시도해주세요.',
    }
  }
}

/**
 * 노트 삭제 Server Action
 * 로그인한 사용자의 노트를 삭제합니다.
 * CASCADE 설정으로 note_tags와 summaries도 함께 삭제됩니다.
 * 
 * @param noteId - 삭제할 노트 ID
 * @returns 성공 여부, 에러 메시지
 */
export async function deleteNote(noteId: string) {
  try {
    // 1. 사용자 인증 확인
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return {
        success: false,
        error: '로그인이 필요합니다.',
      }
    }

    // 2. 노트 존재 및 권한 확인
    const [existingNote] = await db.select()
      .from(notes)
      .where(and(
        eq(notes.id, noteId),
        eq(notes.userId, user.id)
      ))
      .limit(1)

    if (!existingNote) {
      return {
        success: false,
        error: '노트를 찾을 수 없습니다.',
      }
    }

    // 3. DrizzleORM DELETE 쿼리 실행
    // CASCADE 설정으로 note_tags, summaries 자동 삭제
    await db.delete(notes)
      .where(eq(notes.id, noteId))

    // 4. 캐시 무효화
    revalidatePath('/notes')

    return {
      success: true,
    }
  } catch (error) {
    console.error('노트 삭제 중 오류 발생:', error)
    return {
      success: false,
      error: '노트 삭제에 실패했습니다. 잠시 후 다시 시도해주세요.',
    }
  }
}

/**
 * AI 요약 및 태그 재생성 Server Action
 * Gemini API를 사용하여 노트의 요약과 태그를 생성합니다.
 * 
 * @param noteId - AI 처리를 할 노트 ID
 * @returns 성공 여부, 생성된 요약/태그, 에러 메시지
 */
export async function regenerateAI(noteId: string): Promise<{
  success: boolean;
  summary?: string;
  tags?: string[];
  error?: string;
}> {
  const startTime = Date.now();
  
  try {
    // 1. 사용자 인증 확인
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return {
        success: false,
        error: '로그인이 필요합니다.',
      }
    }

    // 2. 노트 존재 및 권한 확인
    const [note] = await db.select()
      .from(notes)
      .where(and(
        eq(notes.id, noteId),
        eq(notes.userId, user.id)
      ))
      .limit(1)

    if (!note) {
      return {
        success: false,
        error: '노트를 찾을 수 없습니다.',
      }
    }

    // 3. 노트 내용 검증
    if (!note.content || note.content.trim().length === 0) {
      return {
        success: false,
        error: '요약할 내용이 없습니다.',
      }
    }

    // 4. AI 요약 및 태그 생성 (병렬 처리)
    const [summaryResult, tagsResult] = await Promise.all([
      generateSummary(note.content),
      generateTags(note.content)
    ])

    // 5. 결과 검증 및 로깅
    const duration = Date.now() - startTime;
    
    if (!summaryResult.success) {
      logError('regenerateAI-summary', summaryResult.error || 'Unknown error', { noteId });
      return {
        success: false,
        error: `요약 생성 실패: ${summaryResult.error}`,
      }
    }

    if (!tagsResult.success) {
      logError('regenerateAI-tags', tagsResult.error || 'Unknown error', { noteId });
      return {
        success: false,
        error: `태그 생성 실패: ${tagsResult.error}`,
      }
    }

    // 6. 성공 로깅
    logSuccess('summarize', duration / 2, summaryResult.summary?.content.length);
    logSuccess('tag', duration / 2, tagsResult.tags?.tags.length);

    // 7. 캐시 무효화
    revalidatePath(`/notes/${noteId}`)
    revalidatePath('/notes')

    // 8. 성공 응답 반환
    return {
      success: true,
      summary: summaryResult.summary?.content,
      tags: tagsResult.tags?.tags,
    }

  } catch (error) {
    const duration = Date.now() - startTime;
    logError('regenerateAI', error, { noteId, duration });
    
    console.error('AI 재생성 중 오류 발생:', error)
    return {
      success: false,
      error: 'AI 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
    }
  }
}

/**
 * 노트 내용 업데이트 Server Action
 * 마크다운 편집기에서 노트 내용을 업데이트합니다.
 *
 * @param noteId - 업데이트할 노트 ID
 * @param content - 새로운 노트 내용
 * @returns 성공 여부, 에러 메시지
 */
export async function updateNoteContent(noteId: string, content: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    // 1. 사용자 인증 확인
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return {
        success: false,
        error: '로그인이 필요합니다.',
      }
    }

    // 2. 노트 존재 및 권한 확인
    const [note] = await db.select()
      .from(notes)
      .where(and(
        eq(notes.id, noteId),
        eq(notes.userId, user.id)
      ))
      .limit(1)

    if (!note) {
      return {
        success: false,
        error: '노트를 찾을 수 없습니다.',
      }
    }

    // 3. 내용 검증
    if (!content || content.trim().length === 0) {
      return {
        success: false,
        error: '내용을 입력해주세요.',
      }
    }

    // 4. 노트 내용 업데이트
    await db.update(notes)
      .set({ 
        content: content.trim(),
        updatedAt: new Date()
      })
      .where(eq(notes.id, noteId))

    // 5. 캐시 무효화
    revalidatePath(`/notes/${noteId}`)
    revalidatePath('/notes')

    return {
      success: true,
    }

  } catch (error) {
    console.error('노트 내용 업데이트 중 오류 발생:', error)
    return {
      success: false,
      error: '노트 업데이트 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
    }
  }
}

/**
 * AI 요약 생성 Server Action
 * Gemini API를 사용하여 노트의 요약을 생성합니다.
 *
 * @param noteId - AI 처리를 할 노트 ID
 * @returns 성공 여부, 생성된 요약, 에러 메시지
 */
export async function generateNoteSummary(noteId: string): Promise<{
  success: boolean;
  summary?: string;
  error?: string;
}> {
  const startTime = Date.now();

  try {
    // 1. 사용자 인증 확인
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return {
        success: false,
        error: '로그인이 필요합니다.',
      }
    }

    // 2. 노트 존재 및 권한 확인
    const [note] = await db.select()
      .from(notes)
      .where(and(
        eq(notes.id, noteId),
        eq(notes.userId, user.id)
      ))
      .limit(1)

    if (!note) {
      return {
        success: false,
        error: '노트를 찾을 수 없습니다.',
      }
    }

    // 3. 노트 내용 검증
    if (!note.content || note.content.trim().length === 0) {
      return {
        success: false,
        error: '요약할 내용이 없습니다.',
      }
    }

    // 4. AI 요약 생성
    const summaryResult = await generateSummary(note.content)

    if (!summaryResult.success) {
      logError('generateNoteSummary', summaryResult.error || 'Unknown error', { noteId });
      return {
        success: false,
        error: `요약 생성 실패: ${summaryResult.error}`,
      }
    }

    const summary = summaryResult.summary?.content || ''

    // 5. 데이터베이스에 요약 저장 (기존 요약이 있으면 업데이트, 없으면 생성)
    try {
      await db.insert(summaries).values({
        noteId: noteId,
        model: summaryResult.summary?.model || 'gemini-2.0-flash-001',
        content: summary,
      })
    } catch (error) {
      // 이미 요약이 있는 경우 업데이트
      await db.update(summaries)
        .set({
          model: summaryResult.summary?.model || 'gemini-2.0-flash-001',
          content: summary,
        })
        .where(eq(summaries.noteId, noteId))
    }

    // 6. 성공 로깅
    const duration = Date.now() - startTime;
    logSuccess('summarize', duration, summary.length);

    // 7. 캐시 무효화
    revalidatePath(`/notes/${noteId}`)
    revalidatePath('/notes')

    // 8. 성공 응답 반환
    return {
      success: true,
      summary: summary,
    }

  } catch (error) {
    const duration = Date.now() - startTime;
    logError('generateNoteSummary', error, { noteId, duration });

    console.error('AI 요약 생성 중 오류 발생:', error)
    return {
      success: false,
      error: 'AI 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
    }
  }
}

