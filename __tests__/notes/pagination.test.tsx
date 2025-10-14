// __tests__/notes/pagination.test.tsx
// Pagination 컴포넌트 테스트
// 버튼 활성화/비활성화, 페이지 번호 표시 검증
// 관련 파일: components/notes/pagination.tsx

import { render, screen } from '@testing-library/react'
import { Pagination } from '@/components/notes/pagination'

// Mock next/link
jest.mock('next/link', () => {
  return function MockLink({ children, href }: any) {
    return <a href={href}>{children}</a>
  }
})

describe('Pagination 컴포넌트', () => {
  const baseUrl = '/notes'

  describe('페이지 번호 표시 테스트', () => {
    it('현재 페이지와 전체 페이지를 표시해야 함', () => {
      render(<Pagination currentPage={2} totalPages={5} baseUrl={baseUrl} />)
      expect(screen.getByText('2 / 5')).toBeInTheDocument()
    })

    it('첫 페이지에서도 올바르게 표시해야 함', () => {
      render(<Pagination currentPage={1} totalPages={10} baseUrl={baseUrl} />)
      expect(screen.getByText('1 / 10')).toBeInTheDocument()
    })

    it('마지막 페이지에서도 올바르게 표시해야 함', () => {
      render(<Pagination currentPage={3} totalPages={3} baseUrl={baseUrl} />)
      expect(screen.getByText('3 / 3')).toBeInTheDocument()
    })
  })

  describe('이전 버튼 테스트', () => {
    it('첫 페이지에서는 이전 버튼이 비활성화되어야 함', () => {
      render(<Pagination currentPage={1} totalPages={5} baseUrl={baseUrl} />)
      const prevButton = screen.getAllByRole('button', { name: '이전' })[0]
      expect(prevButton).toBeDisabled()
    })

    it('첫 페이지가 아니면 이전 버튼이 활성화되어야 함', () => {
      render(<Pagination currentPage={2} totalPages={5} baseUrl={baseUrl} />)
      const prevButtons = screen.getAllByRole('button', { name: '이전' })
      
      // 활성화된 버튼은 Link로 감싸져 있어서 disabled가 아님
      const enabledButton = prevButtons.find(btn => !btn.hasAttribute('disabled'))
      expect(enabledButton).toBeDefined()
    })

    it('이전 버튼의 링크가 올바른 페이지를 가리켜야 함', () => {
      const { container } = render(
        <Pagination currentPage={3} totalPages={5} baseUrl={baseUrl} />
      )
      const prevLink = container.querySelector('a[href="/notes?page=2"]')
      expect(prevLink).toBeInTheDocument()
    })
  })

  describe('다음 버튼 테스트', () => {
    it('마지막 페이지에서는 다음 버튼이 비활성화되어야 함', () => {
      render(<Pagination currentPage={5} totalPages={5} baseUrl={baseUrl} />)
      const nextButtons = screen.getAllByRole('button', { name: '다음' })
      const disabledButton = nextButtons.find(btn => btn.hasAttribute('disabled'))
      expect(disabledButton).toBeDisabled()
    })

    it('마지막 페이지가 아니면 다음 버튼이 활성화되어야 함', () => {
      render(<Pagination currentPage={2} totalPages={5} baseUrl={baseUrl} />)
      const nextButtons = screen.getAllByRole('button', { name: '다음' })
      const enabledButton = nextButtons.find(btn => !btn.hasAttribute('disabled'))
      expect(enabledButton).toBeDefined()
    })

    it('다음 버튼의 링크가 올바른 페이지를 가리켜야 함', () => {
      const { container } = render(
        <Pagination currentPage={2} totalPages={5} baseUrl={baseUrl} />
      )
      const nextLink = container.querySelector('a[href="/notes?page=3"]')
      expect(nextLink).toBeInTheDocument()
    })
  })

  describe('URL 쿼리 파라미터 테스트', () => {
    it('페이지 쿼리 파라미터가 올바르게 생성되어야 함', () => {
      const { container } = render(
        <Pagination currentPage={1} totalPages={3} baseUrl={baseUrl} />
      )
      
      const nextLink = container.querySelector('a[href="/notes?page=2"]')
      expect(nextLink).toBeInTheDocument()
    })

    it('다른 baseUrl에서도 올바르게 동작해야 함', () => {
      const { container } = render(
        <Pagination currentPage={1} totalPages={3} baseUrl="/search" />
      )
      
      const nextLink = container.querySelector('a[href="/search?page=2"]')
      expect(nextLink).toBeInTheDocument()
    })
  })

  describe('엣지 케이스 테스트', () => {
    it('페이지가 1개만 있을 때 모든 버튼이 비활성화되어야 함', () => {
      render(<Pagination currentPage={1} totalPages={1} baseUrl={baseUrl} />)
      
      const buttons = screen.getAllByRole('button')
      const disabledButtons = buttons.filter(btn => btn.hasAttribute('disabled'))
      expect(disabledButtons).toHaveLength(2) // 이전, 다음 모두 비활성화
    })
  })
})

