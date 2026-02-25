-- Security hardening migration:
-- 1. Add DELETE RLS policy for memories table
-- 2. Add DELETE RLS policy for product_orders table
-- 3. Create memorial-videos storage bucket with RLS policies

-- 1. Missing DELETE policy on memories (owners can delete memories on their memorials)
create policy "Owners can delete memories on their memorials"
  on public.memories for delete
  using (
    exists (
      select 1 from public.memorials
      where id = memorial_id and user_id = auth.uid()
    )
  );

-- 2. Missing DELETE policy on product_orders (users can delete own orders)
create policy "Users can delete own orders"
  on public.product_orders for delete
  using (auth.uid() = user_id);

-- 3. Create memorial-videos storage bucket if it doesn't exist
insert into storage.buckets (id, name, public)
values ('memorial-videos', 'memorial-videos', true)
on conflict (id) do nothing;

-- Storage policies for memorial-videos
create policy "Anyone can view memorial videos"
  on storage.objects for select
  using (bucket_id = 'memorial-videos');

create policy "Authenticated users can upload videos"
  on storage.objects for insert
  with check (bucket_id = 'memorial-videos' and auth.role() = 'authenticated');

create policy "Users can delete own video uploads"
  on storage.objects for delete
  using (bucket_id = 'memorial-videos' and auth.uid()::text = (storage.foldername(name))[1]);
