-- Atomic increment for anonymous candle count to prevent race conditions
create or replace function increment_anonymous_candle_count(p_memorial_id uuid)
returns integer
language sql
as $$
  update memorials
  set anonymous_candle_count = anonymous_candle_count + 1
  where id = p_memorial_id
  returning anonymous_candle_count;
$$;
