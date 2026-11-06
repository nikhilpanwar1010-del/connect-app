-- Fix RLS Infinite Recursion
create or replace function public.is_room_member(_room_id uuid, _user_id uuid)
returns boolean as $$
begin
  return exists (
    select 1 from public.room_members
    where room_id = _room_id and user_id = _user_id
  );
end;
$$ language plpgsql security definer set search_path = public;

-- Drop old recursive policies
drop policy if exists "Users can view rooms they belong to or by invite code" on public.rooms;
drop policy if exists "Members can view room roster" on public.room_members;
drop policy if exists "Room members can read messages" on public.messages;
drop policy if exists "Room members can send messages" on public.messages;
drop policy if exists "Room members can read reactions" on public.reactions;
drop policy if exists "Room members can view memories" on public.memories;
drop policy if exists "Room members can upload memories" on public.memories;

-- Re-create clean non-recursive policies
create policy "Users can view rooms they belong to or by invite code"
  on public.rooms for select
  using (
    auth.uid() = created_by or
    public.is_room_member(id, auth.uid()) or
    auth.role() = 'authenticated'
  );

create policy "Members can view room roster"
  on public.room_members for select
  using (
    user_id = auth.uid() or
    public.is_room_member(room_id, auth.uid())
  );

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

create policy "Room members can read reactions"
  on public.reactions for select
  using (
    exists (
      select 1 from public.messages
      where messages.id = reactions.message_id
      and public.is_room_member(messages.room_id, auth.uid())
    )
  );

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
