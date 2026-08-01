-- Payment features removed: RememberMyPet is free-only.
-- Drops the print-on-demand order table (Stripe/Gelato code deleted from the
-- app) and the vestigial memorials.is_paid flag, which had become a mirror of
-- is_published.
--
-- Run this AFTER the code that stops referencing is_paid is deployed —
-- the old dashboard/memorial routes select and write that column.

drop table if exists public.product_orders;

alter table public.memorials drop column if exists is_paid;
