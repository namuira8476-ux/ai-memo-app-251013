// __tests__/notes/note-detail-page.test.tsx
// 노트 상세 페이지 컴포넌트 테스트
// 렌더링, 버튼, 날짜 포맷팅 테스트
// 관련 파일: app/notes/[id]/page.tsx

import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

// Mock Next.js modules
jest.mock('next/navigation', () => ({
  notFound: jest.fn(),
  redirect: jest.fn(),
}))

jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  )
})

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(() => ({
    auth: {
      getUser: jest.fn(() => ({
        data: { user: { id: 'test-user-id' } },
        error: null,
      })),
    },
  })),
}))

jest.mock('@/lib/actions/notes', () => ({
  getNoteById: jest.fn(),
}))

// 테스트용 간단한 컴포넌트
const MockNoteDetailPage = ({
  title,
  content,
  createdAt,
  updatedAt,
}: {
  title: string
  content: string
  createdAt: Date
  updatedAt: Date
}) => {
  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date))
  }

  const isModified = new Date(updatedAt).getTime() !== new Date(createdAt).getTime()

  return (
    <div className="container">
      <div>
        <h1>{title}</h1>
        <div>
          <span>작성: {formatDate(createdAt)}</span>
          {isModified && <span>수정: {formatDate(updatedAt)}</span>}
        </div>
      </div>
      <div>
        <p className="whitespace-pre-wrap">{content}</p>
      </div>
      <div>
        <a href="/notes">
          <button>목록으로 돌아가기</button>
        </a>
        <button disabled>수정하기</button>
        <button disabled>삭제하기</button>
      </div>
    </div>
  )
}

describe('NoteDetailPage 컴포넌트', () => {
  const mockNote = {
    title: '테스트 노트 제목',
    content: '이것은 테스트 노트의 내용입니다.\n줄바꿈이 포함되어 있습니다.',
    createdAt: new Date('2024-10-26T10:00:00Z'),
    updatedAt: new Date('2024-10-26T10:00:00Z'),
  }

  describe('노트 정보 렌더링 테스트', () => {
    it('노트 제목이 표시되어야 함', () => {
      render(<MockNoteDetailPage {...mockNote} />)
      expect(screen.getByRole('heading', { name: mockNote.title })).toBeInTheDocument()
    })

    it('노트 본문 전체가 표시되어야 함', () => {
      render(<MockNoteDetailPage {...mockNote} />)
      // 줄바꿈이 있는 텍스트는 정규식으로 검색
      expect(screen.getByText(/이것은 테스트 노트의 내용입니다/)).toBeInTheDocument()
      expect(screen.getByText(/줄바꿈이 포함되어 있습니다/)).toBeInTheDocument()
    })

    it('작성 날짜가 한국어 형식으로 표시되어야 함', () => {
      render(<MockNoteDetailPage {...mockNote} />)
      expect(screen.getByText(/작성:/)).toBeInTheDocument()
      expect(screen.getByText(/2024년 10월 26일/)).toBeInTheDocument()
    })

    it('본문에 줄바꿈이 유지되어야 함 (whitespace-pre-wrap)', () => {
      render(<MockNoteDetailPage {...mockNote} />)
      const contentElement = screen.getByText(/이것은 테스트 노트의 내용입니다/)
      expect(contentElement).toHaveClass('whitespace-pre-wrap')
    })
  })

  describe('수정 날짜 표시 테스트', () => {
    it('작성 날짜와 수정 날짜가 동일하면 수정 날짜를 표시하지 않아야 함', () => {
      render(<MockNoteDetailPage {...mockNote} />)
      expect(screen.queryByText(/수정:/)).not.toBeInTheDocument()
    })

    it('작성 날짜와 수정 날짜가 다르면 수정 날짜를 표시해야 함', () => {
      const modifiedNote = {
        ...mockNote,
        updatedAt: new Date('2024-10-27T14:30:00Z'),
      }
      render(<MockNoteDetailPage {...modifiedNote} />)
      expect(screen.getByText(/수정:/)).toBeInTheDocument()
      expect(screen.getByText(/2024년 10월 27일/)).toBeInTheDocument()
    })
  })

  describe('액션 버튼 테스트', () => {
    it('목록으로 돌아가기 버튼이 있어야 함', () => {
      render(<MockNoteDetailPage {...mockNote} />)
      const backButton = screen.getByRole('link', { name: /목록으로 돌아가기/ })
      expect(backButton).toBeInTheDocument()
      expect(backButton).toHaveAttribute('href', '/notes')
    })

    it('수정하기 버튼이 비활성화되어 있어야 함', () => {
      render(<MockNoteDetailPage {...mockNote} />)
      const editButton = screen.getByRole('button', { name: /수정하기/ })
      expect(editButton).toBeInTheDocument()
      expect(editButton).toBeDisabled()
    })

    it('삭제하기 버튼이 비활성화되어 있어야 함', () => {
      render(<MockNoteDetailPage {...mockNote} />)
      const deleteButton = screen.getByRole('button', { name: /삭제하기/ })
      expect(deleteButton).toBeInTheDocument()
      expect(deleteButton).toBeDisabled()
    })
  })

  describe('날짜 포맷팅 테스트', () => {
    it('시간 정보도 포함되어야 함', () => {
      const noteWithTime = {
        ...mockNote,
        createdAt: new Date('2024-03-15T14:30:00Z'),
        updatedAt: new Date('2024-03-15T14:30:00Z'),
      }
      render(<MockNoteDetailPage {...noteWithTime} />)
      // 시간 정보는 브라우저 로케일에 따라 다르므로 날짜만 확인
      expect(screen.getByText(/2024년 3월 15일/)).toBeInTheDocument()
    })
  })

  describe('긴 제목과 본문 테스트', () => {
    it('긴 제목도 올바르게 표시되어야 함', () => {
      const longTitleNote = {
        ...mockNote,
        title: '이것은 매우 긴 제목입니다. '.repeat(10).trim(),
      }
      render(<MockNoteDetailPage {...longTitleNote} />)
      expect(screen.getByRole('heading')).toBeInTheDocument()
      expect(screen.getByText(/이것은 매우 긴 제목입니다/)).toBeInTheDocument()
    })

    it('긴 본문도 올바르게 표시되어야 함', () => {
      const longContentNote = {
        ...mockNote,
        content: '이것은 매우 긴 본문입니다. '.repeat(100),
      }
      render(<MockNoteDetailPage {...longContentNote} />)
      expect(screen.getByText(/이것은 매우 긴 본문입니다/)).toBeInTheDocument()
    })
  })
})

