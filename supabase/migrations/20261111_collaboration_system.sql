create table if not exists public.profiles (
  id text primary key,
  name text not null,
  email text unique not null,
  avatar text,
  university text not null,
  cohort text,
  niche text,
  bio text,
  skills text[] not null default '{}',
  availability text,
  github text,
  linkedin text,
  rating numeric not null default 5,
  verified boolean not null default false,
  completed_projects integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.profiles
  add column if not exists avatar text,
  add column if not exists cohort text,
  add column if not exists niche text,
  add column if not exists bio text,
  add column if not exists skills text[] not null default '{}',
  add column if not exists availability text,
  add column if not exists github text,
  add column if not exists linkedin text,
  add column if not exists rating numeric not null default 5,
  add column if not exists verified boolean not null default false,
  add column if not exists completed_projects integer not null default 0,
  add column if not exists created_at timestamptz not null default now();

alter table public.profiles enable row level security;
grant select, insert, update on public.profiles to authenticated;
revoke all on public.profiles from anon;

drop policy if exists profiles_owner_read on public.profiles;
create policy profiles_owner_read on public.profiles
  for select to authenticated
  using (id = auth.uid()::text);

drop policy if exists profiles_owner_insert on public.profiles;
create policy profiles_owner_insert on public.profiles
  for insert to authenticated
  with check (id = auth.uid()::text);

drop policy if exists profiles_owner_update on public.profiles;
create policy profiles_owner_update on public.profiles
  for update to authenticated
  using (id = auth.uid()::text)
  with check (id = auth.uid()::text);

create or replace function public.guard_profile_update()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.id is distinct from old.id
    or new.email is distinct from old.email
    or new.rating is distinct from old.rating
    or new.verified is distinct from old.verified
    or new.completed_projects is distinct from old.completed_projects
    or new.created_at is distinct from old.created_at then
    raise exception 'Only profile owners may update public profile details';
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_guard_update on public.profiles;
create trigger profiles_guard_update
  before update on public.profiles
  for each row execute function public.guard_profile_update();

create or replace view public.public_profiles as
  select id, name, avatar, university, cohort, niche, bio, skills,
    availability, github, linkedin, rating, verified, completed_projects
  from public.profiles;
grant select on public.public_profiles to anon, authenticated;

create table if not exists public.projects (
  id text primary key,
  title text not null,
  category text not null,
  owner_id text not null,
  owner_name text not null,
  owner_university text,
  description text not null,
  required_skills text[] not null default '{}',
  open_spots integer not null default 2,
  total_spots integer not null default 4,
  members text[] not null default '{}',
  deadline text,
  status text not null default 'Recruiting Collaborators',
  architecture text,
  created_at timestamptz not null default now()
);

alter table public.projects
  add column if not exists required_skills text[] not null default '{}',
  add column if not exists open_spots integer not null default 2,
  add column if not exists total_spots integer not null default 4,
  add column if not exists members text[] not null default '{}',
  add column if not exists tasks jsonb not null default '[]'::jsonb,
  add column if not exists milestones jsonb not null default '[]'::jsonb,
  add column if not exists announcements jsonb not null default '[]'::jsonb,
  add column if not exists github_repo text,
  add column if not exists live_demo text;

create table if not exists public.requests (
  id text primary key,
  project_id text not null,
  project_title text not null,
  from_user_id text not null,
  from_user_name text not null,
  from_user_niche text,
  to_user_id text not null,
  message text,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

alter table public.requests
  add column if not exists created_at timestamptz not null default now();

create table if not exists public.messages (
  id text primary key,
  conversation_id text not null,
  sender_id text not null,
  sender_name text not null,
  sender_avatar text,
  receiver_id text not null,
  text text not null check (char_length(text) between 1 and 5000),
  created_at timestamptz not null default now(),
  constraint messages_distinct_participants check (sender_id <> receiver_id)
);

create index if not exists messages_sender_created_idx
  on public.messages (sender_id, created_at);
create index if not exists messages_receiver_created_idx
  on public.messages (receiver_id, created_at);

alter table public.projects enable row level security;
alter table public.requests enable row level security;
alter table public.messages enable row level security;

grant select on public.projects to anon, authenticated;
grant insert, update on public.projects to authenticated;
grant select, insert on public.requests to authenticated;
grant select, insert on public.messages to authenticated;
revoke update on public.requests from authenticated;

drop policy if exists projects_public_read on public.projects;
create policy projects_public_read on public.projects
  for select to anon, authenticated
  using (true);

drop policy if exists projects_member_insert on public.projects;
create policy projects_member_insert on public.projects
  for insert to authenticated
  with check (
    owner_id = auth.uid()::text
    and auth.uid()::text = any(coalesce(members, '{}'::text[]))
  );

drop policy if exists projects_member_update on public.projects;
create policy projects_member_update on public.projects
  for update to authenticated
  using (
    owner_id = auth.uid()::text
    or auth.uid()::text = any(coalesce(members, '{}'::text[]))
  )
  with check (
    owner_id = auth.uid()::text
    or auth.uid()::text = any(coalesce(members, '{}'::text[]))
  );

create or replace function public.guard_project_workspace_update()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if auth.uid()::text <> old.owner_id
    and pg_catalog.current_setting('collabforge.allow_membership_change', true) is distinct from 'on' then
    if new.id is distinct from old.id
      or new.created_at is distinct from old.created_at
      or new.owner_id is distinct from old.owner_id
      or new.title is distinct from old.title
      or new.category is distinct from old.category
      or new.owner_name is distinct from old.owner_name
      or new.owner_university is distinct from old.owner_university
      or new.description is distinct from old.description
      or new.required_skills is distinct from old.required_skills
      or new.open_spots is distinct from old.open_spots
      or new.total_spots is distinct from old.total_spots
      or new.members is distinct from old.members
      or new.deadline is distinct from old.deadline
      or new.status is distinct from old.status
      or new.architecture is distinct from old.architecture
      or new.github_repo is distinct from old.github_repo
      or new.live_demo is distinct from old.live_demo then
      raise exception 'Only the project owner may change project settings or membership';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists projects_guard_workspace_update on public.projects;
create trigger projects_guard_workspace_update
  before update on public.projects
  for each row execute function public.guard_project_workspace_update();

drop policy if exists requests_participant_read on public.requests;
create policy requests_participant_read on public.requests
  for select to authenticated
  using (from_user_id = auth.uid()::text or to_user_id = auth.uid()::text);

drop policy if exists requests_sender_insert on public.requests;
create policy requests_sender_insert on public.requests
  for insert to authenticated
  with check (
    from_user_id = auth.uid()::text
    and exists (
      select 1
      from public.projects project
      where project.id = requests.project_id
        and project.owner_id in (requests.from_user_id, requests.to_user_id)
    )
  );

drop policy if exists requests_recipient_update on public.requests;

create or replace function public.guard_request_status_update()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if old.from_user_id is distinct from new.from_user_id
    or old.to_user_id is distinct from new.to_user_id
    or old.project_id is distinct from new.project_id
    or old.project_title is distinct from new.project_title
    or old.from_user_name is distinct from new.from_user_name
    or old.from_user_niche is distinct from new.from_user_niche
    or old.message is distinct from new.message
    or old.created_at is distinct from new.created_at
    or old.status <> 'pending'
    or new.status not in ('accepted', 'declined')
    or auth.uid()::text <> old.to_user_id then
    raise exception 'Only the request recipient may accept or decline a pending request';
  end if;
  return new;
end;
$$;

drop trigger if exists requests_guard_status_update on public.requests;
create trigger requests_guard_status_update
  before update on public.requests
  for each row execute function public.guard_request_status_update();

create or replace function public.respond_to_collaboration_request(
  p_request_id text,
  p_response_status text
)
returns table (
  request_id text,
  response_status text,
  project_id text,
  members text[],
  open_spots integer
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  request_row public.requests%rowtype;
  project_row public.projects%rowtype;
  member_to_add text;
begin
  if auth.uid() is null
    or p_response_status is null
    or p_response_status not in ('accepted', 'declined') then
    raise exception 'A valid signed-in response is required';
  end if;

  select * into request_row
  from public.requests
  where id = p_request_id
  for update;

  if not found
    or request_row.to_user_id <> auth.uid()::text
    or request_row.status <> 'pending' then
    raise exception 'This request is unavailable or has already been answered';
  end if;

  if p_response_status = 'accepted' then
    select * into project_row
    from public.projects
    where id = request_row.project_id
    for update;

    if not found then
      raise exception 'The requested project no longer exists';
    end if;

    if project_row.owner_id = request_row.to_user_id then
      member_to_add := request_row.from_user_id;
    elsif project_row.owner_id = request_row.from_user_id then
      member_to_add := request_row.to_user_id;
    else
      raise exception 'The request must involve the project owner';
    end if;

    if not (member_to_add = any(coalesce(project_row.members, '{}'::text[])))
      and project_row.open_spots <= 0 then
      raise exception 'This project has no open collaborator spots';
    end if;

    perform pg_catalog.set_config('collabforge.allow_membership_change', 'on', true);
    update public.projects
    set members = case
        when member_to_add = any(coalesce(project_row.members, '{}'::text[]))
          then coalesce(project_row.members, '{}'::text[])
        else array_append(coalesce(project_row.members, '{}'::text[]), member_to_add)
      end,
      open_spots = case
        when member_to_add = any(coalesce(project_row.members, '{}'::text[]))
          then project_row.open_spots
        else greatest(project_row.open_spots - 1, 0)
      end
    where id = request_row.project_id
    returning public.projects.members, public.projects.open_spots
      into project_row.members, project_row.open_spots;
  end if;

  update public.requests
  set status = p_response_status
  where id = request_row.id
  returning public.requests.status into request_row.status;

  return query
  select request_row.id, request_row.status, request_row.project_id,
    project_row.members, project_row.open_spots;
end;
$$;

revoke all on function public.respond_to_collaboration_request(text, text) from public;
grant execute on function public.respond_to_collaboration_request(text, text) to authenticated;

drop policy if exists messages_participant_read on public.messages;
create policy messages_participant_read on public.messages
  for select to authenticated
  using (sender_id = auth.uid()::text or receiver_id = auth.uid()::text);

drop policy if exists messages_sender_insert on public.messages;
create policy messages_sender_insert on public.messages
  for insert to authenticated
  with check (sender_id = auth.uid()::text and receiver_id <> auth.uid()::text);

do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime')
    and not exists (
      select 1
      from pg_publication_tables
      where pubname = 'supabase_realtime'
        and schemaname = 'public'
        and tablename = 'messages'
    ) then
    execute 'alter publication supabase_realtime add table public.messages';
  end if;
end;
$$;
