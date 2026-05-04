create table public.guide_subtopic_progress (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  guide_id uuid references public.guides(id) on delete cascade not null,
  subtopic_id uuid references public.subtopics(id) on delete cascade not null,
  is_unlocked boolean default false not null,
  unlocked_at timestamptz,
  is_completed boolean default false not null,
  completed_at timestamptz,
  created_at timestamptz default timezone('utc', now()) not null,
  updated_at timestamptz default timezone('utc', now()) not null,
  constraint guide_subtopic_progress_unique unique (user_id, guide_id, subtopic_id)
);

create index idx_guide_subtopic_progress_guide_user
  on public.guide_subtopic_progress(guide_id, user_id);
create index idx_guide_subtopic_progress_subtopic
  on public.guide_subtopic_progress(subtopic_id);

alter table public.guide_subtopic_progress enable row level security;

create policy "Users can view own guide subtopic progress"
  on public.guide_subtopic_progress for select
  using (auth.uid() = user_id);

create policy "Users can insert own guide subtopic progress"
  on public.guide_subtopic_progress for insert
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.guides
      where guides.id = guide_subtopic_progress.guide_id
        and guides.user_id = auth.uid()
    )
    and exists (
      select 1
      from public.subtopics
      join public.techniques on techniques.id = subtopics.technique_id
      where subtopics.id = guide_subtopic_progress.subtopic_id
        and techniques.guide_id = guide_subtopic_progress.guide_id
    )
  );

create policy "Users can update own guide subtopic progress"
  on public.guide_subtopic_progress for update
  using (auth.uid() = user_id)
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.guides
      where guides.id = guide_subtopic_progress.guide_id
        and guides.user_id = auth.uid()
    )
  );

create or replace function public.set_guide_subtopic_progress_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create trigger set_guide_subtopic_progress_updated_at
before update on public.guide_subtopic_progress
for each row execute procedure public.set_guide_subtopic_progress_updated_at();

with ordered_subtopics as (
  select
    guides.user_id,
    guides.id as guide_id,
    subtopics.id as subtopic_id,
    row_number() over (
      partition by guides.id
      order by techniques.sort_order, subtopics.sort_order, subtopics.id
    ) as row_num
  from public.guides
  join public.techniques on techniques.guide_id = guides.id
  join public.subtopics on subtopics.technique_id = techniques.id
)
insert into public.guide_subtopic_progress (
  user_id,
  guide_id,
  subtopic_id,
  is_unlocked,
  unlocked_at
)
select
  ordered_subtopics.user_id,
  ordered_subtopics.guide_id,
  ordered_subtopics.subtopic_id,
  ordered_subtopics.row_num = 1,
  case when ordered_subtopics.row_num = 1 then timezone('utc', now()) else null end
from ordered_subtopics
on conflict (user_id, guide_id, subtopic_id) do nothing;
