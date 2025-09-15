-- Recreate public.profiles table, RLS policies, and signup trigger to fix auth callback errors
-- 1) Table
create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  full_name text,
  first_name text,
  last_name text,
  avatar_url text,
  bio text,
  location_city text,
  location_province text,
  phone text,
  whatsapp_phone text,
  skills text[],
  portfolio_images text[],
  role text,
  onboarding_completed boolean,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2) RLS
alter table public.profiles enable row level security;

-- Clean existing policies to avoid duplicates
do $$ begin
  if exists (select 1 from pg_policies where schemaname='public' and tablename='profiles') then
    -- drop all existing policies on profiles
    for pol in select policyname from pg_policies where schemaname='public' and tablename='profiles' loop
      execute format('drop policy if exists %I on public.profiles', pol.policyname);
    end loop;
  end if;
end $$;

-- Only owners can select/insert/update their rows
create policy "Users can view their own profiles"
  on public.profiles for select
  using (auth.uid() = user_id);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = user_id);

-- 3) updated_at trigger
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql set search_path = public;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row execute function public.update_updated_at_column();

-- 4) Create/replace signup trigger to auto-insert a profile row on new auth user
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (
    user_id,
    full_name,
    first_name,
    last_name,
    avatar_url,
    onboarding_completed
  ) values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    coalesce(new.raw_user_meta_data->>'given_name', split_part(coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'), ' ', 1)),
    coalesce(new.raw_user_meta_data->>'family_name', null),
    new.raw_user_meta_data->>'avatar_url',
    false
  ) on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
