// drizzle/schema.ts
// 데이터베이스 스키마 정의
// Supabase Postgres 데이터베이스의 테이블 구조를 Drizzle ORM으로 정의
// 관련 파일: lib/db.ts, drizzle.config.ts

import { pgTable, uuid, text, boolean, timestamp, primaryKey, index } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

// 사용자 프로필 테이블
// Supabase Auth의 users와 연결되는 확장 프로필 정보
export const userProfiles = pgTable('user_profiles', {
  id: uuid('id').primaryKey(), // Supabase Auth user.id와 동일
  onboardingCompleted: boolean('onboarding_completed').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// 노트 테이블
export const notes = pgTable('notes', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => userProfiles.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index('notes_user_id_idx').on(table.userId),
  createdAtIdx: index('notes_created_at_idx').on(table.createdAt),
}))

// 노트 태그 테이블
export const noteTags = pgTable('note_tags', {
  noteId: uuid('note_id').notNull().references(() => notes.id, { onDelete: 'cascade' }),
  tag: text('tag').notNull(),
}, (table) => ({
  pk: primaryKey({ columns: [table.noteId, table.tag] }),
  noteIdIdx: index('note_tags_note_id_idx').on(table.noteId),
  tagIdx: index('note_tags_tag_idx').on(table.tag),
}))

// 요약 테이블
export const summaries = pgTable('summaries', {
  id: uuid('id').primaryKey().defaultRandom(),
  noteId: uuid('note_id').notNull().references(() => notes.id, { onDelete: 'cascade' }).unique(), // 유니크 제약조건 추가
  model: text('model').notNull(), // AI 모델 이름 (예: "gemini-pro")
  content: text('content').notNull(), // 요약 내용
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  noteIdIdx: index('summaries_note_id_idx').on(table.noteId),
}))

// Relations (선택적, 타입 안전성을 위해 추가)
export const userProfilesRelations = relations(userProfiles, ({ many }) => ({
  notes: many(notes),
}))

export const notesRelations = relations(notes, ({ one, many }) => ({
  user: one(userProfiles, {
    fields: [notes.userId],
    references: [userProfiles.id],
  }),
  tags: many(noteTags),
  summaries: many(summaries),
}))

export const noteTagsRelations = relations(noteTags, ({ one }) => ({
  note: one(notes, {
    fields: [noteTags.noteId],
    references: [notes.id],
  }),
}))

export const summariesRelations = relations(summaries, ({ one }) => ({
  note: one(notes, {
    fields: [summaries.noteId],
    references: [notes.id],
  }),
}))


