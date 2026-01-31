-- Videos uploaded by users (raw source files)
create table videos (
  id uuid primary key default gen_random_uuid(),
  memorial_id uuid references memorials(id) on delete cascade,
  user_id uuid references auth.users(id),
  url text not null,
  filename text not null,
  duration_seconds numeric,
  size_bytes bigint,
  mime_type text not null,
  thumbnail_url text,
  sort_order integer default 0,
  created_at timestamptz default now()
);

-- Clips carved from source videos
create table video_clips (
  id uuid primary key default gen_random_uuid(),
  video_id uuid references videos(id) on delete cascade,
  memorial_id uuid references memorials(id) on delete cascade,
  start_time numeric not null default 0,
  end_time numeric not null,
  tag text,
  sort_order integer default 0,
  created_at timestamptz default now()
);

-- Rendered compilations
create table video_compilations (
  id uuid primary key default gen_random_uuid(),
  memorial_id uuid references memorials(id) on delete cascade,
  url text,
  status text not null default 'pending',
  duration_seconds numeric,
  transition_type text default 'cut',
  error_message text,
  created_at timestamptz default now(),
  completed_at timestamptz
);

-- RLS policies
alter table videos enable row level security;
alter table video_clips enable row level security;
alter table video_compilations enable row level security;

create policy "Users manage own videos" on videos
  for all using (auth.uid() = user_id);

create policy "Users manage clips via memorial" on video_clips
  for all using (
    memorial_id in (select id from memorials where user_id = auth.uid())
  );

create policy "Users manage compilations via memorial" on video_compilations
  for all using (
    memorial_id in (select id from memorials where user_id = auth.uid())
  );
