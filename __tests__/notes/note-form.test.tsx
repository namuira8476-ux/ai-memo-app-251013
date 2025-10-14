// __tests__/notes/note-form.test.tsx
// NoteForm 컴포넌트 테스트
// 폼 렌더링, 유효성 검증, 사용자 인터랙션 테스트
// 관련 파일: components/notes/note-form.tsx

import '@testing-library/jest-dom'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NoteForm } from '@/components/notes/note-form'
import { createNote } from '@/lib/actions/notes'

// Next.js router mock
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}))

// createNote Server Action mock
jest.mock('@/lib/actions/notes', () => ({
  createNote: jest.fn(),
}))

const mockCreateNote = createNote as jest.MockedFunction<typeof createNote>

describe('NoteForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('렌더링 테스트', () => {
    it('create 모드로 폼이 렌더링되어야 함', () => {
      render(<NoteForm mode="create" />)

      expect(screen.getByLabelText('제목')).toBeInTheDocument()
      expect(screen.getByLabelText('내용')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: '취소' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: '노트 생성' })).toBeInTheDocument()
    })

    it('초기 데이터가 있으면 폼에 표시되어야 함', () => {
      const initialData = {
        title: '테스트 제목',
        content: '테스트 내용',
      }

      render(<NoteForm mode="create" initialData={initialData} />)

      expect(screen.getByDisplayValue('테스트 제목')).toBeInTheDocument()
      expect(screen.getByDisplayValue('테스트 내용')).toBeInTheDocument()
    })
  })

  describe('유효성 검증 테스트', () => {
    it('제목이 200자를 초과하면 에러 메시지가 표시되어야 함', async () => {
      const user = userEvent.setup()
      render(<NoteForm mode="create" />)

      const titleInput = screen.getByLabelText('제목')
      const longTitle = 'a'.repeat(201)

      await user.type(titleInput, longTitle)
      await user.tab()

      await waitFor(() => {
        expect(screen.getByText('제목은 200자 이내로 입력해주세요')).toBeInTheDocument()
      })
    })

    it('저장 버튼은 유효하지 않은 폼일 때 비활성화되어야 함', () => {
      render(<NoteForm mode="create" />)

      const submitButton = screen.getByRole('button', { name: '노트 생성' })
      expect(submitButton).toBeDisabled()
    })
  })

  describe('폼 제출 테스트', () => {
    it('유효한 데이터로 폼을 제출하면 createNote가 호출되어야 함', async () => {
      const user = userEvent.setup()
      mockCreateNote.mockResolvedValue({ success: true, noteId: 'test-id' })

      render(<NoteForm mode="create" />)

      const titleInput = screen.getByLabelText('제목')
      const contentInput = screen.getByLabelText('내용')
      const submitButton = screen.getByRole('button', { name: '노트 생성' })

      await user.type(titleInput, '테스트 제목')
      await user.type(contentInput, '테스트 내용')

      await waitFor(() => {
        expect(submitButton).not.toBeDisabled()
      })

      await user.click(submitButton)

      await waitFor(() => {
        expect(mockCreateNote).toHaveBeenCalledWith({
          title: '테스트 제목',
          content: '테스트 내용',
        })
      })
    })

    it('저장 성공 시 성공 메시지가 표시되어야 함', async () => {
      const user = userEvent.setup()
      mockCreateNote.mockResolvedValue({ success: true, noteId: 'test-id' })

      render(<NoteForm mode="create" />)

      await user.type(screen.getByLabelText('제목'), '테스트 제목')
      await user.type(screen.getByLabelText('내용'), '테스트 내용')

      const submitButton = screen.getByRole('button', { name: '노트 생성' })
      await waitFor(() => expect(submitButton).not.toBeDisabled())

      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('노트가 저장되었습니다')).toBeInTheDocument()
      })
    })

    it('저장 실패 시 에러 메시지가 표시되어야 함', async () => {
      const user = userEvent.setup()
      mockCreateNote.mockResolvedValue({ 
        success: false, 
        error: '노트 저장에 실패했습니다' 
      })

      render(<NoteForm mode="create" />)

      await user.type(screen.getByLabelText('제목'), '테스트 제목')
      await user.type(screen.getByLabelText('내용'), '테스트 내용')

      const submitButton = screen.getByRole('button', { name: '노트 생성' })
      await waitFor(() => expect(submitButton).not.toBeDisabled())

      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('노트 저장에 실패했습니다')).toBeInTheDocument()
      })
    })

    it('저장 중에는 버튼이 비활성화되어야 함', async () => {
      const user = userEvent.setup()
      mockCreateNote.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({ success: true }), 100))
      )

      render(<NoteForm mode="create" />)

      await user.type(screen.getByLabelText('제목'), '테스트 제목')
      await user.type(screen.getByLabelText('내용'), '테스트 내용')

      const submitButton = screen.getByRole('button', { name: '노트 생성' })
      await waitFor(() => expect(submitButton).not.toBeDisabled())

      await user.click(submitButton)

      // 저장 중일 때 버튼이 비활성화되고 텍스트가 변경됨
      await waitFor(() => {
        expect(screen.getByRole('button', { name: '저장 중...' })).toBeDisabled()
      })
    })
  })
})

