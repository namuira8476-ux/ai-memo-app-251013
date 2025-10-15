// components/onboarding/onboarding-step.tsx
// 온보딩 각 단계의 콘텐츠 표시 컴포넌트
// 단계별 제목, 설명, 아이콘을 표시
// 관련 파일: components/onboarding/onboarding-modal.tsx

'use client'

interface OnboardingStepProps {
  title: string
  description: string
  icon: React.ReactNode
}

export function OnboardingStep({ title, description, icon }: OnboardingStepProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center space-y-6 py-8 px-4">
      {/* 아이콘 */}
      <div className="text-6xl mb-4">
        {icon}
      </div>
      
      {/* 제목 */}
      <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
        {title}
      </h2>
      
      {/* 설명 */}
      <p className="text-base md:text-lg text-gray-600 max-w-md">
        {description}
      </p>
    </div>
  )
}







