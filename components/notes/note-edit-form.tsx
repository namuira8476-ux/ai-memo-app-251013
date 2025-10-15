// components/notes/note-edit-form.tsx
// 노트 수정 폼 컴포넌트
// React Hook Form과 Zod를 사용한 폼 검증 및 상태 관리
// 관련 파일: lib/actions/notes.ts, app/notes/[id]/edit/page.tsx

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { updateNote } from '@/lib/actions/notes'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

const noteSchema = z.object({
  title: z.string().min(1, '제목을 입력해주세요').max(100, '제목은 100자 이하로 입력해주세요'),
  content: z.string().min(1, '내용을 입력해주세요'),
})

type NoteFormData = z.infer<typeof noteSchema>

interface NoteEditFormProps {
  noteId: string
  initialData: {
    title: string
    content: string
  }
}

export function NoteEditForm({ noteId, initialData }: NoteEditFormProps) {
  const router = useRouter()
  const [error, setError] = useState<string>('')

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<NoteFormData>({
    resolver: zodResolver(noteSchema),
    defaultValues: {
      title: initialData.title,
      content: initialData.content,
    },
  })

  const onSubmit = async (data: NoteFormData) => {
    setError('')
    
    const result = await updateNote(noteId, data)
    
    if (result.success) {
      router.push(`/notes/${noteId}`)
      router.refresh()
    } else {
      setError(result.error || '노트 수정에 실패했습니다.')
    }
  }

  const handleCancel = () => {
    router.push(`/notes/${noteId}`)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      <div>
        <Label htmlFor="title">제목</Label>
        <Input
          id="title"
          {...register('title')}
          placeholder="노트 제목을 입력하세요"
          className="mt-2"
        />
        {errors.title && (
          <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="content">내용</Label>
        <Textarea
          id="content"
          {...register('content')}
          placeholder="노트 내용을 입력하세요"
          rows={12}
          className="mt-2"
        />
        {errors.content && (
          <p className="text-red-500 text-sm mt-1">{errors.content.message}</p>
        )}
      </div>

      <div className="flex gap-4">
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
          disabled={!isDirty || isSubmitting}
        >
          {isSubmitting ? '저장 중...' : '저장'}
        </Button>
      </div>
    </form>
  )
}






