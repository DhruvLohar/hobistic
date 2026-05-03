-- Replace single image_url on subtopics with a dedicated subtopic_images table

alter table public.subtopics drop column if exists image_url;

create table public.subtopic_images (
  id uuid default gen_random_uuid() primary key,
  subtopic_id uuid references public.subtopics(id) on delete cascade not null,
  url text not null,
  sort_order int not null default 0
);

create index idx_subtopic_images_subtopic_id on public.subtopic_images(subtopic_id);

alter table public.subtopic_images enable row level security;

create policy "Users can view own subtopic images"
  on public.subtopic_images for select
  using (
    exists (
      select 1 from public.subtopics
      join public.techniques on techniques.id = subtopics.technique_id
      join public.guides on guides.id = techniques.guide_id
      where subtopics.id = subtopic_images.subtopic_id
        and guides.user_id = auth.uid()
    )
  );

create policy "Users can insert own subtopic images"
  on public.subtopic_images for insert
  with check (
    exists (
      select 1 from public.subtopics
      join public.techniques on techniques.id = subtopics.technique_id
      join public.guides on guides.id = techniques.guide_id
      where subtopics.id = subtopic_images.subtopic_id
        and guides.user_id = auth.uid()
    )
  );
