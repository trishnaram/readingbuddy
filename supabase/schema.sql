-- ReadingBuddy schema
-- Run this in the Supabase SQL editor (Dashboard -> SQL Editor -> New query -> paste -> Run)
-- Safe to re-run: existing tables and data are kept, policies are recreated.

-- ============ profiles ============
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text,
  lexile int,                        -- estimated lexile number, e.g. 650
  band text,                         -- Sprout | Explorer | Voyager | Champion
  diagnostic_done boolean default false,
  settings jsonb default '{}'::jsonb, -- accessibility prefs
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;

drop policy if exists "read own profile" on public.profiles;
create policy "read own profile"   on public.profiles for select using (auth.uid() = id);
drop policy if exists "insert own profile" on public.profiles;
create policy "insert own profile" on public.profiles for insert with check (auth.uid() = id);
drop policy if exists "update own profile" on public.profiles;
create policy "update own profile" on public.profiles for update using (auth.uid() = id);

-- auto-create a profile row when a user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, username)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'username', split_part(new.email, '@', 1)));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============ lesson progress ============
create table if not exists public.lesson_progress (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  lesson_id text not null,
  completed_at timestamptz default now(),
  unique (user_id, lesson_id)
);

alter table public.lesson_progress enable row level security;
drop policy if exists "own progress select" on public.lesson_progress;
create policy "own progress select" on public.lesson_progress for select using (auth.uid() = user_id);
drop policy if exists "own progress insert" on public.lesson_progress;
create policy "own progress insert" on public.lesson_progress for insert with check (auth.uid() = user_id);

-- ============ quiz results ============
create table if not exists public.quiz_results (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  lesson_id text,                    -- null for the diagnostic
  kind text default 'lesson',        -- 'lesson' | 'diagnostic'
  score int not null,
  total int not null,
  created_at timestamptz default now()
);

alter table public.quiz_results enable row level security;
drop policy if exists "own results select" on public.quiz_results;
create policy "own results select" on public.quiz_results for select using (auth.uid() = user_id);
drop policy if exists "own results insert" on public.quiz_results;
create policy "own results insert" on public.quiz_results for insert with check (auth.uid() = user_id);

-- ============ reading log ============
create table if not exists public.reading_log (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  gutenberg_id int,
  title text,
  author text,
  created_at timestamptz default now()
);

alter table public.reading_log enable row level security;
drop policy if exists "own log select" on public.reading_log;
create policy "own log select" on public.reading_log for select using (auth.uid() = user_id);
drop policy if exists "own log insert" on public.reading_log;
create policy "own log insert" on public.reading_log for insert with check (auth.uid() = user_id);

-- ============ LLM usage (rate limiting) ============
-- Written only by the `llm` edge function with the service role key, so no
-- client policies: RLS on with nothing granted means browsers can't touch it.
create table if not exists public.llm_usage (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz default now()
);

alter table public.llm_usage enable row level security;
create index if not exists llm_usage_user_time on public.llm_usage (user_id, created_at);
create index if not exists llm_usage_time on public.llm_usage (created_at);
