// __tests__/actions/update-note.test.ts
// updateNote Server Action 테스트
// 인증, 입력 검증, 사용자 스코프, 업데이트 테스트
// 관련 파일: lib/actions/notes.ts

import { updateNote } from '@/lib/actions/notes'
import { createClient } from '@/lib/supabase/server'
import { db } from '@/lib/db'

// Mock Supabase client
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(),
}))

// Mock Drizzle DB
jest.mock('@/lib/db', () => ({
  db: {
    select: jest.fn(),
    update: jest.fn(),
  },
}))

// Mock revalidatePath
jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}))

const mockCreateClient = createClient as jest.MockedFunction<typeof createClient>
const mockDb = db as jest.Mocked<typeof db>

describe('updateNote Server Action', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('로그인하지 않은 사용자는 노트를 수정할 수 없어야 함', async () => {
    mockCreateClient.mockReturnValue({
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: null },
          error: { message: 'Not authenticated' },
        }),
      },
    } as any)

    const result = await updateNote('test-note-id', {
      title: 'New Title',
      content: 'New Content',
    })

    expect(result.success).toBe(false)
    expect(result.error).toBe('로그인이 필요합니다.')
  })

  it('제목이 비어있으면 실패해야 함', async () => {
    mockCreateClient.mockReturnValue({
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: { id: 'test-user-id' } },
          error: null,
        }),
      },
    } as any)

    const result = await updateNote('test-note-id', {
      title: '',
      content: 'Content',
    })

    expect(result.success).toBe(false)
    expect(result.error).toContain('제목')
  })

  it('제목이 100자를 초과하면 실패해야 함', async () => {
    mockCreateClient.mockReturnValue({
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: { id: 'test-user-id' } },
          error: null,
        }),
      },
    } as any)

    const longTitle = 'a'.repeat(101)
    const result = await updateNote('test-note-id', {
      title: longTitle,
      content: 'Content',
    })

    expect(result.success).toBe(false)
    expect(result.error).toContain('100자 이하')
  })

  it('내용이 비어있으면 실패해야 함', async () => {
    mockCreateClient.mockReturnValue({
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: { id: 'test-user-id' } },
          error: null,
        }),
      },
    } as any)

    const result = await updateNote('test-note-id', {
      title: 'Title',
      content: '',
    })

    expect(result.success).toBe(false)
    expect(result.error).toContain('내용')
  })

  it('존재하지 않는 노트는 수정할 수 없어야 함', async () => {
    mockCreateClient.mockReturnValue({
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: { id: 'test-user-id' } },
          error: null,
        }),
      },
    } as any)

    mockDb.select.mockReturnValue({
      from: jest.fn().mockReturnValue({
        where: jest.fn().mockReturnValue({
          limit: jest.fn().mockResolvedValue([]), // 빈 배열
        }),
      }),
    } as any)

    const result = await updateNote('non-existing-id', {
      title: 'Title',
      content: 'Content',
    })

    expect(result.success).toBe(false)
    expect(result.error).toBe('노트를 찾을 수 없습니다.')
  })

  it('다른 사용자의 노트는 수정할 수 없어야 함', async () => {
    mockCreateClient.mockReturnValue({
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: { id: 'current-user-id' } },
          error: null,
        }),
      },
    } as any)

    // WHERE 조건에서 필터링되어 빈 배열 반환
    mockDb.select.mockReturnValue({
      from: jest.fn().mockReturnValue({
        where: jest.fn().mockReturnValue({
          limit: jest.fn().mockResolvedValue([]),
        }),
      }),
    } as any)

    const result = await updateNote('other-user-note-id', {
      title: 'Title',
      content: 'Content',
    })

    expect(result.success).toBe(false)
    expect(result.error).toBe('노트를 찾을 수 없습니다.')
  })

  it('성공적으로 노트를 수정할 수 있어야 함', async () => {
    const mockNote = {
      id: 'test-note-id',
      userId: 'test-user-id',
      title: 'Old Title',
      content: 'Old Content',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    }

    mockCreateClient.mockReturnValue({
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: { id: 'test-user-id' } },
          error: null,
        }),
      },
    } as any)

    mockDb.select.mockReturnValue({
      from: jest.fn().mockReturnValue({
        where: jest.fn().mockReturnValue({
          limit: jest.fn().mockResolvedValue([mockNote]),
        }),
      }),
    } as any)

    mockDb.update.mockReturnValue({
      set: jest.fn().mockReturnValue({
        where: jest.fn().mockResolvedValue(undefined),
      }),
    } as any)

    const result = await updateNote('test-note-id', {
      title: 'Updated Title',
      content: 'Updated Content',
    })

    expect(result.success).toBe(true)
    expect(result.noteId).toBe('test-note-id')
  })

  it('DB 에러 발생 시 실패를 반환해야 함', async () => {
    mockCreateClient.mockReturnValue({
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: { id: 'test-user-id' } },
          error: null,
        }),
      },
    } as any)

    mockDb.select.mockImplementation(() => {
      throw new Error('DB connection failed')
    })

    const result = await updateNote('test-note-id', {
      title: 'Title',
      content: 'Content',
    })

    expect(result.success).toBe(false)
    expect(result.error).toBe('노트 수정에 실패했습니다. 잠시 후 다시 시도해주세요.')
  })
})




