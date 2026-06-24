-- ============================================================
-- KOMVA — سكريبت إنشاء قاعدة البيانات الكامل
-- شغّل هذا الملف في: Supabase Dashboard → SQL Editor → New query
-- ============================================================

-- تفعيل امتداد UUID (موجود افتراضياً في Supabase غالباً، لكن للتأكيد)
create extension if not exists "uuid-ossp";

-- ============================================================
-- 1) جدول الملفات الشخصية (يرتبط بجدول auth.users المدمج في Supabase)
-- ============================================================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  full_name text,
  avatar_url text,
  bio text,
  phone text unique,
  status text not null default 'offline' check (status in ('online', 'offline')),
  last_seen timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index profiles_username_idx on public.profiles (username);

-- ============================================================
-- 2) جدول المحادثات
-- ============================================================
create table public.chats (
  id uuid primary key default uuid_generate_v4(),
  type text not null check (type in ('direct', 'group')),
  name text, -- يُستخدم فقط للمجموعات
  created_by uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now()
);

-- ============================================================
-- 3) جدول أعضاء كل محادثة
-- ============================================================
create table public.chat_participants (
  chat_id uuid not null references public.chats(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (chat_id, user_id)
);

create index chat_participants_user_idx on public.chat_participants (user_id);

-- ============================================================
-- 4) جدول الرسائل
-- ============================================================
create table public.messages (
  id uuid primary key default uuid_generate_v4(),
  chat_id uuid not null references public.chats(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  content text not null,
  edited_at timestamptz,
  deleted_at timestamptz,
  created_at timestamptz not null default now()
);

create index messages_chat_idx on public.messages (chat_id, created_at);

-- ============================================================
-- 5) دالة + Trigger: إنشاء ملف شخصي تلقائياً عند التسجيل
-- ============================================================
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, username, phone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    new.phone
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- 6) تفعيل Row Level Security (RLS) — إلزامي لأي تطبيق حقيقي
-- ============================================================
alter table public.profiles enable row level security;
alter table public.chats enable row level security;
alter table public.chat_participants enable row level security;
alter table public.messages enable row level security;

-- ---- سياسات profiles ----
-- أي مستخدم مسجل دخول يقدر يشوف كل الملفات الشخصية (للبحث عن مستخدمين)
create policy "profiles_select_authenticated"
  on public.profiles for select
  to authenticated
  using (true);

-- المستخدم يقدر يعدّل ملفه الشخصي فقط
create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id);

-- ---- سياسات chats ----
-- المستخدم يشوف فقط المحادثات اللي هو عضو فيها
create policy "chats_select_participant"
  on public.chats for select
  to authenticated
  using (
    exists (
      select 1 from public.chat_participants
      where chat_participants.chat_id = chats.id
      and chat_participants.user_id = auth.uid()
    )
  );

create policy "chats_insert_authenticated"
  on public.chats for insert
  to authenticated
  with check (auth.uid() = created_by);

-- ---- سياسات chat_participants ----
create policy "participants_select_own_chats"
  on public.chat_participants for select
  to authenticated
  using (
    exists (
      select 1 from public.chat_participants cp
      where cp.chat_id = chat_participants.chat_id
      and cp.user_id = auth.uid()
    )
  );

create policy "participants_insert_authenticated"
  on public.chat_participants for insert
  to authenticated
  with check (true);

-- ---- سياسات messages ----
-- المستخدم يشوف فقط رسائل المحادثات اللي هو عضو فيها
create policy "messages_select_participant"
  on public.messages for select
  to authenticated
  using (
    exists (
      select 1 from public.chat_participants
      where chat_participants.chat_id = messages.chat_id
      and chat_participants.user_id = auth.uid()
    )
  );

-- المستخدم يقدر يرسل رسالة فقط في محادثة هو عضو فيها، وباسمه فقط
create policy "messages_insert_participant"
  on public.messages for insert
  to authenticated
  with check (
    auth.uid() = sender_id
    and exists (
      select 1 from public.chat_participants
      where chat_participants.chat_id = messages.chat_id
      and chat_participants.user_id = auth.uid()
    )
  );

-- المستخدم يقدر يعدّل أو يحذف رسائله فقط
create policy "messages_update_own"
  on public.messages for update
  to authenticated
  using (auth.uid() = sender_id);

-- ============================================================
-- 7) تفعيل Realtime على جدول الرسائل (لاستقبال الرسائل لحظياً)
-- ============================================================
alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.profiles;
