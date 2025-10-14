// components/notes/note-form.tsx
// 노트 생성/수정 폼 컴포넌트
// React Hook Form과 Zod를 사용한 폼 유효성 검증
// 관련 파일: lib/actions/notes.ts, components/ui/*

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { createNote } from '@/lib/actions/notes'

// Zod 스키마 정의
const noteFormSchema = z.object({
  title: z.string()
    .min(1, '제목을 입력해주세요')
    .max(200, '제목은 200자 이내로 입력해주세요'),
  content: z.string()
    .min(1, '내용을 입력해주세요')
    .max(10000, '내용은 10,000자 이내로 입력해주세요'),
})

type NoteFormData = z.infer<typeof noteFormSchema>

interface NoteFormProps {
  mode: 'create' | 'edit'
  initialData?: {
    title: string
    content: string
  }
  onSuccess?: () => void
}

export function NoteForm({ mode, initialData, onSuccess }: NoteFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // React Hook Form 설정
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<NoteFormData>({
    resolver: zodResolver(noteFormSchema),
    mode: 'onChange',
    defaultValues: initialData || {
      title: '',
      content: '',
    },
  })

  // 폼 제출 핸들러
  const onSubmit = async (data: NoteFormData) => {
    setIsSubmitting(true)
    setError(null)
    setSuccessMessage(null)

    try {
      if (mode === 'create') {
        // 노트 생성
        const result = await createNote(data)

        if (result.success) {
          setSuccessMessage('노트가 저장되었습니다')
          
          // 성공 콜백 실행 (있는 경우)
          if (onSuccess) {
            onSuccess()
          }
          
          // 노트 목록 페이지로 리다이렉트
          setTimeout(() => {
            router.push('/notes')
          }, 500)
        } else {
          setError(result.error || '노트 저장에 실패했습니다')
        }
      } else {
        // edit 모드는 이후 Story에서 구현
        setError('수정 기능은 아직 지원되지 않습니다')
      }
    } catch (err) {
      console.error('노트 저장 중 오류:', err)
      setError('네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // 취소 핸들러
  const handleCancel = () => {
    router.push('/notes')
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* 제목 입력 */}
      <div className="space-y-2">
        <Label htmlFor="title">제목</Label>
        <Input
          id="title"
          placeholder="노트 제목을 입력하세요"
          {...register('title')}
          disabled={isSubmitting}
          className="w-full"
        />
        {errors.title && (
          <p className="text-sm text-red-600">{errors.title.message}</p>
        )}
      </div>

      {/* 본문 입력 */}
      <div className="space-y-2">
        <Label htmlFor="content">내용</Label>
        <Textarea
          id="content"
          placeholder="노트 내용을 입력하세요"
          {...register('content')}
          disabled={isSubmitting}
          className="w-full min-h-[300px] resize-y"
          rows={15}
        />
        {errors.content && (
          <p className="text-sm text-red-600">{errors.content.message}</p>
        )}
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div className="p-3 rounded-md bg-red-50 border border-red-200">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* 성공 메시지 */}
      {successMessage && (
        <div className="p-3 rounded-md bg-green-50 border border-green-200">
          <p className="text-sm text-green-600">{successMessage}</p>
        </div>
      )}

      {/* 버튼 그룹 */}
      <div className="flex gap-3 justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={handleCancel}
          disabled={isSubmitting}
        >
          취소
        </Button>
        <Button
          type="submit"
          disabled={!isValid || isSubmitting}
        >
          {isSubmitting ? '저장 중...' : mode === 'create' ? '노트 생성' : '노트 수정'}
        </Button>
      </div>
    </form>
  )
}

