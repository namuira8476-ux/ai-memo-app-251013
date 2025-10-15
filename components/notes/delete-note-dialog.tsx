// components/notes/delete-note-dialog.tsx
// 노트 삭제 확인 다이얼로그 컴포넌트
// 사용자가 노트 삭제를 확인하고 실행하는 모달
// 관련 파일: lib/actions/notes.ts, components/ui/alert-dialog.tsx

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { deleteNote } from '@/lib/actions/notes'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

interface DeleteNoteDialogProps {
  noteId: string
  noteTitle: string
}

export function DeleteNoteDialog({ noteId, noteTitle }: DeleteNoteDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [open, setOpen] = useState(false)
  const router = useRouter()

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault()
    
    setIsDeleting(true)
    setError(null)

    const result = await deleteNote(noteId)

    if (result.success) {
      // 삭제 성공 시 노트 목록 페이지로 리다이렉트
      router.push('/notes')
      router.refresh()
    } else {
      // 실패 시 에러 메시지 표시
      setError(result.error || '노트 삭제에 실패했습니다.')
      setIsDeleting(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive">
          삭제하기
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>노트를 삭제하시겠습니까?</AlertDialogTitle>
          <AlertDialogDescription>
            <span className="block mb-2">
              &ldquo;<span className="font-semibold text-gray-700">{noteTitle}</span>&rdquo;을(를) 삭제합니다.
            </span>
            <span className="block text-red-600 font-medium">
              이 작업은 되돌릴 수 없습니다.
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        {error && (
          <div className="rounded-md bg-red-50 border border-red-200 p-3">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>
            취소
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
          >
            {isDeleting ? '삭제 중...' : '삭제'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

