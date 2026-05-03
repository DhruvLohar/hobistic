-- ============================================================
-- ENUMS
-- ============================================================

create type public.lifestyle_type as enum (
  'student',
  'working',
  'business',
  'content-creator',
  'freelancer',
  'homemaker',
  'retired'
);

create type public.purpose_type as enum (
  'escape-routine',
  'explore-new',
  'master-skill',
  'mental-wellness'
);

-- ============================================================
-- PROFILES
-- ============================================================

create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  display_name text,
  avatar_url text,
  onboarding_completed boolean default false not null,
  hobbies text[] default '{}'::text[] not null,
  lifestyle public.lifestyle_type,
  purpose public.purpose_type,
  created_at timestamptz default timezone('utc', now()) not null,
  updated_at timestamptz default timezone('utc', now()) not null
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Auto-create a profile row whenever a new auth user is created
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id)
  values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- GUIDES
-- ============================================================

create table public.guides (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  hobby text not null,
  genre text not null,
  time_per_day text not null,
  reason_of_learning text not null,
  is_first_time boolean default true not null,
  created_at timestamptz default timezone('utc', now()) not null
);

create index idx_guides_user_id on public.guides(user_id);

alter table public.guides enable row level security;

create policy "Users can view own guides"
  on public.guides for select
  using (auth.uid() = user_id);

create policy "Users can insert own guides"
  on public.guides for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own guides"
  on public.guides for delete
  using (auth.uid() = user_id);

-- ============================================================
-- TECHNIQUES
-- ============================================================

create table public.techniques (
  id uuid default gen_random_uuid() primary key,
  guide_id uuid references public.guides(id) on delete cascade not null,
  title text not null,
  sort_order int not null default 0
);

create index idx_techniques_guide_id on public.techniques(guide_id);

alter table public.techniques enable row level security;

create policy "Users can view own techniques"
  on public.techniques for select
  using (
    exists (
      select 1 from public.guides
      where guides.id = techniques.guide_id
        and guides.user_id = auth.uid()
    )
  );

create policy "Users can insert own techniques"
  on public.techniques for insert
  with check (
    exists (
      select 1 from public.guides
      where guides.id = techniques.guide_id
        and guides.user_id = auth.uid()
    )
  );

-- ============================================================
-- SUBTOPICS
-- ============================================================

create table public.subtopics (
  id uuid default gen_random_uuid() primary key,
  technique_id uuid references public.techniques(id) on delete cascade not null,
  title text not null,
  text text not null,
  image_keyword text,
  yt_keyword text,
  content text,
  image_url text,
  sort_order int not null default 0
);

create index idx_subtopics_technique_id on public.subtopics(technique_id);

alter table public.subtopics enable row level security;

create policy "Users can view own subtopics"
  on public.subtopics for select
  using (
    exists (
      select 1 from public.techniques
      join public.guides on guides.id = techniques.guide_id
      where techniques.id = subtopics.technique_id
        and guides.user_id = auth.uid()
    )
  );

create policy "Users can insert own subtopics"
  on public.subtopics for insert
  with check (
    exists (
      select 1 from public.techniques
      join public.guides on guides.id = techniques.guide_id
      where techniques.id = subtopics.technique_id
        and guides.user_id = auth.uid()
    )
  );

-- ============================================================
-- SUBTOPIC VIDEOS
-- ============================================================

create table public.subtopic_videos (
  id uuid default gen_random_uuid() primary key,
  subtopic_id uuid references public.subtopics(id) on delete cascade not null,
  title text not null,
  url text not null,
  thumbnail text
);

create index idx_subtopic_videos_subtopic_id on public.subtopic_videos(subtopic_id);

alter table public.subtopic_videos enable row level security;

create policy "Users can view own subtopic videos"
  on public.subtopic_videos for select
  using (
    exists (
      select 1 from public.subtopics
      join public.techniques on techniques.id = subtopics.technique_id
      join public.guides on guides.id = techniques.guide_id
      where subtopics.id = subtopic_videos.subtopic_id
        and guides.user_id = auth.uid()
    )
  );

create policy "Users can insert own subtopic videos"
  on public.subtopic_videos for insert
  with check (
    exists (
      select 1 from public.subtopics
      join public.techniques on techniques.id = subtopics.technique_id
      join public.guides on guides.id = techniques.guide_id
      where subtopics.id = subtopic_videos.subtopic_id
        and guides.user_id = auth.uid()
    )
  );

-- ============================================================
-- ANALYTICS
-- ============================================================

create type public.app_event_type as enum (
  'LandingPageViewed',
  'OtpRequested',
  'OtpVerified',
  'OnboardingCompleted',
  'HobbyGuideCreated',
  'HobbyGuideViewed',
  'SubtopicViewed',
  'VideoPlayed',
  'HobbyGuideDeleted',
  'ProfileViewed',
  'ProfileUpdated',
  'ToggledTheme'
);

create table public.analytics_events (
  id uuid default gen_random_uuid() primary key,
  event public.app_event_type not null,
  event_data jsonb default '{}'::jsonb not null,
  created_at timestamptz default timezone('utc', now()) not null,
  user_id uuid references auth.users(id) on delete set null,
  device_id text
);

create index idx_analytics_event on public.analytics_events(event);
create index idx_analytics_user_id on public.analytics_events(user_id);
create index idx_analytics_created_at on public.analytics_events(created_at);

alter table public.analytics_events enable row level security;

create policy "Allow inserts for all app users"
  on public.analytics_events for insert
  with check (true);

create policy "Users can view own events"
  on public.analytics_events for select
  using (auth.uid() = user_id);
