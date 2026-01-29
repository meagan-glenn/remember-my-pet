-- Users table (extends Supabase auth.users)
create table public.users (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  created_at timestamptz default now() not null
);

-- Memorials
create table public.memorials (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users on delete cascade not null,
  pet_name text not null,
  slug text unique not null,
  birth_date date,
  death_date date,
  tribute text,
  decision_support_used boolean default false,
  template text default 'default',
  is_paid boolean default false,
  is_published boolean default false,
  auto_approve_memories boolean default false,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Photos
create table public.photos (
  id uuid default gen_random_uuid() primary key,
  memorial_id uuid references public.memorials on delete cascade not null,
  url text not null,
  caption text,
  ai_detected_tags jsonb default '[]',
  sort_order integer default 0,
  uploaded_by uuid references public.users,
  created_at timestamptz default now() not null
);

-- Memories (memory wall contributions)
create table public.memories (
  id uuid default gen_random_uuid() primary key,
  memorial_id uuid references public.memorials on delete cascade not null,
  contributor_name text not null,
  contributor_email text,
  content text not null,
  photo_urls jsonb default '[]',
  is_approved boolean default false,
  moderation_status text default 'pending' check (moderation_status in ('pending', 'approved', 'rejected')),
  created_at timestamptz default now() not null,
  approved_at timestamptz
);

-- Contributors (tracks who has contributed to memorials)
create table public.contributors (
  id uuid default gen_random_uuid() primary key,
  memorial_id uuid references public.memorials on delete cascade not null,
  email text not null,
  name text not null,
  became_creator boolean default false,
  created_at timestamptz default now() not null,
  unique (memorial_id, email)
);

-- Indexes
create index memorials_user_id_idx on public.memorials (user_id);
create index memorials_slug_idx on public.memorials (slug);
create index photos_memorial_id_idx on public.photos (memorial_id);
create index memories_memorial_id_idx on public.memories (memorial_id);
create index contributors_memorial_id_idx on public.contributors (memorial_id);

-- Row Level Security
alter table public.users enable row level security;
alter table public.memorials enable row level security;
alter table public.photos enable row level security;
alter table public.memories enable row level security;
alter table public.contributors enable row level security;

-- Users: can only read/update own row
create policy "Users can read own data" on public.users for select using (auth.uid() = id);
create policy "Users can update own data" on public.users for update using (auth.uid() = id);

-- Memorials: owners can CRUD, anyone can read published ones
create policy "Anyone can read published memorials" on public.memorials for select using (is_published = true);
create policy "Owners can read own memorials" on public.memorials for select using (auth.uid() = user_id);
create policy "Owners can insert memorials" on public.memorials for insert with check (auth.uid() = user_id);
create policy "Owners can update own memorials" on public.memorials for update using (auth.uid() = user_id);
create policy "Owners can delete own memorials" on public.memorials for delete using (auth.uid() = user_id);

-- Photos: viewable if memorial is published or owned
create policy "Anyone can view photos of published memorials" on public.photos for select using (
  exists (select 1 from public.memorials where id = memorial_id and is_published = true)
);
create policy "Owners can manage photos" on public.photos for all using (
  exists (select 1 from public.memorials where id = memorial_id and user_id = auth.uid())
);

-- Memories: anyone can insert (public contributions), owners moderate
create policy "Anyone can view approved memories" on public.memories for select using (is_approved = true);
create policy "Owners can view all memories on their memorials" on public.memories for select using (
  exists (select 1 from public.memorials where id = memorial_id and user_id = auth.uid())
);
create policy "Anyone can submit a memory" on public.memories for insert with check (true);
create policy "Owners can update memories on their memorials" on public.memories for update using (
  exists (select 1 from public.memorials where id = memorial_id and user_id = auth.uid())
);

-- Contributors: readable by memorial owner
create policy "Owners can view contributors" on public.contributors for select using (
  exists (select 1 from public.memorials where id = memorial_id and user_id = auth.uid())
);
create policy "Anyone can become a contributor" on public.contributors for insert with check (true);

-- Auto-create user row on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Auto-update updated_at on memorials
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger memorials_updated_at
  before update on public.memorials
  for each row execute function public.update_updated_at();

-- Storage bucket for memorial photos
insert into storage.buckets (id, name, public) values ('memorial-photos', 'memorial-photos', true);

create policy "Anyone can view memorial photos" on storage.objects for select using (bucket_id = 'memorial-photos');
create policy "Authenticated users can upload photos" on storage.objects for insert with check (bucket_id = 'memorial-photos' and auth.role() = 'authenticated');
create policy "Users can delete own uploads" on storage.objects for delete using (bucket_id = 'memorial-photos' and auth.uid()::text = (storage.foldername(name))[1]);
