// __tests__/signin-form.test.tsx
// 로그인 폼 컴포넌트 테스트
// SignInForm 컴포넌트의 유효성 검사와 사용자 상호작용을 테스트합니다
// 관련 파일: components/auth/signin-form.tsx, jest.setup.js

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { SignInForm } from '@/components/auth/signin-form'

// 각 테스트마다 Supabase 클라이언트를 다시 모킹
jest.mock('@/lib/supabase/client', () => ({
  createClient: jest.fn(),
}))

// Next.js router 모킹
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}))

describe('SignInForm', () => {
  const mockSignIn = jest.fn()
  
  beforeEach(() => {
    const { createClient } = require('@/lib/supabase/client')
    createClient.mockReturnValue({
      auth: {
        signInWithPassword: mockSignIn,
      },
    })
    jest.clearAllMocks()
  })

  it('이메일과 비밀번호 입력 필드를 렌더링한다', () => {
    render(<SignInForm />)
    
    expect(screen.getByLabelText('이메일')).toBeInTheDocument()
    expect(screen.getByLabelText('비밀번호')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '로그인' })).toBeInTheDocument()
  })

  it('잘못된 이메일 형식에 대해 에러 메시지를 표시한다', async () => {
    render(<SignInForm />)
    
    const emailInput = screen.getByLabelText('이메일')
    const passwordInput = screen.getByLabelText('비밀번호')
    const submitButton = screen.getByRole('button', { name: '로그인' })

    // @가 있지만 도메인이 없는 이메일 (HTML5는 통과하지만 실제로는 잘못된 형식)
    fireEvent.change(emailInput, { target: { value: 'test@' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.submit(submitButton.closest('form')!)

    await waitFor(() => {
      expect(screen.getByText('올바른 이메일 형식을 입력해주세요.')).toBeInTheDocument()
    })
  })

  it('비밀번호가 비어있을 때 에러 메시지를 표시한다', async () => {
    render(<SignInForm />)
    
    const emailInput = screen.getByLabelText('이메일')
    const passwordInput = screen.getByLabelText('비밀번호')
    const submitButton = screen.getByRole('button', { name: '로그인' })

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: '' } })
    fireEvent.submit(submitButton.closest('form')!)

    await waitFor(() => {
      expect(screen.getByText('비밀번호를 입력해주세요.')).toBeInTheDocument()
    })
  })

  it('유효한 입력으로 로그인을 시도한다', async () => {
    mockSignIn.mockResolvedValue({ data: { user: { id: '1' } }, error: null })
    
    render(<SignInForm />)
    
    const emailInput = screen.getByLabelText('이메일')
    const passwordInput = screen.getByLabelText('비밀번호')
    const submitButton = screen.getByRole('button', { name: '로그인' })

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.submit(submitButton.closest('form')!)

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      })
    })
  })

  it('잘못된 인증 정보에 대해 에러 메시지를 표시한다', async () => {
    mockSignIn.mockResolvedValue({ 
      data: null, 
      error: { message: 'Invalid login credentials' } 
    })
    
    render(<SignInForm />)
    
    const emailInput = screen.getByLabelText('이메일')
    const passwordInput = screen.getByLabelText('비밀번호')
    const submitButton = screen.getByRole('button', { name: '로그인' })

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } })
    fireEvent.submit(submitButton.closest('form')!)

    await waitFor(() => {
      expect(screen.getByText('이메일 또는 비밀번호가 올바르지 않습니다.')).toBeInTheDocument()
    })
  })

  it('기타 로그인 에러에 대해 일반적인 에러 메시지를 표시한다', async () => {
    mockSignIn.mockResolvedValue({ 
      data: null, 
      error: { message: 'Network error' } 
    })
    
    render(<SignInForm />)
    
    const emailInput = screen.getByLabelText('이메일')
    const passwordInput = screen.getByLabelText('비밀번호')
    const submitButton = screen.getByRole('button', { name: '로그인' })

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.submit(submitButton.closest('form')!)

    await waitFor(() => {
      expect(screen.getByText('로그인 중 오류가 발생했습니다. 다시 시도해주세요.')).toBeInTheDocument()
    })
  })

  it('로딩 상태를 표시한다', async () => {
    mockSignIn.mockImplementation(() => new Promise(() => {})) // 무한 대기
    
    render(<SignInForm />)
    
    const emailInput = screen.getByLabelText('이메일')
    const passwordInput = screen.getByLabelText('비밀번호')
    const submitButton = screen.getByRole('button', { name: '로그인' })

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.submit(submitButton.closest('form')!)

    await waitFor(() => {
      expect(screen.getByText('로그인 중...')).toBeInTheDocument()
      expect(submitButton).toBeDisabled()
    })
  })

  it('비밀번호 필드가 마스킹되어 있다', () => {
    render(<SignInForm />)
    
    const passwordInput = screen.getByLabelText('비밀번호')
    expect(passwordInput).toHaveAttribute('type', 'password')
  })
})
