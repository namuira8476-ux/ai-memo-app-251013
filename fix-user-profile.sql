-- 현재 로그인한 사용자를 user_profiles 테이블에 추가
-- 이 스크립트는 Supabase SQL Editor에서 실행하세요

-- 1. 먼저 user_profiles 테이블이 있는지 확인하고 없으면 생성
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY,
  onboarding_completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 2. auth.users에 있는 모든 사용자를 user_profiles에 추가
-- (이미 존재하는 경우 무시)
INSERT INTO user_profiles (id, onboarding_completed, created_at, updated_at)
SELECT 
  id,
  false as onboarding_completed,
  NOW() as created_at,
  NOW() as updated_at
FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- 3. 결과 확인
SELECT 
  up.id,
  au.email,
  up.onboarding_completed,
  up.created_at
FROM user_profiles up
JOIN auth.users au ON up.id = au.id;

