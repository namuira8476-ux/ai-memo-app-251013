// __tests__/signin-page.test.tsx
// 로그인 페이지 통합 테스트
// 로그인 페이지의 전체 플로우와 리다이렉트 로직을 테스트합니다
// 관련 파일: app/auth/signin/page.tsx, lib/supabase/server.ts

import { render, screen } from '@testing-library/react'
import SignInPage from '@/app/auth/signin/page'

// Supabase 서버 클라이언트 모킹
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(),
}))

// Next.js navigation 모킹
jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
  useRouter: () => ({
    push: jest.fn(),
  }),
}))

describe('SignInPage', () => {
  const mockCreateClient = require('@/lib/supabase/server').createClient
  const mockRedirect = require('next/navigation').redirect

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('로그인 페이지를 렌더링한다', async () => {
    mockCreateClient.mockResolvedValue({
      auth: {
        getUser: jest.fn().mockResolvedValue({ data: { user: null } }),
      },
    })

    const page = await SignInPage({ searchParams: {} })
    render(page)

    expect(screen.getByText('AI 메모장 로그인')).toBeInTheDocument()
    expect(screen.getByText('이메일과 비밀번호로 로그인하세요')).toBeInTheDocument()
    expect(screen.getByLabelText('이메일')).toBeInTheDocument()
    expect(screen.getByLabelText('비밀번호')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '로그인' })).toBeInTheDocument()
  })

  it('이미 로그인된 사용자를 홈페이지로 리다이렉트한다', async () => {
    mockCreateClient.mockResolvedValue({
      auth: {
        getUser: jest.fn().mockResolvedValue({ 
          data: { user: { id: '1', email: 'test@example.com' } } 
        }),
      },
    })

    await SignInPage({ searchParams: {} })

    expect(mockRedirect).toHaveBeenCalledWith('/')
  })

  it('회원가입 링크를 표시한다', async () => {
    mockCreateClient.mockResolvedValue({
      auth: {
        getUser: jest.fn().mockResolvedValue({ data: { user: null } }),
      },
    })

    const page = await SignInPage({ searchParams: {} })
    render(page)

    const signupLink = screen.getByRole('link', { name: '회원가입하기' })
    expect(signupLink).toBeInTheDocument()
    expect(signupLink).toHaveAttribute('href', '/auth/signup')
  })
})
