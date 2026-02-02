-- Light a Candle reactions
create table public.candles (
  id uuid primary key default gen_random_uuid(),
  memorial_id uuid references public.memorials(id) on delete cascade not null,
  user_id uuid references public.users(id) on delete cascade not null,
  created_at timestamptz default now(),
  unique(memorial_id, user_id)
);

-- Enable RLS
alter table public.candles enable row level security;

-- Anyone can view candle counts
create policy "Anyone can view candle counts" on public.candles
  for select using (true);

-- Authenticated users can light a candle
create policy "Authenticated users can light a candle" on public.candles
  for insert with check (auth.uid() = user_id);

-- Users can unlight their own candle
create policy "Users can unlight their own candle" on public.candles
  for delete using (auth.uid() = user_id);
