-- Snip — database schema (Supabase / Postgres)
-- Idempotent: safe to run more than once in the Supabase SQL Editor.

create extension if not exists "pgcrypto";

-- ───────────────────────────── Tables ─────────────────────────────

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  full_name text,
  phone text,
  role text not null default 'customer' check (role in ('customer', 'designer', 'admin')),
  created_at timestamptz not null default now()
);

create table if not exists public.studios (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid unique references public.profiles (id) on delete cascade,
  slug text unique not null,
  name text not null,
  kind text not null default 'Tailor',
  tagline text,
  bio text,
  area text,
  city text not null default 'Delhi',
  address text,
  lat double precision,
  lng double precision,
  phone text,
  email text,
  instagram text,
  categories text[] not null default '{}',
  starting_price integer not null default 0,
  home_visits boolean not null default true,
  studio_visits boolean not null default true,
  cover_url text,
  photos text[] not null default '{}',
  rating numeric(2,1) not null default 0,
  review_count integer not null default 0,
  status text not null default 'pending' check (status in ('pending', 'verified', 'rejected')),
  plan text not null default 'free' check (plan in ('free', 'premium', 'priority')),
  plan_renews_at timestamptz,
  dodo_customer_id text,
  dodo_subscription_id text,
  snip_code text unique default ('SN-' || lpad((floor(random() * 9000) + 1000)::text, 4, '0')),
  created_at timestamptz not null default now()
);

create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  studio_id uuid not null references public.studios (id) on delete cascade,
  name text not null,
  description text,
  price integer not null default 0,
  duration_mins integer not null default 60,
  sort integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  studio_id uuid not null references public.studios (id) on delete cascade,
  name text not null,
  phone text,
  email text,
  address text,
  notes text,
  measurements jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  studio_id uuid not null references public.studios (id) on delete cascade,
  customer_id uuid references public.profiles (id) on delete set null,
  service_id uuid references public.services (id) on delete set null,
  service_name text not null,
  mode text not null default 'home' check (mode in ('home', 'studio')),
  scheduled_at timestamptz not null,
  address text,
  notes text,
  customer_name text,
  customer_phone text,
  customer_email text,
  status text not null default 'requested'
    check (status in ('requested', 'confirmed', 'declined', 'completed', 'cancelled')),
  client_id uuid references public.clients (id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  studio_id uuid not null references public.studios (id) on delete cascade,
  client_id uuid references public.clients (id) on delete set null,
  title text not null,
  garment text,
  stage text not null default 'received'
    check (stage in ('received', 'cutting', 'stitching', 'trial', 'ready', 'delivered')),
  due_date date,
  price integer not null default 0,
  paid integer not null default 0,
  fabric_photos text[] not null default '{}',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  studio_id uuid not null references public.studios (id) on delete cascade,
  booking_id uuid unique references public.bookings (id) on delete cascade,
  customer_id uuid references public.profiles (id) on delete set null,
  author_name text,
  rating integer not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now()
);

create index if not exists studios_status_idx on public.studios (status, plan);
create index if not exists bookings_studio_idx on public.bookings (studio_id, scheduled_at);
create index if not exists bookings_customer_idx on public.bookings (customer_id);
create index if not exists orders_studio_idx on public.orders (studio_id, stage);
create index if not exists clients_studio_idx on public.clients (studio_id);
create index if not exists services_studio_idx on public.services (studio_id, sort);

-- ───────────────────────────── Helpers ─────────────────────────────

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

create or replace function public.owns_studio(sid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.studios where id = sid and owner_id = auth.uid());
$$;

-- New auth user → profile (+ pending studio for designers).
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  wanted text := coalesce(new.raw_user_meta_data ->> 'role', 'customer');
  display text := coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1));
  studio text;
  base_slug text;
begin
  if wanted not in ('customer', 'designer') then
    wanted := 'customer';  -- nobody can sign up as admin
  end if;

  insert into public.profiles (id, email, full_name, phone, role)
  values (new.id, new.email, display, new.raw_user_meta_data ->> 'phone', wanted)
  on conflict (id) do nothing;

  if wanted = 'designer' then
    studio := coalesce(nullif(new.raw_user_meta_data ->> 'studio_name', ''), display || '''s Studio');
    base_slug := trim(both '-' from regexp_replace(lower(studio), '[^a-z0-9]+', '-', 'g'));
    insert into public.studios (owner_id, name, slug, email, phone)
    values (new.id, studio, base_slug || '-' || substr(replace(new.id::text, '-', ''), 1, 5),
            new.email, new.raw_user_meta_data ->> 'phone')
    on conflict do nothing;
  end if;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Users can't change their own role. Admins (and the SQL editor / service role) can.
create or replace function public.guard_profile_role()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.role is distinct from old.role and auth.uid() is not null and not public.is_admin() then
    raise exception 'Only admins can change roles';
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_guard_role on public.profiles;
create trigger profiles_guard_role before update on public.profiles
  for each row execute function public.guard_profile_role();

-- Owners can edit their listing but not status, plan, billing or ratings.
create or replace function public.guard_studio_fields()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is not null and not public.is_admin() then
    if new.status is distinct from old.status
       or new.plan is distinct from old.plan
       or new.plan_renews_at is distinct from old.plan_renews_at
       or new.dodo_subscription_id is distinct from old.dodo_subscription_id
       or new.rating is distinct from old.rating
       or new.review_count is distinct from old.review_count
       or new.owner_id is distinct from old.owner_id
       or new.snip_code is distinct from old.snip_code then
      raise exception 'Only admins can change verification, plan or rating fields';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists studios_guard on public.studios;
create trigger studios_guard before update on public.studios
  for each row execute function public.guard_studio_fields();

-- Customers may only cancel their own bookings; studios manage status.
create or replace function public.guard_booking_update()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null or public.is_admin() or public.owns_studio(old.studio_id) then
    return new;
  end if;
  if old.customer_id = auth.uid() and new.status = 'cancelled'
     and old.status in ('requested', 'confirmed') then
    return new;
  end if;
  raise exception 'Not allowed to change this booking';
end;
$$;

drop trigger if exists bookings_guard on public.bookings;
create trigger bookings_guard before update on public.bookings
  for each row execute function public.guard_booking_update();

-- Ratings recalculate from reviews.
create or replace function public.refresh_studio_rating()
returns trigger language plpgsql security definer set search_path = public as $$
declare sid uuid := coalesce(new.studio_id, old.studio_id);
begin
  update public.studios s set
    rating = coalesce((select round(avg(rating)::numeric, 1) from public.reviews where studio_id = sid), 0),
    review_count = (select count(*) from public.reviews where studio_id = sid)
  where s.id = sid;
  return null;
end;
$$;

drop trigger if exists reviews_refresh_rating on public.reviews;
create trigger reviews_refresh_rating after insert or update or delete on public.reviews
  for each row execute function public.refresh_studio_rating();

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at := now(); return new; end;
$$;

drop trigger if exists orders_touch on public.orders;
create trigger orders_touch before update on public.orders
  for each row execute function public.touch_updated_at();

-- ───────────────────────────── Row-level security ─────────────────────────────

alter table public.profiles enable row level security;
alter table public.studios enable row level security;
alter table public.services enable row level security;
alter table public.clients enable row level security;
alter table public.bookings enable row level security;
alter table public.orders enable row level security;
alter table public.reviews enable row level security;

-- profiles
drop policy if exists "profiles: read own or admin" on public.profiles;
create policy "profiles: read own or admin" on public.profiles
  for select using (id = auth.uid() or public.is_admin());
drop policy if exists "profiles: update own or admin" on public.profiles;
create policy "profiles: update own or admin" on public.profiles
  for update using (id = auth.uid() or public.is_admin());

-- studios
drop policy if exists "studios: public read verified" on public.studios;
create policy "studios: public read verified" on public.studios
  for select using (status = 'verified' or owner_id = auth.uid() or public.is_admin());
drop policy if exists "studios: owner update" on public.studios;
create policy "studios: owner update" on public.studios
  for update using (owner_id = auth.uid() or public.is_admin());
drop policy if exists "studios: designer insert own" on public.studios;
create policy "studios: designer insert own" on public.studios
  for insert with check (
    owner_id = auth.uid()
    and exists (select 1 from public.profiles where id = auth.uid() and role in ('designer', 'admin'))
    and status = 'pending' and plan = 'free'
  );
drop policy if exists "studios: admin delete" on public.studios;
create policy "studios: admin delete" on public.studios
  for delete using (public.is_admin());

-- services
drop policy if exists "services: read with studio" on public.services;
create policy "services: read with studio" on public.services
  for select using (
    exists (select 1 from public.studios s where s.id = studio_id
            and (s.status = 'verified' or s.owner_id = auth.uid() or public.is_admin()))
  );
drop policy if exists "services: owner write" on public.services;
create policy "services: owner write" on public.services
  for all using (public.owns_studio(studio_id) or public.is_admin())
  with check (public.owns_studio(studio_id) or public.is_admin());

-- clients (CRM): studio owner only
drop policy if exists "clients: owner all" on public.clients;
create policy "clients: owner all" on public.clients
  for all using (public.owns_studio(studio_id)) with check (public.owns_studio(studio_id));

-- orders (CRM): studio owner only
drop policy if exists "orders: owner all" on public.orders;
create policy "orders: owner all" on public.orders
  for all using (public.owns_studio(studio_id)) with check (public.owns_studio(studio_id));

-- bookings
drop policy if exists "bookings: read party" on public.bookings;
create policy "bookings: read party" on public.bookings
  for select using (customer_id = auth.uid() or public.owns_studio(studio_id) or public.is_admin());
drop policy if exists "bookings: customer create" on public.bookings;
create policy "bookings: customer create" on public.bookings
  for insert with check (
    customer_id = auth.uid()
    and status = 'requested'
    and exists (select 1 from public.studios s where s.id = studio_id and s.status = 'verified')
  );
drop policy if exists "bookings: party update" on public.bookings;
create policy "bookings: party update" on public.bookings
  for update using (customer_id = auth.uid() or public.owns_studio(studio_id) or public.is_admin());

-- reviews
drop policy if exists "reviews: public read" on public.reviews;
create policy "reviews: public read" on public.reviews for select using (true);
drop policy if exists "reviews: after completed booking" on public.reviews;
create policy "reviews: after completed booking" on public.reviews
  for insert with check (
    customer_id = auth.uid()
    and exists (
      select 1 from public.bookings b
      where b.id = booking_id and b.customer_id = auth.uid()
        and b.studio_id = reviews.studio_id and b.status = 'completed'
    )
  );

-- ───────────────────────────── Storage ─────────────────────────────
-- Public bucket for studio photos and fabric photos. Each user writes only to a folder named after their user id.

insert into storage.buckets (id, name, public)
values ('snip', 'snip', true)
on conflict (id) do update set public = true;

drop policy if exists "snip: public read" on storage.objects;
create policy "snip: public read" on storage.objects
  for select using (bucket_id = 'snip');
drop policy if exists "snip: upload own folder" on storage.objects;
create policy "snip: upload own folder" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'snip' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "snip: delete own files" on storage.objects;
create policy "snip: delete own files" on storage.objects
  for delete to authenticated
  using (bucket_id = 'snip' and (storage.foldername(name))[1] = auth.uid()::text);
