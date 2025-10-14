-- AI 메모장 데이터베이스 스키마
-- Supabase SQL Editor에서 실행하세요

-- 1. user_profiles 테이블 (이미 존재할 수 있음)
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY,
  onboarding_completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 2. notes 테이블
CREATE TABLE IF NOT EXISTS notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 3. notes 테이블 인덱스
CREATE INDEX IF NOT EXISTS notes_user_id_idx ON notes(user_id);
CREATE INDEX IF NOT EXISTS notes_created_at_idx ON notes(created_at);

-- 4. note_tags 테이블
CREATE TABLE IF NOT EXISTS note_tags (
  note_id UUID NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
  tag TEXT NOT NULL,
  PRIMARY KEY (note_id, tag)
);

-- 5. note_tags 테이블 인덱스
CREATE INDEX IF NOT EXISTS note_tags_note_id_idx ON note_tags(note_id);
CREATE INDEX IF NOT EXISTS note_tags_tag_idx ON note_tags(tag);

-- 6. summaries 테이블
CREATE TABLE IF NOT EXISTS summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  note_id UUID NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
  model TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 7. summaries 테이블 인덱스
CREATE INDEX IF NOT EXISTS summaries_note_id_idx ON summaries(note_id);

-- 완료 메시지
SELECT 'All tables created successfully!' as status;

