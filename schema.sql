-- ============================================================
-- Provision Planner — Database Schema
-- Run this in Supabase: Dashboard → SQL Editor → paste & run
-- ============================================================

create extension if not exists "uuid-ossp";

-- Profiles (auto-created on sign-up via trigger)
create table if not exists profiles (
  user_id      uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at   timestamptz default now()
);

create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into profiles (user_id, display_name)
  values (new.id, new.raw_user_meta_data->>'display_name');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- Saved verses — stores verse content directly (no verses table FK needed)
create table if not exists saved_verses (
  id                  uuid primary key default uuid_generate_v4(),
  user_id             uuid not null references auth.users(id) on delete cascade,
  verse_reference     text not null,
  verse_text          text not null,
  verse_translation   text not null default 'ESV',
  verse_reflection    text not null default '',
  created_at          timestamptz default now(),
  unique (user_id, verse_reference)
);

-- Task lists
create table if not exists task_lists (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  name       text not null,
  created_at timestamptz default now()
);

-- Tasks
create table if not exists tasks (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  list_id    uuid not null references task_lists(id) on delete cascade,
  title      text not null,
  notes      text,
  due_date   date,
  priority   text not null default 'normal',
  completed  boolean not null default false,
  created_at timestamptz default now()
);

-- Meal plan weeks
create table if not exists meal_plan_weeks (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  week_start date not null,
  created_at timestamptz default now(),
  unique (user_id, week_start)
);

-- Meal plan entries
create table if not exists meal_plan_entries (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  week_id     uuid not null references meal_plan_weeks(id) on delete cascade,
  day_of_week int not null check (day_of_week between 0 and 6),
  meal_type   text not null,
  name        text not null,
  notes       text,
  ingredients text,
  created_at  timestamptz default now()
);

-- Grocery items
create table if not exists grocery_items (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  week_id    uuid references meal_plan_weeks(id) on delete set null,
  name       text not null,
  quantity   text,
  category   text not null default 'other',
  source     text not null default 'manual',
  checked    boolean not null default false,
  created_at timestamptz default now()
);

-- Pantry items
create table if not exists pantry_items (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  name       text not null,
  category   text not null default 'pantry',
  quantity   text,
  is_low     boolean not null default false,
  created_at timestamptz default now()
);

-- Reminders
create table if not exists reminders (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  title      text not null,
  notes      text,
  remind_at  timestamptz not null,
  completed  boolean not null default false,
  created_at timestamptz default now()
);

-- ============================================================
-- Row Level Security
-- ============================================================
alter table profiles          enable row level security;
alter table saved_verses      enable row level security;
alter table task_lists        enable row level security;
alter table tasks             enable row level security;
alter table meal_plan_weeks   enable row level security;
alter table meal_plan_entries enable row level security;
alter table grocery_items     enable row level security;
alter table pantry_items      enable row level security;
alter table reminders         enable row level security;

create policy "Users manage own profiles"       on profiles          for all using (auth.uid() = user_id);
create policy "Users manage own saved verses"   on saved_verses      for all using (auth.uid() = user_id);
create policy "Users manage own task lists"     on task_lists        for all using (auth.uid() = user_id);
create policy "Users manage own tasks"          on tasks             for all using (auth.uid() = user_id);
create policy "Users manage own meal weeks"     on meal_plan_weeks   for all using (auth.uid() = user_id);
create policy "Users manage own meal entries"   on meal_plan_entries for all using (auth.uid() = user_id);
create policy "Users manage own grocery items"  on grocery_items     for all using (auth.uid() = user_id);
create policy "Users manage own pantry items"   on pantry_items      for all using (auth.uid() = user_id);
create policy "Users manage own reminders"      on reminders         for all using (auth.uid() = user_id);
