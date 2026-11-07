-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Profiles table (extends Supabase auth.users)
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  full_name text not null,
  role text not null default 'student' check (role in ('student', 'admin')),
  avatar_url text,
  created_at timestamp with time zone default now()
);

-- Clubs table
create table clubs (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text not null,
  logo_url text,
  created_by uuid references profiles(id) on delete set null,
  created_at timestamp with time zone default now()
);

-- Club memberships
create table club_memberships (
  id uuid default uuid_generate_v4() primary key,
  club_id uuid references clubs(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  role text default 'member' check (role in ('member', 'admin')),
  joined_at timestamp with time zone default now(),
  unique(club_id, user_id)
);

-- Events table
create table events (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text not null,
  date timestamp with time zone not null,
  location text not null,
  club_id uuid references clubs(id) on delete set null,
  created_by uuid references profiles(id) on delete set null,
  max_attendees integer,
  image_url text,
  created_at timestamp with time zone default now()
);

-- Event RSVPs
create table event_rsvps (
  id uuid default uuid_generate_v4() primary key,
  event_id uuid references events(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  rsvped_at timestamp with time zone default now(),
  unique(event_id, user_id)
);

-- Announcements table
create table announcements (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  content text not null,
  created_by uuid references profiles(id) on delete set null,
  is_pinned boolean default false,
  created_at timestamp with time zone default now()
);

-- Lost & Found table
create table lost_found_items (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text not null,
  type text not null check (type in ('lost', 'found')),
  location text not null,
  image_url text,
  contact_info text,
  user_id uuid references profiles(id) on delete set null,
  status text default 'open' check (status in ('open', 'resolved')),
  created_at timestamp with time zone default now()
);

-- Resources table
create table resources (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text not null,
  url text not null,
  file_type text,
  subject text,
  uploaded_by uuid references profiles(id) on delete set null,
  created_at timestamp with time zone default now()
);

-- RLS Policies (Row Level Security)
alter table profiles enable row level security;
alter table events enable row level security;
alter table event_rsvps enable row level security;
alter table clubs enable row level security;
alter table club_memberships enable row level security;
alter table announcements enable row level security;
alter table lost_found_items enable row level security;
alter table resources enable row level security;

-- Allow public read on most tables
create policy "Public read profiles" on profiles for select using (true);
create policy "Public read events" on events for select using (true);
create policy "Public read event_rsvps" on event_rsvps for select using (true);
create policy "Public read clubs" on clubs for select using (true);
create policy "Public read club_memberships" on club_memberships for select using (true);
create policy "Public read announcements" on announcements for select using (true);
create policy "Public read lost_found" on lost_found_items for select using (true);
create policy "Public read resources" on resources for select using (true);

-- Allow service role to do everything (backend uses service key)
-- Service role bypasses RLS by default in Supabase
