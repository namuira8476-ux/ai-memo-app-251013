// __tests__/actions/get-note-by-id.test.ts
// getNoteById Server Action 테스트
// 인증, 노트 조회, 사용자 스코프 검증 테스트
// 관련 파일: lib/actions/notes.ts

import { getNoteById } from '@/lib/actions/notes'
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
  },
}))

const mockCreateClient = createClient as jest.MockedFunction<typeof createClient>
const mockDb = db as jest.Mocked<typeof db>

describe('getNoteById Server Action', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('로그인하지 않은 사용자는 노트를 조회할 수 없어야 함', async () => {
    mockCreateClient.mockReturnValue({
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: null },
          error: { message: 'Not authenticated' },
        }),
      },
    } as any)

    const result = await getNoteById('test-note-id')

    expect(result.success).toBe(false)
    expect(result.error).toBe('로그인이 필요합니다.')
    expect(result.note).toBeNull()
  })

  it('존재하는 노트를 조회할 수 있어야 함', async () => {
    const mockNote = {
      id: 'test-note-id',
      userId: 'test-user-id',
      title: '테스트 노트',
      content: '테스트 내용',
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

    const result = await getNoteById('test-note-id')

    expect(result.success).toBe(true)
    expect(result.note).toEqual(mockNote)
    expect(result.note?.id).toBe('test-note-id')
  })

  it('존재하지 않는 노트 조회 시 에러를 반환해야 함', async () => {
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

    const result = await getNoteById('non-existing-id')

    expect(result.success).toBe(false)
    expect(result.error).toBe('노트를 찾을 수 없습니다.')
    expect(result.note).toBeNull()
  })

  it('다른 사용자의 노트는 조회할 수 없어야 함', async () => {
    mockCreateClient.mockReturnValue({
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: { id: 'current-user-id' } },
          error: null,
        }),
      },
    } as any)

    // 다른 사용자의 노트이므로 WHERE 조건에서 필터링되어 빈 배열 반환
    mockDb.select.mockReturnValue({
      from: jest.fn().mockReturnValue({
        where: jest.fn().mockReturnValue({
          limit: jest.fn().mockResolvedValue([]),
        }),
      }),
    } as any)

    const result = await getNoteById('other-user-note-id')

    expect(result.success).toBe(false)
    expect(result.error).toBe('노트를 찾을 수 없습니다.')
    expect(result.note).toBeNull()
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

    const result = await getNoteById('test-note-id')

    expect(result.success).toBe(false)
    expect(result.error).toBe('노트를 불러오는데 실패했습니다.')
    expect(result.note).toBeNull()
  })

  it('유효한 UUID가 아닌 경우도 처리해야 함', async () => {
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
          limit: jest.fn().mockResolvedValue([]),
        }),
      }),
    } as any)

    const result = await getNoteById('invalid-uuid')

    expect(result.success).toBe(false)
    expect(result.note).toBeNull()
  })
})




