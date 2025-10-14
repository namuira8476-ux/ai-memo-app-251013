// __tests__/logout-functionality.test.tsx
// 로그아웃 기능 테스트
// 홈페이지의 로그아웃 버튼과 로그아웃 서버 액션을 테스트합니다
// 관련 파일: app/page.tsx, app/auth/signout/route.ts, lib/supabase/server.ts

import { render, screen } from '@testing-library/react'
import Home from '@/app/page'

// Supabase 서버 클라이언트 모킹
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(),
}))

describe('Logout Functionality', () => {
  const mockCreateClient = require('@/lib/supabase/server').createClient

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('로그인된 사용자에게 로그아웃 버튼을 표시한다', async () => {
    mockCreateClient.mockResolvedValue({
      auth: {
        getUser: jest.fn().mockResolvedValue({ 
          data: { user: { id: '1', email: 'test@example.com' } } 
        }),
      },
    })

    const page = await Home()
    render(page)

    expect(screen.getByText('안녕하세요, test@example.com님!')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '로그아웃' })).toBeInTheDocument()
  })

  it('로그인되지 않은 사용자에게는 로그아웃 버튼을 표시하지 않는다', async () => {
    mockCreateClient.mockResolvedValue({
      auth: {
        getUser: jest.fn().mockResolvedValue({ data: { user: null } }),
      },
    })

    const page = await Home()
    render(page)

    expect(screen.queryByRole('button', { name: '로그아웃' })).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: '로그인' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '회원가입' })).toBeInTheDocument()
  })

  it('로그아웃 버튼이 올바른 form action을 가진다', async () => {
    mockCreateClient.mockResolvedValue({
      auth: {
        getUser: jest.fn().mockResolvedValue({ 
          data: { user: { id: '1', email: 'test@example.com' } } 
        }),
      },
    })

    const page = await Home()
    render(page)

    const logoutForm = screen.getByRole('button', { name: '로그아웃' }).closest('form')
    expect(logoutForm).toHaveAttribute('action', '/auth/signout')
    expect(logoutForm).toHaveAttribute('method', 'post')
  })
})

