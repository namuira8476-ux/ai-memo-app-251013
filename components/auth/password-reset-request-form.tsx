// components/auth/password-reset-request-form.tsx
// 비밀번호 재설정 요청 폼 컴포넌트
// 이메일을 입력받아 비밀번호 재설정 이메일을 발송하는 폼입니다
// 관련 파일: app/auth/reset-password/page.tsx, lib/supabase/client.ts, components/ui/button.tsx, components/ui/input.tsx, components/ui/label.tsx

'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function PasswordResetRequestForm() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const supabase = createClient()

  // 이메일 형식 유효성 검사
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)
    setLoading(true)

    // 클라이언트 사이드 유효성 검사
    if (!validateEmail(email)) {
      setError('올바른 이메일 형식을 입력해주세요.')
      setLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/auth/update-password`,
      })

      if (error) {
        if (error.message.includes('not found') || error.message.includes('does not exist')) {
          setError('존재하지 않는 이메일입니다.')
        } else {
          setError('비밀번호 재설정 이메일 발송 중 오류가 발생했습니다. 다시 시도해주세요.')
        }
      } else {
        setSuccess(true)
      }
    } catch (err) {
      setError('예상치 못한 오류가 발생했습니다. 다시 시도해주세요.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="text-center space-y-4">
        <div className="text-green-600 bg-green-50 p-4 rounded-md">
          <h3 className="text-lg font-medium">이메일을 확인해주세요</h3>
          <p className="text-sm mt-2">
            {email}로 비밀번호 재설정 링크를 발송했습니다.
            <br />
            이메일의 링크를 클릭하여 새 비밀번호를 설정해주세요.
          </p>
        </div>
        <Button 
          onClick={() => {
            setSuccess(false)
            setEmail('')
          }}
          variant="outline"
        >
          다른 이메일로 재시도
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">이메일</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="가입하신 이메일을 입력하세요"
          required
          disabled={loading}
        />
      </div>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
          {error}
        </div>
      )}

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? '이메일 발송 중...' : '비밀번호 재설정 이메일 발송'}
      </Button>
    </form>
  )
}

