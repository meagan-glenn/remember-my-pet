-- Add display_name column to users table
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS display_name TEXT;

-- Backfill existing users from email prefix
UPDATE public.users SET display_name = split_part(email, '@', 1) WHERE display_name IS NULL;

-- Update trigger so new signups get display_name
-- Uses Google profile name (full_name from raw_user_meta_data) when available,
-- otherwise falls back to email prefix
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, display_name)
  VALUES (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1))
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
