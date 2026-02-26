-- Track whether the welcome email has been sent to prevent duplicates
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS welcome_email_sent BOOLEAN DEFAULT FALSE;
