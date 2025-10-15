// components/onboarding/progress-indicator.tsx
// 온보딩 진행 상태 표시 컴포넌트
// 현재 단계와 전체 단계를 시각적으로 표시
// 관련 파일: components/onboarding/onboarding-modal.tsx

'use client'

interface ProgressIndicatorProps {
  currentStep: number
  totalSteps: number
}

export function ProgressIndicator({ currentStep, totalSteps }: ProgressIndicatorProps) {
  return (
    <div className="flex items-center justify-center space-x-2">
      {Array.from({ length: totalSteps }, (_, index) => (
        <div
          key={index}
          className={`h-2 rounded-full transition-all ${
            index < currentStep
              ? 'w-8 bg-blue-600'
              : index === currentStep
              ? 'w-12 bg-blue-600'
              : 'w-8 bg-gray-300'
          }`}
        />
      ))}
    </div>
  )
}






