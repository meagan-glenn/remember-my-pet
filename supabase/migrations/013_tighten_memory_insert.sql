-- The old INSERT policy had `with check (true)`, so anyone holding the public
-- anon key could POST directly to PostgREST with is_approved = true and put
-- content straight onto a public memory wall, bypassing moderation and the
-- owner's allow_memories toggle. Constrain direct inserts to pending memories
-- on published memorials that accept them. The app's own /api/memories route
-- uses the service client and is unaffected.
drop policy "Anyone can submit a memory" on public.memories;

create policy "Anyone can submit a pending memory" on public.memories
  for insert with check (
    is_approved = false
    and moderation_status = 'pending'
    and exists (
      select 1 from public.memorials m
      where m.id = memorial_id
        and m.is_published
        and coalesce(m.allow_memories, true)
    )
  );
