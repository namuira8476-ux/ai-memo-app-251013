// components/auth/password-update-form.tsx
// 새 비밀번호 설정 폼 컴포넌트
// 비밀번호 재설정 이메일의 링크를 통해 접근하여 새 비밀번호를 설정하는 폼입니다
// 관련 파일: app/auth/update-password/page.tsx, lib/supabase/client.ts, components/ui/button.tsx, components/ui/input.tsx, components/ui/label.tsx

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function PasswordUpdateForm() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  // 비밀번호 유효성 검사
  const validatePassword = (password: string): boolean => {
    return password.length >= 8 && /[!@#$%^&*(),.?":{}|<>]/.test(password)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // 클라이언트 사이드 유효성 검사
    if (!password) {
      setError('새 비밀번호를 입력해주세요.')
      setLoading(false)
      return
    }

    if (!validatePassword(password)) {
      setError('비밀번호는 최소 8자 이상이며 특수문자를 포함해야 합니다.')
      setLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.')
      setLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      })

      if (error) {
        setError('비밀번호 업데이트 중 오류가 발생했습니다. 다시 시도해주세요.')
      } else {
        // 비밀번호 업데이트 성공 시 로그인 페이지로 리다이렉트
        router.push('/auth/signin?message=password-updated')
      }
    } catch {
      setError('예상치 못한 오류가 발생했습니다. 다시 시도해주세요.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="password">새 비밀번호</Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="새 비밀번호를 입력하세요 (최소 8자, 특수문자 포함)"
          required
          disabled={loading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">비밀번호 확인</Label>
        <Input
          id="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="비밀번호를 다시 입력하세요"
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
        {loading ? '비밀번호 업데이트 중...' : '비밀번호 업데이트'}
      </Button>
    </form>
  )
}

