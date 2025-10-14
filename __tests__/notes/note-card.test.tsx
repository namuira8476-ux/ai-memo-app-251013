// __tests__/notes/note-card.test.tsx
// NoteCard 컴포넌트 테스트
// 렌더링, 본문 150자 제한, 날짜 포맷팅 검증
// 관련 파일: components/notes/note-card.tsx

import { render, screen } from '@testing-library/react'
import { NoteCard } from '@/components/notes/note-card'

// Mock next/link
jest.mock('next/link', () => {
  return function MockLink({ children, href }: any) {
    return <a href={href}>{children}</a>
  }
})

describe('NoteCard 컴포넌트', () => {
  const mockNote = {
    id: 'test-note-id',
    title: '테스트 노트 제목',
    content: '테스트 노트 내용입니다.',
    createdAt: new Date('2024-10-14T12:00:00.000Z'),
  }

  describe('렌더링 테스트', () => {
    it('노트 제목이 표시되어야 함', () => {
      render(<NoteCard {...mockNote} />)
      expect(screen.getByText('테스트 노트 제목')).toBeInTheDocument()
    })

    it('노트 내용이 표시되어야 함', () => {
      render(<NoteCard {...mockNote} />)
      expect(screen.getByText('테스트 노트 내용입니다.')).toBeInTheDocument()
    })

    it('작성 날짜가 한국어 형식으로 표시되어야 함', () => {
      render(<NoteCard {...mockNote} />)
      // "2024년 10월 14일" 형식으로 표시됨
      const dateElement = screen.getByText(/2024년/)
      expect(dateElement).toBeInTheDocument()
    })

    it('노트 상세 페이지로 가는 링크가 있어야 함', () => {
      const { container } = render(<NoteCard {...mockNote} />)
      const link = container.querySelector('a[href="/notes/test-note-id"]')
      expect(link).toBeInTheDocument()
    })
  })

  describe('본문 미리보기 테스트', () => {
    it('150자 이하 내용은 전체가 표시되어야 함', () => {
      const shortContent = '짧은 내용'
      render(<NoteCard {...mockNote} content={shortContent} />)
      expect(screen.getByText('짧은 내용')).toBeInTheDocument()
    })

    it('150자를 초과하는 내용은 150자까지만 표시하고 ... 추가해야 함', () => {
      const longContent = 'a'.repeat(200)
      render(<NoteCard {...mockNote} content={longContent} />)
      
      const displayedText = screen.getByText(/^a+\.\.\.$/)
      expect(displayedText.textContent).toHaveLength(153) // 150자 + '...'
    })
  })

  describe('날짜 포맷팅 테스트', () => {
    it('Date 객체를 올바르게 포맷팅해야 함', () => {
      const date = new Date('2024-01-15T09:30:00.000Z')
      render(<NoteCard {...mockNote} createdAt={date} />)
      
      // 한국 시간대로 표시됨
      const dateText = screen.getByText(/2024년/)
      expect(dateText).toBeInTheDocument()
    })

    it('문자열 날짜도 올바르게 포맷팅해야 함', () => {
      const dateString = '2024-03-20T15:45:00.000Z'
      render(<NoteCard {...mockNote} createdAt={dateString} />)
      
      const dateText = screen.getByText(/2024년/)
      expect(dateText).toBeInTheDocument()
    })
  })

  describe('스타일링 테스트', () => {
    it('카드에 hover 효과 클래스가 있어야 함', () => {
      const { container } = render(<NoteCard {...mockNote} />)
      const card = container.querySelector('.hover\\:shadow-md')
      expect(card).toBeInTheDocument()
    })

    it('제목이 font-semibold 클래스를 가져야 함', () => {
      const { container } = render(<NoteCard {...mockNote} />)
      const title = container.querySelector('.font-semibold')
      expect(title).toHaveTextContent('테스트 노트 제목')
    })
  })
})

