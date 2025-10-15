// __tests__/notes/note-edit-form.test.tsx
// NoteEditForm 컴포넌트 테스트
// 폼 렌더링, 입력 변경, 제출, 취소 버튼 테스트
// 관련 파일: components/notes/note-edit-form.tsx

import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NoteEditForm } from '@/components/notes/note-edit-form'
import { updateNote } from '@/lib/actions/notes'
import { useRouter } from 'next/navigation'
import '@testing-library/jest-dom'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}))

// Mock updateNote action
jest.mock('@/lib/actions/notes', () => ({
  updateNote: jest.fn(),
}))

const mockPush = jest.fn()
const mockRefresh = jest.fn()
const mockUpdateNote = updateNote as jest.MockedFunction<typeof updateNote>

describe('NoteEditForm 컴포넌트', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
      refresh: mockRefresh,
    })
  })

  describe('폼 렌더링 테스트', () => {
    it('초기값이 폼에 표시되어야 함', () => {
      render(
        <NoteEditForm
          noteId="test-id"
          initialData={{ title: '테스트 제목', content: '테스트 내용' }}
        />
      )

      expect(screen.getByLabelText('제목')).toHaveValue('테스트 제목')
      expect(screen.getByLabelText('내용')).toHaveValue('테스트 내용')
    })

    it('모든 필수 요소가 렌더링되어야 함', () => {
      render(
        <NoteEditForm
          noteId="test-id"
          initialData={{ title: 'Title', content: 'Content' }}
        />
      )

      expect(screen.getByLabelText('제목')).toBeInTheDocument()
      expect(screen.getByLabelText('내용')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: '취소' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: '저장' })).toBeInTheDocument()
    })
  })

  describe('저장 버튼 활성화 테스트', () => {
    it('초기 상태에서 저장 버튼이 비활성화되어야 함', () => {
      render(
        <NoteEditForm
          noteId="test-id"
          initialData={{ title: 'Title', content: 'Content' }}
        />
      )

      const saveButton = screen.getByRole('button', { name: '저장' })
      expect(saveButton).toBeDisabled()
    })

    it('제목 변경 시 저장 버튼이 활성화되어야 함', async () => {
      const user = userEvent.setup()
      render(
        <NoteEditForm
          noteId="test-id"
          initialData={{ title: 'Title', content: 'Content' }}
        />
      )

      const titleInput = screen.getByLabelText('제목')
      const saveButton = screen.getByRole('button', { name: '저장' })

      await user.clear(titleInput)
      await user.type(titleInput, 'Updated Title')

      await waitFor(() => {
        expect(saveButton).not.toBeDisabled()
      })
    })

    it('내용 변경 시 저장 버튼이 활성화되어야 함', async () => {
      const user = userEvent.setup()
      render(
        <NoteEditForm
          noteId="test-id"
          initialData={{ title: 'Title', content: 'Content' }}
        />
      )

      const contentInput = screen.getByLabelText('내용')
      const saveButton = screen.getByRole('button', { name: '저장' })

      await user.clear(contentInput)
      await user.type(contentInput, 'Updated Content')

      await waitFor(() => {
        expect(saveButton).not.toBeDisabled()
      })
    })
  })

  describe('폼 제출 테스트', () => {
    it('성공적으로 제출하면 상세 페이지로 이동해야 함', async () => {
      const user = userEvent.setup()
      mockUpdateNote.mockResolvedValue({
        success: true,
        noteId: 'test-id',
      })

      render(
        <NoteEditForm
          noteId="test-id"
          initialData={{ title: 'Title', content: 'Content' }}
        />
      )

      const titleInput = screen.getByLabelText('제목')
      await user.clear(titleInput)
      await user.type(titleInput, 'Updated Title')

      const saveButton = screen.getByRole('button', { name: '저장' })
      await user.click(saveButton)

      await waitFor(() => {
        expect(mockUpdateNote).toHaveBeenCalledWith('test-id', {
          title: 'Updated Title',
          content: 'Content',
        })
        expect(mockPush).toHaveBeenCalledWith('/notes/test-id')
        expect(mockRefresh).toHaveBeenCalled()
      })
    })

    it('제출 실패 시 에러 메시지를 표시해야 함', async () => {
      const user = userEvent.setup()
      mockUpdateNote.mockResolvedValue({
        success: false,
        error: '노트 수정에 실패했습니다.',
      })

      render(
        <NoteEditForm
          noteId="test-id"
          initialData={{ title: 'Title', content: 'Content' }}
        />
      )

      const titleInput = screen.getByLabelText('제목')
      await user.clear(titleInput)
      await user.type(titleInput, 'Updated Title')

      const saveButton = screen.getByRole('button', { name: '저장' })
      await user.click(saveButton)

      await waitFor(() => {
        expect(screen.getByText('노트 수정에 실패했습니다.')).toBeInTheDocument()
      })
    })
  })

  describe('취소 버튼 테스트', () => {
    it('취소 버튼 클릭 시 상세 페이지로 이동해야 함', async () => {
      const user = userEvent.setup()
      render(
        <NoteEditForm
          noteId="test-id"
          initialData={{ title: 'Title', content: 'Content' }}
        />
      )

      const cancelButton = screen.getByRole('button', { name: '취소' })
      await user.click(cancelButton)

      expect(mockPush).toHaveBeenCalledWith('/notes/test-id')
    })

    it('제출 중에는 취소 버튼이 비활성화되어야 함', async () => {
      const user = userEvent.setup()
      mockUpdateNote.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({ success: true, noteId: 'test-id' }), 1000))
      )

      render(
        <NoteEditForm
          noteId="test-id"
          initialData={{ title: 'Title', content: 'Content' }}
        />
      )

      const titleInput = screen.getByLabelText('제목')
      await user.clear(titleInput)
      await user.type(titleInput, 'Updated Title')

      const saveButton = screen.getByRole('button', { name: '저장' })
      await user.click(saveButton)

      const cancelButton = screen.getByRole('button', { name: '취소' })
      expect(cancelButton).toBeDisabled()
    })
  })

  describe('검증 테스트', () => {
    it('제목이 비어있으면 검증 오류를 표시해야 함', async () => {
      const user = userEvent.setup()
      render(
        <NoteEditForm
          noteId="test-id"
          initialData={{ title: 'Title', content: 'Content' }}
        />
      )

      const titleInput = screen.getByLabelText('제목')
      await user.clear(titleInput)

      const saveButton = screen.getByRole('button', { name: '저장' })
      await user.click(saveButton)

      await waitFor(() => {
        expect(screen.getByText('제목을 입력해주세요')).toBeInTheDocument()
      })
    })

    it('내용이 비어있으면 검증 오류를 표시해야 함', async () => {
      const user = userEvent.setup()
      render(
        <NoteEditForm
          noteId="test-id"
          initialData={{ title: 'Title', content: 'Content' }}
        />
      )

      const contentInput = screen.getByLabelText('내용')
      await user.clear(contentInput)

      const saveButton = screen.getByRole('button', { name: '저장' })
      await user.click(saveButton)

      await waitFor(() => {
        expect(screen.getByText('내용을 입력해주세요')).toBeInTheDocument()
      })
    })
  })
})






