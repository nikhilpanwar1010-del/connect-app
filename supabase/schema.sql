-- =========================================================================
-- OUR LITTLE SPACE - SUPABASE SQL SCHEMA & ROW LEVEL SECURITY (RLS)
-- Free tier compatible (PostgreSQL, Supabase Auth, Realtime, Storage)
-- =========================================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Drop old incompatible tables if they exist from previous tests
drop table if exists public.reactions cascade;
drop table if exists public.messages cascade;
drop table if exists public.room_members cascade;
drop table if exists public.rooms cascade;
drop table if exists public.memories cascade;
drop table if exists public.proposals cascade;
drop table if exists public.profiles cascade;

-- 1. PROFILES TABLE
-- Extends Supabase auth.users with public profile information
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  name text not null,
  avatar_url text,
  bio text default 'Falling in love every single day 💕',
  status_message text default 'Online & thinking of you ✨',
  is_online boolean default false,
  last_seen timestamptz default now(),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Trigger to auto-create profile on Supabase auth user sign-up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1), 'My Sweetheart 💕'),
    coalesce(new.raw_user_meta_data->>'avatar_url', null)
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 2. ROOMS TABLE
-- Private spaces between you and your partner
create table if not exists public.rooms (
  id uuid default gen_random_uuid() primary key,
  name text default 'Our Secret Corner 💕',
  invite_code text unique not null,
  passcode text, -- Optional secret room password
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz default now()
);

-- 3. ROOM MEMBERS TABLE
create table if not exists public.room_members (
  id uuid default gen_random_uuid() primary key,
  room_id uuid references public.rooms(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  role text default 'member',
  joined_at timestamptz default now(),
  unique(room_id, user_id)
);

-- 4. MESSAGES TABLE
create table if not exists public.messages (
  id uuid default gen_random_uuid() primary key,
  room_id uuid references public.rooms(id) on delete cascade not null,
  sender_id uuid references auth.users(id) on delete cascade not null,
  content text,
  type text default 'text' check (type in ('text', 'image', 'audio', 'sticker', 'special_heart')),
  media_url text,
  reply_to_id uuid references public.messages(id) on delete set null,
  status text default 'sent' check (status in ('sent', 'delivered', 'seen')),
  is_edited boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 5. REACTIONS TABLE
create table if not exists public.reactions (
  id uuid default gen_random_uuid() primary key,
  message_id uuid references public.messages(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  emoji text not null,
  created_at timestamptz default now(),
  unique(message_id, user_id, emoji)
);

-- 6. MEMORIES TABLE (Shared Photo Gallery)
create table if not exists public.memories (
  id uuid default gen_random_uuid() primary key,
  room_id uuid references public.rooms(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  image_url text not null,
  caption text,
  memory_date date default current_date,
  created_at timestamptz default now()
);

-- 7. PROPOSALS TABLE (Records her special YES answer!)
create table if not exists public.proposals (
  id uuid default gen_random_uuid() primary key,
  invite_code text not null,
  sender_id uuid references auth.users(id) on delete set null,
  recipient_name text default 'My Love',
  answer text not null, -- 'YES 💗'
  answered_at timestamptz default now()
);

-- =========================================================================
-- INDEXES FOR MAXIMUM REAL-TIME QUERY PERFORMANCE
-- =========================================================================
create index if not exists idx_messages_room_created on public.messages(room_id, created_at asc);
create index if not exists idx_room_members_user on public.room_members(user_id);
create index if not exists idx_room_members_room on public.room_members(room_id);
create index if not exists idx_rooms_invite_code on public.rooms(invite_code);
create index if not exists idx_reactions_message on public.reactions(message_id);
create index if not exists idx_memories_room_date on public.memories(room_id, memory_date desc);

-- =========================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Strict privacy: Only verified room members can read/write in their room
-- =========================================================================

alter table public.profiles enable row level security;
alter table public.rooms enable row level security;
alter table public.room_members enable row level security;
alter table public.messages enable row level security;
alter table public.reactions enable row level security;
alter table public.memories enable row level security;
alter table public.proposals enable row level security;

-- Profiles: Anyone authenticated can view profiles, users can update their own
create policy "Authenticated users can view profiles"
  on public.profiles for select
  using (auth.role() = 'authenticated');

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Security definer helper to prevent infinite RLS recursion on room_members
create or replace function public.is_room_member(_room_id uuid, _user_id uuid)
returns boolean as $$
begin
  return exists (
    select 1 from public.room_members
    where room_id = _room_id and user_id = _user_id
  );
end;
$$ language plpgsql security definer set search_path = public;

-- Rooms: Members can view their rooms. Anyone authenticated can look up a room by invite code to join.
create policy "Users can view rooms they belong to or by invite code"
  on public.rooms for select
  using (
    auth.uid() = created_by or
    public.is_room_member(id, auth.uid()) or
    auth.role() = 'authenticated' -- allows resolving invite code
  );

create policy "Users can create rooms"
  on public.rooms for insert
  with check (auth.role() = 'authenticated');

create policy "Room creators can update their rooms"
  on public.rooms for update
  using (auth.uid() = created_by);

-- Room Members: Members can view room roster
create policy "Members can view room roster"
  on public.room_members for select
  using (
    user_id = auth.uid() or
    public.is_room_member(room_id, auth.uid())
  );

create policy "Users can join rooms"
  on public.room_members for insert
  with check (auth.uid() = user_id);

-- Messages: Only room members can read and send messages
create policy "Room members can read messages"
  on public.messages for select
  using (
    public.is_room_member(room_id, auth.uid())
  );

create policy "Room members can send messages"
  on public.messages for insert
  with check (
    auth.uid() = sender_id and
    public.is_room_member(room_id, auth.uid())
  );

create policy "Senders can edit their own messages"
  on public.messages for update
  using (auth.uid() = sender_id);

create policy "Senders can delete their own messages"
  on public.messages for delete
  using (auth.uid() = sender_id);

-- Reactions: Room members can view and manage reactions
create policy "Room members can read reactions"
  on public.reactions for select
  using (
    exists (
      select 1 from public.messages
      where messages.id = reactions.message_id
      and public.is_room_member(messages.room_id, auth.uid())
    )
  );

create policy "Users can add reactions"
  on public.reactions for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their reactions"
  on public.reactions for delete
  using (auth.uid() = user_id);

-- Memories: Room members can read and upload memories
create policy "Room members can view memories"
  on public.memories for select
  using (
    public.is_room_member(room_id, auth.uid())
  );

create policy "Room members can upload memories"
  on public.memories for insert
  with check (
    auth.uid() = user_id and
    public.is_room_member(room_id, auth.uid())
  );

create policy "Users can delete their memories"
  on public.memories for delete
  using (auth.uid() = user_id);

-- Proposals: Anyone can insert answer, and room creator can view
create policy "Anyone can record proposal answer"
  on public.proposals for insert
  with check (true);

create policy "Users can view proposal answers"
  on public.proposals for select
  using (true);

-- =========================================================================
-- STORAGE BUCKETS (avatars, chat-media, memories)
-- =========================================================================
insert into storage.buckets (id, name, public)
values 
  ('avatars', 'avatars', true),
  ('chat-media', 'chat-media', true),
  ('memories', 'memories', true)
on conflict (id) do update set public = true;

-- Storage policies: Authenticated users can upload and read
drop policy if exists "Public can view avatars" on storage.objects;
drop policy if exists "Authenticated users can upload avatars" on storage.objects;
drop policy if exists "Public can view chat-media" on storage.objects;
drop policy if exists "Authenticated users can upload chat-media" on storage.objects;
drop policy if exists "Public can view memories" on storage.objects;
drop policy if exists "Authenticated users can upload memories" on storage.objects;

create policy "Public can view avatars"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "Authenticated users can upload avatars"
  on storage.objects for insert
  with check (bucket_id = 'avatars' and auth.role() = 'authenticated');

create policy "Public can view chat-media"
  on storage.objects for select
  using (bucket_id = 'chat-media');

create policy "Authenticated users can upload chat-media"
  on storage.objects for insert
  with check (bucket_id = 'chat-media' and auth.role() = 'authenticated');

create policy "Public can view memories"
  on storage.objects for select
  using (bucket_id = 'memories');

create policy "Authenticated users can upload memories"
  on storage.objects for insert
  with check (bucket_id = 'memories' and auth.role() = 'authenticated');

-- =========================================================================
-- REALTIME SUBSCRIPTIONS
-- Enable real-time websocket broadcasting for tables
-- =========================================================================
do $$
begin
  begin
    alter publication supabase_realtime add table public.messages;
  exception when duplicate_object then null;
  end;
  begin
    alter publication supabase_realtime add table public.reactions;
  exception when duplicate_object then null;
  end;
  begin
    alter publication supabase_realtime add table public.memories;
  exception when duplicate_object then null;
  end;
  begin
    alter publication supabase_realtime add table public.room_members;
  exception when duplicate_object then null;
  end;
  begin
    alter publication supabase_realtime add table public.profiles;
  exception when duplicate_object then null;
  end;
  begin
    alter publication supabase_realtime add table public.proposals;
  exception when duplicate_object then null;
  end;
end $$;
