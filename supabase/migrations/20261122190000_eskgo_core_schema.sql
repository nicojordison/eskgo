-- Eskgo core schema
-- Apply with Supabase SQL Editor or `supabase db push` after review.

create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  email text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  name text not null,
  kind text not null default 'expense' check (kind in ('expense', 'income')),
  color text,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint categories_name_nonempty check (length(trim(name)) > 0)
);

create table if not exists public.cards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  last_four char(4) not null check (last_four ~ '^[0-9]{4}$'),
  credit_limit numeric(14,2) not null check (credit_limit >= 0),
  closing_day smallint not null check (closing_day between 1 and 31),
  due_day smallint not null check (due_day between 1 and 31),
  brand text,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  description text not null,
  amount numeric(14,2) not null check (amount <> 0),
  category_id uuid references public.categories(id) on delete set null,
  card_id uuid references public.cards(id) on delete set null,
  occurred_at date not null default current_date,
  notes text,
  source text not null default 'manual' check (source in ('manual', 'invoice')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  target_amount numeric(14,2) not null check (target_amount > 0),
  target_date date,
  status text not null default 'active' check (status in ('active', 'completed', 'archived')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.goal_contributions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  goal_id uuid not null references public.goals(id) on delete cascade,
  amount numeric(14,2) not null check (amount > 0),
  contributed_at date not null default current_date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.budgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category_id uuid not null references public.categories(id) on delete cascade,
  period date not null,
  limit_amount numeric(14,2) not null check (limit_amount >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, category_id, period)
);

create table if not exists public.invoice_imports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  file_name text not null,
  storage_path text,
  status text not null default 'draft' check (status in ('draft', 'processing', 'review', 'confirmed', 'cancelled', 'failed')),
  uploaded_at timestamptz not null default now(),
  processed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.invoice_lines (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  invoice_import_id uuid not null references public.invoice_imports(id) on delete cascade,
  description text not null,
  amount numeric(14,2) not null check (amount <> 0),
  occurred_at date,
  category_id uuid references public.categories(id) on delete set null,
  card_id uuid references public.cards(id) on delete set null,
  selected boolean not null default true,
  transaction_id uuid references public.transactions(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists transactions_user_occurred_idx on public.transactions(user_id, occurred_at desc);
create index if not exists transactions_user_card_idx on public.transactions(user_id, card_id);
create index if not exists goals_user_status_idx on public.goals(user_id, status);
create index if not exists contributions_user_goal_idx on public.goal_contributions(user_id, goal_id, contributed_at desc);
create index if not exists budgets_user_period_idx on public.budgets(user_id, period);
create index if not exists invoice_imports_user_created_idx on public.invoice_imports(user_id, created_at desc);
create index if not exists invoice_lines_user_import_idx on public.invoice_lines(user_id, invoice_import_id);

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at before update on public.profiles for each row execute function public.set_updated_at();
drop trigger if exists categories_set_updated_at on public.categories;
create trigger categories_set_updated_at before update on public.categories for each row execute function public.set_updated_at();
drop trigger if exists cards_set_updated_at on public.cards;
create trigger cards_set_updated_at before update on public.cards for each row execute function public.set_updated_at();
drop trigger if exists transactions_set_updated_at on public.transactions;
create trigger transactions_set_updated_at before update on public.transactions for each row execute function public.set_updated_at();
drop trigger if exists goals_set_updated_at on public.goals;
create trigger goals_set_updated_at before update on public.goals for each row execute function public.set_updated_at();
drop trigger if exists contributions_set_updated_at on public.goal_contributions;
create trigger contributions_set_updated_at before update on public.goal_contributions for each row execute function public.set_updated_at();
drop trigger if exists budgets_set_updated_at on public.budgets;
create trigger budgets_set_updated_at before update on public.budgets for each row execute function public.set_updated_at();
drop trigger if exists invoice_imports_set_updated_at on public.invoice_imports;
create trigger invoice_imports_set_updated_at before update on public.invoice_imports for each row execute function public.set_updated_at();
drop trigger if exists invoice_lines_set_updated_at on public.invoice_lines;
create trigger invoice_lines_set_updated_at before update on public.invoice_lines for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data ->> 'name', new.raw_user_meta_data ->> 'full_name'))
  on conflict (id) do update set email = excluded.email;
  return new;
end;
$$;

revoke execute on function public.handle_new_user() from public, anon, authenticated;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.cards enable row level security;
alter table public.transactions enable row level security;
alter table public.goals enable row level security;
alter table public.goal_contributions enable row level security;
alter table public.budgets enable row level security;
alter table public.invoice_imports enable row level security;
alter table public.invoice_lines enable row level security;

drop policy if exists profiles_owner_all on public.profiles;
create policy profiles_owner_all on public.profiles for all to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

drop policy if exists categories_read on public.categories;
create policy categories_read on public.categories for select to authenticated using (user_id is null or (select auth.uid()) = user_id);
drop policy if exists categories_owner_write on public.categories;
create policy categories_owner_write on public.categories for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

create or replace function public.create_owner_policies(target_table regclass)
returns void language plpgsql as $$
declare table_name text := target_table::text;
begin
  execute format('drop policy if exists %I_owner_all on %s', table_name, target_table);
  execute format('create policy %I_owner_all on %s for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id)', table_name, target_table);
end;
$$;

select public.create_owner_policies('public.cards'::regclass);
select public.create_owner_policies('public.transactions'::regclass);
select public.create_owner_policies('public.goals'::regclass);
select public.create_owner_policies('public.goal_contributions'::regclass);
select public.create_owner_policies('public.budgets'::regclass);
select public.create_owner_policies('public.invoice_imports'::regclass);
select public.create_owner_policies('public.invoice_lines'::regclass);
drop function public.create_owner_policies(regclass);

insert into public.categories (user_id, name, kind, color)
values
  (null, 'Alimentação', 'expense', '#E5FFB5'),
  (null, 'Transporte', 'expense', '#D8CCFA'),
  (null, 'Assinaturas', 'expense', '#F5D0FE'),
  (null, 'Moradia', 'expense', '#BFDBFE'),
  (null, 'Salário', 'income', '#BBF7D0')
on conflict do nothing;

insert into storage.buckets (id, name, public)
values ('invoice-files', 'invoice-files', false)
on conflict (id) do update set public = excluded.public;

drop policy if exists invoice_files_read on storage.objects;
create policy invoice_files_read on storage.objects for select to authenticated using (bucket_id = 'invoice-files' and (storage.foldername(name))[1] = (select auth.uid())::text);
drop policy if exists invoice_files_insert on storage.objects;
create policy invoice_files_insert on storage.objects for insert to authenticated with check (bucket_id = 'invoice-files' and (storage.foldername(name))[1] = (select auth.uid())::text);
drop policy if exists invoice_files_update on storage.objects;
create policy invoice_files_update on storage.objects for update to authenticated using (bucket_id = 'invoice-files' and (storage.foldername(name))[1] = (select auth.uid())::text) with check (bucket_id = 'invoice-files' and (storage.foldername(name))[1] = (select auth.uid())::text);
drop policy if exists invoice_files_delete on storage.objects;
create policy invoice_files_delete on storage.objects for delete to authenticated using (bucket_id = 'invoice-files' and (storage.foldername(name))[1] = (select auth.uid())::text);

grant usage on schema public to authenticated;
grant select, insert, update, delete on table public.profiles, public.categories, public.cards, public.transactions, public.goals, public.goal_contributions, public.budgets, public.invoice_imports, public.invoice_lines to authenticated;
grant usage, select on all sequences in schema public to authenticated;
grant select, insert, update, delete on table storage.objects to authenticated;
