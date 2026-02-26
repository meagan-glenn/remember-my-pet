-- Allow anonymous candle lighting without requiring auth
alter table public.memorials
  add column anonymous_candle_count integer not null default 0;
