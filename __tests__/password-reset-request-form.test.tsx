// __tests__/password-reset-request-form.test.tsx
// 비밀번호 재설정 요청 폼 컴포넌트 테스트
// PasswordResetRequestForm 컴포넌트의 유효성 검사와 사용자 상호작용을 테스트합니다
// 관련 파일: components/auth/password-reset-request-form.tsx, jest.setup.js

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { PasswordResetRequestForm } from '@/components/auth/password-reset-request-form'

// 각 테스트마다 Supabase 클라이언트를 다시 모킹
jest.mock('@/lib/supabase/client', () => ({
  createClient: jest.fn(),
}))

describe('PasswordResetRequestForm', () => {
  const mockResetPasswordForEmail = jest.fn()
  
  beforeEach(() => {
    const { createClient } = require('@/lib/supabase/client')
    createClient.mockReturnValue({
      auth: {
        resetPasswordForEmail: mockResetPasswordForEmail,
      },
    })
    jest.clearAllMocks()
  })

  it('이메일 입력 필드를 렌더링한다', () => {
    render(<PasswordResetRequestForm />)
    
    expect(screen.getByLabelText('이메일')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '비밀번호 재설정 이메일 발송' })).toBeInTheDocument()
  })

  it('잘못된 이메일 형식에 대해 에러 메시지를 표시한다', async () => {
    render(<PasswordResetRequestForm />)
    
    const emailInput = screen.getByLabelText('이메일')
    const submitButton = screen.getByRole('button', { name: '비밀번호 재설정 이메일 발송' })

    fireEvent.change(emailInput, { target: { value: 'invalid-email' } })
    fireEvent.submit(submitButton.closest('form')!)

    await waitFor(() => {
      expect(screen.getByText('올바른 이메일 형식을 입력해주세요.')).toBeInTheDocument()
    })
  })

  it('유효한 이메일로 비밀번호 재설정 요청을 시도한다', async () => {
    mockResetPasswordForEmail.mockResolvedValue({ error: null })
    
    render(<PasswordResetRequestForm />)
    
    const emailInput = screen.getByLabelText('이메일')
    const submitButton = screen.getByRole('button', { name: '비밀번호 재설정 이메일 발송' })

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.submit(submitButton.closest('form')!)

    await waitFor(() => {
      expect(mockResetPasswordForEmail).toHaveBeenCalledWith('test@example.com', {
        redirectTo: expect.stringContaining('/auth/update-password'),
      })
    })
  })

  it('존재하지 않는 이메일에 대해 에러 메시지를 표시한다', async () => {
    mockResetPasswordForEmail.mockResolvedValue({ 
      error: { message: 'User not found' } 
    })
    
    render(<PasswordResetRequestForm />)
    
    const emailInput = screen.getByLabelText('이메일')
    const submitButton = screen.getByRole('button', { name: '비밀번호 재설정 이메일 발송' })

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.submit(submitButton.closest('form')!)

    await waitFor(() => {
      expect(screen.getByText('존재하지 않는 이메일입니다.')).toBeInTheDocument()
    })
  })

  it('기타 에러에 대해 일반적인 에러 메시지를 표시한다', async () => {
    mockResetPasswordForEmail.mockResolvedValue({ 
      error: { message: 'Network error' } 
    })
    
    render(<PasswordResetRequestForm />)
    
    const emailInput = screen.getByLabelText('이메일')
    const submitButton = screen.getByRole('button', { name: '비밀번호 재설정 이메일 발송' })

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.submit(submitButton.closest('form')!)

    await waitFor(() => {
      expect(screen.getByText('비밀번호 재설정 이메일 발송 중 오류가 발생했습니다. 다시 시도해주세요.')).toBeInTheDocument()
    })
  })

  it('성공 시 성공 메시지를 표시한다', async () => {
    mockResetPasswordForEmail.mockResolvedValue({ error: null })
    
    render(<PasswordResetRequestForm />)
    
    const emailInput = screen.getByLabelText('이메일')
    const submitButton = screen.getByRole('button', { name: '비밀번호 재설정 이메일 발송' })

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.submit(submitButton.closest('form')!)

    await waitFor(() => {
      expect(screen.getByText('이메일을 확인해주세요')).toBeInTheDocument()
      expect(screen.getByText(/test@example.com로 비밀번호 재설정 링크를 발송했습니다/)).toBeInTheDocument()
    })
  })

  it('로딩 상태를 표시한다', async () => {
    mockResetPasswordForEmail.mockImplementation(() => new Promise(() => {})) // 무한 대기
    
    render(<PasswordResetRequestForm />)
    
    const emailInput = screen.getByLabelText('이메일')
    const submitButton = screen.getByRole('button', { name: '비밀번호 재설정 이메일 발송' })

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.submit(submitButton.closest('form')!)

    await waitFor(() => {
      expect(screen.getByText('이메일 발송 중...')).toBeInTheDocument()
      expect(submitButton).toBeDisabled()
    })
  })

  it('성공 후 다른 이메일로 재시도할 수 있다', async () => {
    mockResetPasswordForEmail.mockResolvedValue({ error: null })
    
    render(<PasswordResetRequestForm />)
    
    const emailInput = screen.getByLabelText('이메일')
    const submitButton = screen.getByRole('button', { name: '비밀번호 재설정 이메일 발송' })

    // 첫 번째 요청
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.submit(submitButton.closest('form')!)

    await waitFor(() => {
      expect(screen.getByText('이메일을 확인해주세요')).toBeInTheDocument()
    })

    // 재시도 버튼 클릭
    const retryButton = screen.getByRole('button', { name: '다른 이메일로 재시도' })
    fireEvent.click(retryButton)

    await waitFor(() => {
      expect(screen.getByLabelText('이메일')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: '비밀번호 재설정 이메일 발송' })).toBeInTheDocument()
    })
  })
})

