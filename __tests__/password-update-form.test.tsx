// __tests__/password-update-form.test.tsx
// 새 비밀번호 설정 폼 컴포넌트 테스트
// PasswordUpdateForm 컴포넌트의 유효성 검사와 사용자 상호작용을 테스트합니다
// 관련 파일: components/auth/password-update-form.tsx, jest.setup.js

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { PasswordUpdateForm } from '@/components/auth/password-update-form'

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

describe('PasswordUpdateForm', () => {
  const mockUpdateUser = jest.fn()
  
  beforeEach(() => {
    const { createClient } = require('@/lib/supabase/client')
    createClient.mockReturnValue({
      auth: {
        updateUser: mockUpdateUser,
      },
    })
    jest.clearAllMocks()
  })

  it('비밀번호 입력 필드들을 렌더링한다', () => {
    render(<PasswordUpdateForm />)
    
    expect(screen.getByLabelText('새 비밀번호')).toBeInTheDocument()
    expect(screen.getByLabelText('비밀번호 확인')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '비밀번호 업데이트' })).toBeInTheDocument()
  })

  it('비밀번호가 비어있을 때 에러 메시지를 표시한다', async () => {
    render(<PasswordUpdateForm />)
    
    const passwordInput = screen.getByLabelText('새 비밀번호')
    const submitButton = screen.getByRole('button', { name: '비밀번호 업데이트' })

    fireEvent.change(passwordInput, { target: { value: '' } })
    fireEvent.submit(submitButton.closest('form')!)

    await waitFor(() => {
      expect(screen.getByText('새 비밀번호를 입력해주세요.')).toBeInTheDocument()
    })
  })

  it('비밀번호가 너무 짧거나 특수문자가 없을 때 에러 메시지를 표시한다', async () => {
    render(<PasswordUpdateForm />)
    
    const passwordInput = screen.getByLabelText('새 비밀번호')
    const confirmPasswordInput = screen.getByLabelText('비밀번호 확인')
    const submitButton = screen.getByRole('button', { name: '비밀번호 업데이트' })

    fireEvent.change(passwordInput, { target: { value: '1234567' } }) // 7자, 특수문자 없음
    fireEvent.change(confirmPasswordInput, { target: { value: '1234567' } })
    fireEvent.submit(submitButton.closest('form')!)

    await waitFor(() => {
      expect(screen.getByText('비밀번호는 최소 8자 이상이며 특수문자를 포함해야 합니다.')).toBeInTheDocument()
    })
  })

  it('비밀번호가 일치하지 않을 때 에러 메시지를 표시한다', async () => {
    render(<PasswordUpdateForm />)
    
    const passwordInput = screen.getByLabelText('새 비밀번호')
    const confirmPasswordInput = screen.getByLabelText('비밀번호 확인')
    const submitButton = screen.getByRole('button', { name: '비밀번호 업데이트' })

    fireEvent.change(passwordInput, { target: { value: 'password123!' } })
    fireEvent.change(confirmPasswordInput, { target: { value: 'password456!' } })
    fireEvent.submit(submitButton.closest('form')!)

    await waitFor(() => {
      expect(screen.getByText('비밀번호가 일치하지 않습니다.')).toBeInTheDocument()
    })
  })

  it('유효한 비밀번호로 업데이트를 시도한다', async () => {
    mockUpdateUser.mockResolvedValue({ error: null })
    
    render(<PasswordUpdateForm />)
    
    const passwordInput = screen.getByLabelText('새 비밀번호')
    const confirmPasswordInput = screen.getByLabelText('비밀번호 확인')
    const submitButton = screen.getByRole('button', { name: '비밀번호 업데이트' })

    fireEvent.change(passwordInput, { target: { value: 'password123!' } })
    fireEvent.change(confirmPasswordInput, { target: { value: 'password123!' } })
    fireEvent.submit(submitButton.closest('form')!)

    await waitFor(() => {
      expect(mockUpdateUser).toHaveBeenCalledWith({
        password: 'password123!'
      })
    })
  })

  it('비밀번호 업데이트 실패 시 에러 메시지를 표시한다', async () => {
    mockUpdateUser.mockResolvedValue({ 
      error: { message: 'Update failed' } 
    })
    
    render(<PasswordUpdateForm />)
    
    const passwordInput = screen.getByLabelText('새 비밀번호')
    const confirmPasswordInput = screen.getByLabelText('비밀번호 확인')
    const submitButton = screen.getByRole('button', { name: '비밀번호 업데이트' })

    fireEvent.change(passwordInput, { target: { value: 'password123!' } })
    fireEvent.change(confirmPasswordInput, { target: { value: 'password123!' } })
    fireEvent.submit(submitButton.closest('form')!)

    await waitFor(() => {
      expect(screen.getByText('비밀번호 업데이트 중 오류가 발생했습니다. 다시 시도해주세요.')).toBeInTheDocument()
    })
  })

  it('로딩 상태를 표시한다', async () => {
    mockUpdateUser.mockImplementation(() => new Promise(() => {})) // 무한 대기
    
    render(<PasswordUpdateForm />)
    
    const passwordInput = screen.getByLabelText('새 비밀번호')
    const confirmPasswordInput = screen.getByLabelText('비밀번호 확인')
    const submitButton = screen.getByRole('button', { name: '비밀번호 업데이트' })

    fireEvent.change(passwordInput, { target: { value: 'password123!' } })
    fireEvent.change(confirmPasswordInput, { target: { value: 'password123!' } })
    fireEvent.submit(submitButton.closest('form')!)

    await waitFor(() => {
      expect(screen.getByText('비밀번호 업데이트 중...')).toBeInTheDocument()
      expect(submitButton).toBeDisabled()
    })
  })

  it('비밀번호 필드가 마스킹되어 있다', () => {
    render(<PasswordUpdateForm />)
    
    const passwordInput = screen.getByLabelText('새 비밀번호')
    const confirmPasswordInput = screen.getByLabelText('비밀번호 확인')
    
    expect(passwordInput).toHaveAttribute('type', 'password')
    expect(confirmPasswordInput).toHaveAttribute('type', 'password')
  })
})

