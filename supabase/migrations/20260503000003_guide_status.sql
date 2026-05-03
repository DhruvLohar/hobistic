create type public.guide_status as enum ('processing', 'completed');

alter table public.guides
  add column status public.guide_status not null default 'processing';
