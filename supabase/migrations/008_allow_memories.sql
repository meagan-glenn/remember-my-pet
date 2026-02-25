-- Add allow_memories column to memorials table
-- Lets memorial owners disable memory wall submissions
-- Defaults to true so existing memorials are unaffected
alter table public.memorials
  add column allow_memories boolean default true;
