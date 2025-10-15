// __tests__/notes/delete-note-dialog.test.tsx
// DeleteNoteDialog 컴포넌트 테스트
// 노트 삭제 확인 다이얼로그 UI 검증
// 관련 파일: components/notes/delete-note-dialog.tsx

import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DeleteNoteDialog } from '@/components/notes/delete-note-dialog'
import { deleteNote } from '@/lib/actions/notes'
import { useRouter } from 'next/navigation'

// Mock 설정
jest.mock('@/lib/actions/notes', () => ({
  deleteNote: jest.fn(),
}))

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}))

const mockDeleteNote = deleteNote as jest.MockedFunction<typeof deleteNote>
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>

describe('DeleteNoteDialog 컴포넌트', () => {
  const mockRouter = {
    push: jest.fn(),
    refresh: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseRouter.mockReturnValue(mockRouter as any)
  })

  it('삭제하기 버튼이 렌더링된다', () => {
    render(<DeleteNoteDialog noteId="test-id" noteTitle="Test Note" />)
    
    const deleteButton = screen.getByRole('button', { name: /삭제하기/i })
    expect(deleteButton).toBeInTheDocument()
  })

  it('버튼 클릭 시 다이얼로그가 열린다', async () => {
    const user = userEvent.setup()
    render(<DeleteNoteDialog noteId="test-id" noteTitle="Test Note" />)
    
    const deleteButton = screen.getByRole('button', { name: /삭제하기/i })
    await user.click(deleteButton)

    // 다이얼로그 제목 확인
    expect(screen.getByText('노트를 삭제하시겠습니까?')).toBeInTheDocument()
  })

  it('노트 제목이 다이얼로그에 표시된다', async () => {
    const user = userEvent.setup()
    render(<DeleteNoteDialog noteId="test-id" noteTitle="My Important Note" />)
    
    const deleteButton = screen.getByRole('button', { name: /삭제하기/i })
    await user.click(deleteButton)

    expect(screen.getByText('My Important Note')).toBeInTheDocument()
  })

  it('경고 메시지가 표시된다', async () => {
    const user = userEvent.setup()
    render(<DeleteNoteDialog noteId="test-id" noteTitle="Test Note" />)
    
    const deleteButton = screen.getByRole('button', { name: /삭제하기/i })
    await user.click(deleteButton)

    expect(screen.getByText(/이 작업은 되돌릴 수 없습니다/i)).toBeInTheDocument()
  })

  it('취소 버튼 클릭 시 다이얼로그가 닫힌다', async () => {
    const user = userEvent.setup()
    render(<DeleteNoteDialog noteId="test-id" noteTitle="Test Note" />)
    
    // 다이얼로그 열기
    const deleteButton = screen.getByRole('button', { name: /삭제하기/i })
    await user.click(deleteButton)

    // 취소 버튼 클릭
    const cancelButton = screen.getByRole('button', { name: /취소/i })
    await user.click(cancelButton)

    // 다이얼로그 제목이 사라졌는지 확인
    await waitFor(() => {
      expect(screen.queryByText('노트를 삭제하시겠습니까?')).not.toBeInTheDocument()
    })
  })

  it('삭제 버튼 클릭 시 deleteNote가 호출된다', async () => {
    const user = userEvent.setup()
    mockDeleteNote.mockResolvedValue({ success: true })

    render(<DeleteNoteDialog noteId="test-note-id" noteTitle="Test Note" />)
    
    // 다이얼로그 열기
    const deleteButton = screen.getByRole('button', { name: /삭제하기/i })
    await user.click(deleteButton)

    // 다이얼로그 내 삭제 버튼 클릭
    const confirmButton = screen.getByRole('button', { name: /^삭제$/ })
    await user.click(confirmButton)

    expect(mockDeleteNote).toHaveBeenCalledWith('test-note-id')
  })

  it('삭제 중 로딩 상태가 표시된다', async () => {
    const user = userEvent.setup()
    let resolveDelete: (value: any) => void
    const deletePromise = new Promise((resolve) => {
      resolveDelete = resolve
    })
    mockDeleteNote.mockReturnValue(deletePromise as any)

    render(<DeleteNoteDialog noteId="test-id" noteTitle="Test Note" />)
    
    // 다이얼로그 열기
    const deleteButton = screen.getByRole('button', { name: /삭제하기/i })
    await user.click(deleteButton)

    // 삭제 버튼 클릭
    const confirmButton = screen.getByRole('button', { name: /^삭제$/ })
    await user.click(confirmButton)

    // 로딩 상태 확인
    expect(screen.getByRole('button', { name: /삭제 중.../i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /삭제 중.../i })).toBeDisabled()

    // Promise 해결
    resolveDelete!({ success: true })
  })

  it('삭제 성공 시 페이지가 리다이렉트된다', async () => {
    const user = userEvent.setup()
    mockDeleteNote.mockResolvedValue({ success: true })

    render(<DeleteNoteDialog noteId="test-id" noteTitle="Test Note" />)
    
    // 다이얼로그 열기
    const deleteButton = screen.getByRole('button', { name: /삭제하기/i })
    await user.click(deleteButton)

    // 삭제 확인
    const confirmButton = screen.getByRole('button', { name: /^삭제$/ })
    await user.click(confirmButton)

    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith('/notes')
      expect(mockRouter.refresh).toHaveBeenCalled()
    })
  })

  it('삭제 실패 시 에러 메시지가 표시된다', async () => {
    const user = userEvent.setup()
    mockDeleteNote.mockResolvedValue({
      success: false,
      error: '노트를 찾을 수 없습니다.',
    })

    render(<DeleteNoteDialog noteId="test-id" noteTitle="Test Note" />)
    
    // 다이얼로그 열기
    const deleteButton = screen.getByRole('button', { name: /삭제하기/i })
    await user.click(deleteButton)

    // 삭제 시도
    const confirmButton = screen.getByRole('button', { name: /^삭제$/ })
    await user.click(confirmButton)

    // 에러 메시지 확인
    await waitFor(() => {
      expect(screen.getByText('노트를 찾을 수 없습니다.')).toBeInTheDocument()
    })

    // 리다이렉트되지 않음
    expect(mockRouter.push).not.toHaveBeenCalled()
  })
})




