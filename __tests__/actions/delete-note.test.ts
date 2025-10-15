// __tests__/actions/delete-note.test.ts
// deleteNote Server Action 테스트
// 노트 삭제 로직 검증
// 관련 파일: lib/actions/notes.ts

import { deleteNote } from '@/lib/actions/notes'
import { createClient } from '@/lib/supabase/server'
import { db } from '@/lib/db'

// Mock 설정
jest.mock('@/lib/supabase/server')
jest.mock('@/lib/db', () => ({
  db: {
    select: jest.fn(),
    delete: jest.fn(),
  },
}))
jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}))

const mockCreateClient = createClient as jest.MockedFunction<typeof createClient>
const mockDb = db as jest.Mocked<typeof db>

describe('deleteNote Server Action', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('인증되지 않은 사용자는 노트를 삭제할 수 없다', async () => {
    // Mock 인증 실패
    mockCreateClient.mockResolvedValue({
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: null },
          error: new Error('Not authenticated'),
        }),
      },
    } as any)

    const result = await deleteNote('test-note-id')

    expect(result.success).toBe(false)
    expect(result.error).toBe('로그인이 필요합니다.')
  })

  it('존재하지 않는 노트 삭제 시도 시 에러를 반환한다', async () => {
    const mockUser = { id: 'user-123' }

    // Mock 인증 성공
    mockCreateClient.mockResolvedValue({
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: mockUser },
          error: null,
        }),
      },
    } as any)

    // Mock 노트 조회 - 노트 없음 (체이닝 방식)
    const mockLimit = jest.fn().mockResolvedValue([])
    const mockWhere = jest.fn().mockReturnValue({ limit: mockLimit })
    const mockFrom = jest.fn().mockReturnValue({ where: mockWhere })
    mockDb.select.mockReturnValue({ from: mockFrom } as any)

    const result = await deleteNote('non-existent-id')

    expect(result.success).toBe(false)
    expect(result.error).toBe('노트를 찾을 수 없습니다.')
  })

  it('다른 사용자의 노트는 삭제할 수 없다', async () => {
    const mockUser = { id: 'user-123' }

    // Mock 인증 성공
    mockCreateClient.mockResolvedValue({
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: mockUser },
          error: null,
        }),
      },
    } as any)

    // Mock 노트 조회 - 사용자 스코프 검증으로 인해 빈 배열 반환
    const mockLimit = jest.fn().mockResolvedValue([])
    const mockWhere = jest.fn().mockReturnValue({ limit: mockLimit })
    const mockFrom = jest.fn().mockReturnValue({ where: mockWhere })
    mockDb.select.mockReturnValue({ from: mockFrom } as any)

    const result = await deleteNote('note-456')

    expect(result.success).toBe(false)
    expect(result.error).toBe('노트를 찾을 수 없습니다.')
  })

  it('성공적으로 노트를 삭제한다', async () => {
    const mockUser = { id: 'user-123' }
    const mockNote = {
      id: 'note-456',
      userId: 'user-123',
      title: 'Test Note',
      content: 'Test Content',
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    // Mock 인증 성공
    mockCreateClient.mockResolvedValue({
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: mockUser },
          error: null,
        }),
      },
    } as any)

    // Mock 노트 조회 성공
    const mockLimit = jest.fn().mockResolvedValue([mockNote])
    const mockWhere = jest.fn().mockReturnValue({ limit: mockLimit })
    const mockFrom = jest.fn().mockReturnValue({ where: mockWhere })
    mockDb.select.mockReturnValue({ from: mockFrom } as any)

    // Mock 노트 삭제
    const mockDeleteWhere = jest.fn().mockResolvedValue(undefined)
    mockDb.delete.mockReturnValue({ where: mockDeleteWhere } as any)

    const result = await deleteNote('note-456')

    expect(result.success).toBe(true)
    expect(result.error).toBeUndefined()
  })

  it('revalidatePath가 호출된다', async () => {
    const { revalidatePath } = require('next/cache')
    const mockUser = { id: 'user-123' }
    const mockNote = {
      id: 'note-456',
      userId: 'user-123',
      title: 'Test Note',
      content: 'Test Content',
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    // Mock 인증 성공
    mockCreateClient.mockResolvedValue({
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: mockUser },
          error: null,
        }),
      },
    } as any)

    // Mock 노트 조회 성공
    const mockLimit = jest.fn().mockResolvedValue([mockNote])
    const mockWhere = jest.fn().mockReturnValue({ limit: mockLimit })
    const mockFrom = jest.fn().mockReturnValue({ where: mockWhere })
    mockDb.select.mockReturnValue({ from: mockFrom } as any)

    // Mock 노트 삭제
    const mockDeleteWhere = jest.fn().mockResolvedValue(undefined)
    mockDb.delete.mockReturnValue({ where: mockDeleteWhere } as any)

    await deleteNote('note-456')

    expect(revalidatePath).toHaveBeenCalledWith('/notes')
  })

  it('DB 에러 발생 시 적절한 에러 메시지를 반환한다', async () => {
    const mockUser = { id: 'user-123' }

    // Mock 인증 성공
    mockCreateClient.mockResolvedValue({
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: mockUser },
          error: null,
        }),
      },
    } as any)

    // Mock DB 에러
    const mockLimit = jest.fn().mockRejectedValue(new Error('Database error'))
    const mockWhere = jest.fn().mockReturnValue({ limit: mockLimit })
    const mockFrom = jest.fn().mockReturnValue({ where: mockWhere })
    mockDb.select.mockReturnValue({ from: mockFrom } as any)

    const result = await deleteNote('note-456')

    expect(result.success).toBe(false)
    expect(result.error).toBe('노트 삭제에 실패했습니다. 잠시 후 다시 시도해주세요.')
  })
})
