-- V2-1 Learn: Flashcards + Quizzes tables
-- Run in Supabase SQL Editor

-- Flashcards table with SM-2 spaced repetition fields
create table flashcards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null,
  deck text not null default 'General',
  front text not null,
  back text not null,
  next_review_at timestamptz not null default now(),
  interval_days integer not null default 1,
  ease numeric not null default 2.5,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Quizzes table (generated from flashcards)
create table quizzes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null,
  title text not null,
  questions jsonb not null,
  created_at timestamptz default now()
);

-- Indexes for common queries
create index idx_flashcards_user_due on flashcards (user_id, next_review_at);
create index idx_flashcards_user_deck on flashcards (user_id, deck);
create index idx_quizzes_user on quizzes (user_id);

-- RLS policies
alter table flashcards enable row level security;
alter table quizzes enable row level security;

create policy "Users own flashcards" on flashcards
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users own quizzes" on quizzes
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Updated_at trigger for flashcards
create or replace function update_updated_at_column()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end; $$;

create trigger update_flashcards_updated_at
  before update on flashcards
  for each row execute function update_updated_at_column();