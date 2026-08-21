-- Fix: subtasks delete should cascade when parent deleted
-- Run this in Supabase → SQL Editor → New Query → Run
-- Without this, DELETE parent with subtasks fails with 23503 foreign key violation

do $$ begin
  alter table tasks drop constraint if exists tasks_parent_task_id_fkey;
exception when undefined_object then null; end $$;

alter table tasks
  add constraint tasks_parent_task_id_fkey
  foreign key (parent_task_id) references tasks(id) on delete cascade;
