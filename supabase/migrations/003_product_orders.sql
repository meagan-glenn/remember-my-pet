-- Product orders for print-on-demand (Gelato)
create table public.product_orders (
  id uuid default gen_random_uuid() primary key,
  memorial_id uuid references public.memorials on delete cascade not null,
  user_id uuid references public.users not null,
  product_type text not null check (product_type in ('memory_book', 'canvas_print')),
  gelato_store_id text,
  gelato_order_id text,
  status text default 'draft' check (status in ('draft', 'preview', 'ordered', 'production', 'shipped', 'delivered', 'cancelled')),
  preview_url text,
  price_cents integer,
  currency text default 'USD',
  shipping_name text,
  shipping_address jsonb,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- RLS
alter table public.product_orders enable row level security;

create policy "Users can view own orders"
  on public.product_orders for select
  using (auth.uid() = user_id);

create policy "Users can create own orders"
  on public.product_orders for insert
  with check (auth.uid() = user_id);

create policy "Users can update own orders"
  on public.product_orders for update
  using (auth.uid() = user_id);

-- Index for lookups
create index idx_product_orders_memorial on public.product_orders(memorial_id);
create index idx_product_orders_user on public.product_orders(user_id);
