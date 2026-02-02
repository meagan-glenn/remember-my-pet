-- Add gender column for pronoun support
ALTER TABLE public.memorials ADD COLUMN gender text CHECK (gender IN ('male', 'female', 'neutral'));

-- Add species columns (already collected in UI but never persisted)
ALTER TABLE public.memorials ADD COLUMN species text;
ALTER TABLE public.memorials ADD COLUMN custom_species text;
