// __tests__/actions/create-note.test.ts
// createNote Server Action 단위 테스트
// 인증, 유효성 검증, DB 삽입 로직 테스트
// 관련 파일: lib/actions/notes.ts

import { createNote } from '@/lib/actions/notes'
import { db } from '@/lib/db'
import { createClient } from '@/lib/supabase/server'

// Supabase mock
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(),
}))

// DrizzleORM mock
jest.mock('@/lib/db', () => ({
  db: {
    insert: jest.fn(),
  },
}))

// revalidatePath mock
jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}))

const mockCreateClient = createClient as jest.MockedFunction<typeof createClient>
const mockDb = db as jest.Mocked<typeof db>

describe('createNote Server Action', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('인증 테스트', () => {
    it('로그인하지 않은 사용자는 노트를 생성할 수 없어야 함', async () => {
      mockCreateClient.mockResolvedValue({
        auth: {
          getUser: jest.fn().mockResolvedValue({ 
            data: { user: null }, 
            error: null 
          }),
        },
      } as any)

      const result = await createNote({
        title: '테스트 제목',
        content: '테스트 내용',
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('로그인이 필요합니다')
    })

    it('인증 에러가 발생하면 실패해야 함', async () => {
      mockCreateClient.mockResolvedValue({
        auth: {
          getUser: jest.fn().mockResolvedValue({ 
            data: { user: null }, 
            error: { message: 'Auth error' } 
          }),
        },
      } as any)

      const result = await createNote({
        title: '테스트 제목',
        content: '테스트 내용',
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('로그인이 필요합니다')
    })
  })

  describe('유효성 검증 테스트', () => {
    beforeEach(() => {
      // 기본적으로 인증된 사용자로 설정
      mockCreateClient.mockResolvedValue({
        auth: {
          getUser: jest.fn().mockResolvedValue({ 
            data: { user: { id: 'test-user-id' } }, 
            error: null 
          }),
        },
      } as any)
    })

    it('빈 제목으로는 노트를 생성할 수 없어야 함', async () => {
      const result = await createNote({
        title: '',
        content: '테스트 내용',
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('제목을 입력해주세요')
    })

    it('공백만 있는 제목으로는 노트를 생성할 수 없어야 함', async () => {
      const result = await createNote({
        title: '   ',
        content: '테스트 내용',
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('제목을 입력해주세요')
    })

    it('200자를 초과하는 제목으로는 노트를 생성할 수 없어야 함', async () => {
      const longTitle = 'a'.repeat(201)
      
      const result = await createNote({
        title: longTitle,
        content: '테스트 내용',
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('제목은 200자 이내로 입력해주세요')
    })

    it('빈 내용으로는 노트를 생성할 수 없어야 함', async () => {
      const result = await createNote({
        title: '테스트 제목',
        content: '',
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('내용을 입력해주세요')
    })

    it('10,000자를 초과하는 내용으로는 노트를 생성할 수 없어야 함', async () => {
      const longContent = 'a'.repeat(10001)
      
      const result = await createNote({
        title: '테스트 제목',
        content: longContent,
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('내용은 10,000자 이내로 입력해주세요')
    })
  })

  describe('노트 생성 테스트', () => {
    beforeEach(() => {
      mockCreateClient.mockResolvedValue({
        auth: {
          getUser: jest.fn().mockResolvedValue({ 
            data: { user: { id: 'test-user-id' } }, 
            error: null 
          }),
        },
      } as any)
    })

    it('유효한 데이터로 노트가 생성되어야 함', async () => {
      const mockInsert = {
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([{ id: 'new-note-id' }]),
        }),
      }
      mockDb.insert.mockReturnValue(mockInsert as any)

      const result = await createNote({
        title: '테스트 제목',
        content: '테스트 내용',
      })

      expect(result.success).toBe(true)
      expect(result.noteId).toBe('new-note-id')
      expect(mockDb.insert).toHaveBeenCalled()
    })

    it('제목과 내용의 앞뒤 공백이 제거되어야 함', async () => {
      const mockValues = jest.fn().mockReturnValue({
        returning: jest.fn().mockResolvedValue([{ id: 'new-note-id' }]),
      })
      const mockInsert = {
        values: mockValues,
      }
      mockDb.insert.mockReturnValue(mockInsert as any)

      await createNote({
        title: '  테스트 제목  ',
        content: '  테스트 내용  ',
      })

      expect(mockValues).toHaveBeenCalledWith({
        userId: 'test-user-id',
        title: '테스트 제목',
        content: '테스트 내용',
      })
    })

    it('DB 에러 발생 시 에러 메시지를 반환해야 함', async () => {
      mockDb.insert.mockImplementation(() => {
        throw new Error('DB Error')
      })

      const result = await createNote({
        title: '테스트 제목',
        content: '테스트 내용',
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('노트 저장에 실패했습니다. 잠시 후 다시 시도해주세요.')
    })
  })
})

