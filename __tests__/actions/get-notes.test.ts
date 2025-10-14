// __tests__/actions/get-notes.test.ts
// getNotes Server Action 테스트
// 인증, 페이지네이션, 정렬, 사용자 스코프 검증
// 관련 파일: lib/actions/notes.ts

import { getNotes } from '@/lib/actions/notes'
import { db } from '@/lib/db'
import { createClient } from '@/lib/supabase/server'

// Mock dependencies
jest.mock('@/lib/db', () => ({
  db: {
    select: jest.fn(),
  },
}))

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(),
}))

describe('getNotes Server Action', () => {
  const mockDb = db as jest.Mocked<typeof db>
  const mockCreateClient = createClient as jest.MockedFunction<typeof createClient>

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('인증 테스트', () => {
    it('로그인하지 않은 사용자는 노트를 조회할 수 없어야 함', async () => {
      mockCreateClient.mockResolvedValue({
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: null },
            error: null,
          }),
        },
      } as any)

      const result = await getNotes(1)

      expect(result.success).toBe(false)
      expect(result.error).toBe('로그인이 필요합니다.')
      expect(result.notes).toEqual([])
      expect(result.totalCount).toBe(0)
    })

    it('인증 에러 발생 시 실패해야 함', async () => {
      mockCreateClient.mockResolvedValue({
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: null },
            error: { message: 'Auth error' },
          }),
        },
      } as any)

      const result = await getNotes(1)

      expect(result.success).toBe(false)
      expect(result.error).toBe('로그인이 필요합니다.')
    })
  })

  describe('페이지네이션 테스트', () => {
    const mockUser = { id: 'test-user-id', email: 'test@example.com' }
    const mockNotes = Array.from({ length: 20 }, (_, i) => ({
      id: `note-${i}`,
      userId: mockUser.id,
      title: `Note ${i}`,
      content: `Content ${i}`,
      createdAt: new Date(Date.now() - i * 1000),
      updatedAt: new Date(Date.now() - i * 1000),
    }))

    beforeEach(() => {
      mockCreateClient.mockResolvedValue({
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: mockUser },
            error: null,
          }),
        },
      } as any)
    })

    it('페이지 1을 요청하면 처음 20개 노트를 반환해야 함', async () => {
      const mockFrom = jest.fn().mockReturnThis()
      const mockWhere = jest.fn().mockReturnThis()
      const mockOrderBy = jest.fn().mockReturnThis()
      const mockLimit = jest.fn().mockReturnThis()
      const mockOffset = jest.fn().mockResolvedValue(mockNotes)

      mockDb.select.mockReturnValue({
        from: mockFrom,
      } as any)

      mockFrom.mockImplementation((table) => {
        if (table._.name === 'notes') {
          return {
            where: mockWhere,
          }
        }
        return {
          where: jest.fn().mockResolvedValue([{ count: 50 }]),
        }
      })

      mockWhere.mockReturnValue({
        orderBy: mockOrderBy,
      })

      mockOrderBy.mockReturnValue({
        limit: mockLimit,
      })

      mockLimit.mockReturnValue({
        offset: mockOffset,
      })

      const result = await getNotes(1)

      expect(result.success).toBe(true)
      expect(result.currentPage).toBe(1)
      expect(mockLimit).toHaveBeenCalledWith(20)
      expect(mockOffset).toHaveBeenCalledWith(0)
    })

    it('페이지 번호가 1 미만이면 1로 보정해야 함', async () => {
      const mockChain = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        offset: jest.fn().mockResolvedValue([]),
      }

      mockDb.select.mockReturnValue(mockChain as any)

      const result = await getNotes(0)

      expect(result.currentPage).toBe(1)
    })

    it('전체 개수를 기반으로 totalPages를 올바르게 계산해야 함', async () => {
      const mockNotesChain = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        offset: jest.fn().mockResolvedValue(mockNotes),
      }

      const mockCountChain = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockResolvedValue([{ count: 45 }]),
      }

      let callCount = 0
      mockDb.select.mockImplementation((...args) => {
        callCount++
        if (callCount === 1) {
          return mockNotesChain as any
        } else {
          return mockCountChain as any
        }
      })

      const result = await getNotes(1)

      expect(result.totalCount).toBe(45)
      expect(result.totalPages).toBe(3) // Math.ceil(45 / 20) = 3
    })
  })

  describe('정렬 테스트', () => {
    it('노트는 최신순(createdAt DESC)으로 정렬되어야 함', async () => {
      const mockUser = { id: 'test-user-id' }
      mockCreateClient.mockResolvedValue({
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: mockUser },
            error: null,
          }),
        },
      } as any)

      const mockOrderBy = jest.fn().mockReturnThis()
      const mockChain = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnValue({
          orderBy: mockOrderBy,
        }),
        limit: jest.fn().mockReturnThis(),
        offset: jest.fn().mockResolvedValue([]),
      }

      mockDb.select.mockReturnValue(mockChain as any)

      await getNotes(1)

      expect(mockOrderBy).toHaveBeenCalled()
    })
  })

  describe('에러 핸들링 테스트', () => {
    it('DB 에러 발생 시 적절한 에러 메시지를 반환해야 함', async () => {
      mockCreateClient.mockResolvedValue({
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: { id: 'test-user-id' } },
            error: null,
          }),
        },
      } as any)

      mockDb.select.mockImplementation(() => {
        throw new Error('DB Error')
      })

      const result = await getNotes(1)

      expect(result.success).toBe(false)
      expect(result.error).toBe('노트 목록을 불러오는데 실패했습니다.')
    })
  })
})

