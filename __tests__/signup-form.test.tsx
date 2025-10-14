// __tests__/signup-form.test.tsx
// 회원가입 폼 컴포넌트 테스트
// SignUpForm 컴포넌트의 유효성 검사와 사용자 상호작용을 테스트합니다
// 관련 파일: components/auth/signup-form.tsx, jest.setup.js

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { SignUpForm } from '@/components/auth/signup-form'

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

describe('SignUpForm', () => {
  const mockSignUp = jest.fn()
  
  beforeEach(() => {
    const { createClient } = require('@/lib/supabase/client')
    createClient.mockReturnValue({
      auth: {
        signUp: mockSignUp,
      },
    })
    jest.clearAllMocks()
  })

  it('이메일과 비밀번호 입력 필드를 렌더링한다', () => {
    render(<SignUpForm />)
    
    expect(screen.getByLabelText('이메일')).toBeInTheDocument()
    expect(screen.getByLabelText('비밀번호')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '회원가입' })).toBeInTheDocument()
  })

  it('잘못된 이메일 형식에 대해 에러 메시지를 표시한다', async () => {
    render(<SignUpForm />)
    
    const emailInput = screen.getByLabelText('이메일')
    const passwordInput = screen.getByLabelText('비밀번호')
    const submitButton = screen.getByRole('button', { name: '회원가입' })

    // @가 있지만 도메인이 없는 이메일 (HTML5는 통과하지만 실제로는 잘못된 형식)
    fireEvent.change(emailInput, { target: { value: 'test@' } })
    fireEvent.change(passwordInput, { target: { value: 'password123!' } })
    fireEvent.submit(submitButton.closest('form')!)

    await waitFor(() => {
      expect(screen.getByText('올바른 이메일 형식을 입력해주세요.')).toBeInTheDocument()
    })
  })

  it('비밀번호가 8자 미만일 때 에러 메시지를 표시한다', async () => {
    render(<SignUpForm />)
    
    const emailInput = screen.getByLabelText('이메일')
    const passwordInput = screen.getByLabelText('비밀번호')
    const submitButton = screen.getByRole('button', { name: '회원가입' })

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'short!' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('비밀번호는 최소 8자 이상이며 특수문자를 포함해야 합니다.')).toBeInTheDocument()
    })
  })

  it('비밀번호에 특수문자가 없을 때 에러 메시지를 표시한다', async () => {
    render(<SignUpForm />)
    
    const emailInput = screen.getByLabelText('이메일')
    const passwordInput = screen.getByLabelText('비밀번호')
    const submitButton = screen.getByRole('button', { name: '회원가입' })

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('비밀번호는 최소 8자 이상이며 특수문자를 포함해야 합니다.')).toBeInTheDocument()
    })
  })

  it('유효한 입력으로 회원가입을 시도한다', async () => {
    mockSignUp.mockResolvedValue({ data: { user: { id: '1' } }, error: null })
    
    render(<SignUpForm />)
    
    const emailInput = screen.getByLabelText('이메일')
    const passwordInput = screen.getByLabelText('비밀번호')
    const submitButton = screen.getByRole('button', { name: '회원가입' })

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123!' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockSignUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123!',
      })
    })
  })

  it('중복 이메일 에러를 처리한다', async () => {
    mockSignUp.mockResolvedValue({ 
      data: null, 
      error: { message: 'User already registered' } 
    })
    
    render(<SignUpForm />)
    
    const emailInput = screen.getByLabelText('이메일')
    const passwordInput = screen.getByLabelText('비밀번호')
    const submitButton = screen.getByRole('button', { name: '회원가입' })

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123!' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('이미 가입된 이메일입니다.')).toBeInTheDocument()
    })
  })
})
