create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 60),
  url text not null check (url ~ '^https?://'),
  description text not null check (char_length(description) between 1 and 240),
  category text not null check (char_length(category) between 1 and 30),
  published boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.project_shelf_admins (
  user_id uuid primary key references auth.users(id) on delete cascade
);

alter table public.projects enable row level security;
alter table public.project_shelf_admins enable row level security;

revoke all on table public.project_shelf_admins from anon, authenticated;
grant select on table public.projects to anon, authenticated;
grant insert, update, delete on table public.projects to authenticated;

create or replace function public.is_project_shelf_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.project_shelf_admins
    where user_id = (select auth.uid())
  );
$$;

revoke all on function public.is_project_shelf_admin() from public;
grant execute on function public.is_project_shelf_admin() to authenticated;

drop policy if exists "Anyone can view published projects" on public.projects;
create policy "Anyone can view published projects"
  on public.projects for select
  to anon, authenticated
  using (published = true);

drop policy if exists "Admins can add projects" on public.projects;
create policy "Admins can add projects"
  on public.projects for insert
  to authenticated
  with check ((select public.is_project_shelf_admin()));

drop policy if exists "Admins can update projects" on public.projects;
create policy "Admins can update projects"
  on public.projects for update
  to authenticated
  using ((select public.is_project_shelf_admin()))
  with check ((select public.is_project_shelf_admin()));

drop policy if exists "Admins can remove projects" on public.projects;
create policy "Admins can remove projects"
  on public.projects for delete
  to authenticated
  using ((select public.is_project_shelf_admin()));

-- After creating your owner account in Supabase, run this once with its user ID:
-- insert into public.project_shelf_admins (user_id) values ('YOUR-AUTH-USER-UUID');
