-- Add opt-in feed column (defaults to false — creator must explicitly opt in)
ALTER TABLE public.memorials
  ADD COLUMN show_in_feed boolean DEFAULT false NOT NULL;

-- Index for efficient feed queries: published + opted-in, ordered by recency
CREATE INDEX memorials_feed_idx
  ON public.memorials (created_at DESC)
  WHERE is_published = true AND show_in_feed = true;
