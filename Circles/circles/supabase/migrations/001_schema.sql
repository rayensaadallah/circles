-- ===================================================
-- CERCLES — Complete Database Schema
-- ===================================================

create extension if not exists "uuid-ossp";

-- ===================================================
-- PROFILES
-- Each row mirrors one auth.users row.
-- Auto-created by trigger on_auth_user_created.
-- ===================================================
create table profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  username      text unique not null,
  avatar        text not null default '🦊',
  ring_color    text not null default '#FF6B35',
  level         int not null default 1,
  total_points  int not null default 0,
  created_at    timestamptz not null default now()
);

-- Auto-insert profile when a new user signs up
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into profiles (id, username, avatar, ring_color)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', 'Player'),
    coalesce(new.raw_user_meta_data->>'avatar', '🦊'),
    coalesce(new.raw_user_meta_data->>'ring_color', '#FF6B35')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ===================================================
-- FRIENDSHIPS (social layer — future)
-- ===================================================
create table friendships (
  id            uuid primary key default uuid_generate_v4(),
  requester_id  uuid not null references profiles(id) on delete cascade,
  addressee_id  uuid not null references profiles(id) on delete cascade,
  status        text not null default 'pending'
                  check (status in ('pending', 'accepted', 'blocked')),
  created_at    timestamptz not null default now(),
  constraint friendships_no_self check (requester_id <> addressee_id),
  unique(requester_id, addressee_id)
);

-- ===================================================
-- TOPICS
-- ===================================================
create table topics (
  id            uuid primary key default uuid_generate_v4(),
  text          text not null,
  category      text not null
                  check (category in (
                    'fun','lifestyle','relationships','philosophy',
                    'politics','tech','hot_takes','would_you_rather'
                  )),
  is_active     boolean not null default true,
  debate_count  int not null default 0,
  created_at    timestamptz not null default now()
);

-- ===================================================
-- ROOM CODE GENERATOR
-- Generates a unique 4-char code (e.g. "PX3K").
-- ===================================================
create or replace function generate_room_code()
returns text language plpgsql as $$
declare
  chars  text := 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  v_code text;
  taken  boolean;
begin
  loop
    v_code := '';
    for i in 1..4 loop
      v_code := v_code || substr(chars, floor(random() * length(chars) + 1)::int, 1);
    end loop;
    select exists(select 1 from rooms where rooms.code = v_code) into taken;
    exit when not taken;
  end loop;
  return v_code;
end;
$$;

-- ===================================================
-- ROOMS
-- ===================================================
create table rooms (
  id          uuid primary key default uuid_generate_v4(),
  code        text unique not null default '',
  name        text not null,
  host_id     uuid not null references profiles(id) on delete cascade,
  status      text not null default 'waiting'
                check (status in ('waiting', 'active', 'finished')),
  settings    jsonb not null default '{"time_per_topic": 3, "hot_seat_enabled": true}',
  created_at  timestamptz not null default now()
);

create or replace function set_room_code()
returns trigger language plpgsql as $$
begin
  if new.code = '' then
    new.code := generate_room_code();
  end if;
  return new;
end;
$$;

create trigger rooms_auto_code
  before insert on rooms
  for each row execute function set_room_code();

-- ===================================================
-- ROOM_PLAYERS
-- Who is in the waiting room lobby.
-- ===================================================
create table room_players (
  id        uuid primary key default uuid_generate_v4(),
  room_id   uuid not null references rooms(id) on delete cascade,
  user_id   uuid not null references profiles(id) on delete cascade,
  is_host   boolean not null default false,
  joined_at timestamptz not null default now(),
  unique(room_id, user_id)
);

-- ===================================================
-- GAME_SESSIONS
-- Created when the host hits "Start Debate".
-- ===================================================
create table game_sessions (
  id                  uuid primary key default uuid_generate_v4(),
  room_id             uuid not null references rooms(id) on delete cascade,
  status              text not null default 'active'
                        check (status in ('active', 'finished')),
  current_round_index int not null default 0,
  started_at          timestamptz not null default now(),
  finished_at         timestamptz
);

-- ===================================================
-- SESSION_TOPICS
-- Ordered list of topics for this specific game.
-- ===================================================
create table session_topics (
  id          uuid primary key default uuid_generate_v4(),
  session_id  uuid not null references game_sessions(id) on delete cascade,
  topic_id    uuid not null references topics(id),
  order_index int not null,
  unique(session_id, order_index)
);

-- ===================================================
-- SESSION_PLAYERS
-- One row per player per game. Accumulates score.
-- ===================================================
create table session_players (
  id                  uuid primary key default uuid_generate_v4(),
  session_id          uuid not null references game_sessions(id) on delete cascade,
  user_id             uuid not null references profiles(id) on delete cascade,
  total_points        int not null default 0,
  convinced_count     int not null default 0,
  mind_changed_count  int not null default 0,
  final_rank          int,
  unique(session_id, user_id)
);

-- ===================================================
-- DEBATE_ROUNDS
-- One per topic. mode is set after initial votes are in.
-- ===================================================
create table debate_rounds (
  id           uuid primary key default uuid_generate_v4(),
  session_id   uuid not null references game_sessions(id) on delete cascade,
  topic_id     uuid not null references topics(id),
  round_index  int not null,
  mode         text check (mode in ('hot_seat', 'structured')),
  status       text not null default 'voting'
                 check (status in ('voting', 'debating', 'revoting', 'finished')),
  started_at   timestamptz not null default now(),
  finished_at  timestamptz,
  unique(session_id, round_index)
);

-- ===================================================
-- ROUND_VOTES
-- Initial position per player (before debate).
-- ===================================================
create table round_votes (
  id         uuid primary key default uuid_generate_v4(),
  round_id   uuid not null references debate_rounds(id) on delete cascade,
  user_id    uuid not null references profiles(id) on delete cascade,
  position   text not null check (position in ('agree', 'disagree')),
  voted_at   timestamptz not null default now(),
  unique(round_id, user_id)
);

-- ===================================================
-- ROUND_REVOTES
-- Final position after the debate.
-- convinced_by: who changed this player's mind (for scoring).
-- ===================================================
create table round_revotes (
  id            uuid primary key default uuid_generate_v4(),
  round_id      uuid not null references debate_rounds(id) on delete cascade,
  user_id       uuid not null references profiles(id) on delete cascade,
  position      text not null check (position in ('agree', 'disagree')),
  convinced_by  uuid references profiles(id),
  voted_at      timestamptz not null default now(),
  unique(round_id, user_id)
);

-- ===================================================
-- HOT_SEAT_EVENTS
-- Tracks the button race and flag votes during Hot Seat mode.
-- ===================================================
create table hot_seat_events (
  id          uuid primary key default uuid_generate_v4(),
  round_id    uuid not null references debate_rounds(id) on delete cascade,
  event_type  text not null
                check (event_type in ('tap', 'flag_vote', 'flag_out', 'debate_start', 'debate_end')),
  actor_id    uuid not null references profiles(id),
  target_id   uuid references profiles(id),
  created_at  timestamptz not null default now()
);

-- ===================================================
-- AUDIENCE_RATINGS
-- Players rate the quality of each debater's argument.
-- ===================================================
create table audience_ratings (
  id          uuid primary key default uuid_generate_v4(),
  round_id    uuid not null references debate_rounds(id) on delete cascade,
  rater_id    uuid not null references profiles(id) on delete cascade,
  ratee_id    uuid not null references profiles(id) on delete cascade,
  rating      int not null check (rating between 1 and 5),
  created_at  timestamptz not null default now(),
  constraint no_self_rating check (rater_id <> ratee_id),
  unique(round_id, rater_id, ratee_id)
);

-- ===================================================
-- INDEXES
-- ===================================================
create index on rooms(code);
create index on rooms(host_id);
create index on room_players(room_id);
create index on room_players(user_id);
create index on game_sessions(room_id);
create index on session_players(session_id);
create index on session_players(user_id);
create index on session_topics(session_id);
create index on debate_rounds(session_id);
create index on round_votes(round_id);
create index on round_revotes(round_id);
create index on hot_seat_events(round_id);
create index on audience_ratings(round_id);
create index on topics(category);
create index on friendships(requester_id);
create index on friendships(addressee_id);

-- ===================================================
-- ROW LEVEL SECURITY
-- ===================================================
alter table profiles enable row level security;
alter table friendships enable row level security;
alter table topics enable row level security;
alter table rooms enable row level security;
alter table room_players enable row level security;
alter table game_sessions enable row level security;
alter table session_topics enable row level security;
alter table session_players enable row level security;
alter table debate_rounds enable row level security;
alter table round_votes enable row level security;
alter table round_revotes enable row level security;
alter table hot_seat_events enable row level security;
alter table audience_ratings enable row level security;

-- profiles
create policy "profiles_select" on profiles for select using (true);
create policy "profiles_insert" on profiles for insert with check (auth.uid() = id);
create policy "profiles_update" on profiles for update using (auth.uid() = id);

-- friendships
create policy "friendships_select" on friendships for select
  using (auth.uid() = requester_id or auth.uid() = addressee_id);
create policy "friendships_insert" on friendships for insert
  with check (auth.uid() = requester_id);
create policy "friendships_update" on friendships for update
  using (auth.uid() = requester_id or auth.uid() = addressee_id);

-- topics (public library, read-only for users)
create policy "topics_select" on topics for select using (true);

-- rooms
create policy "rooms_select" on rooms for select using (auth.role() = 'authenticated');
create policy "rooms_insert" on rooms for insert with check (auth.uid() = host_id);
create policy "rooms_update" on rooms for update using (auth.uid() = host_id);

-- room_players
create policy "room_players_select" on room_players for select using (auth.role() = 'authenticated');
create policy "room_players_insert" on room_players for insert with check (auth.uid() = user_id);
create policy "room_players_delete" on room_players for delete using (auth.uid() = user_id);

-- game_sessions
create policy "game_sessions_select" on game_sessions for select using (auth.role() = 'authenticated');
create policy "game_sessions_insert" on game_sessions for insert
  with check (auth.uid() = (select host_id from rooms where id = room_id));
create policy "game_sessions_update" on game_sessions for update
  using (auth.uid() = (select host_id from rooms where id = room_id));

-- session_topics
create policy "session_topics_select" on session_topics for select using (auth.role() = 'authenticated');
create policy "session_topics_insert" on session_topics for insert with check (auth.role() = 'authenticated');

-- session_players
create policy "session_players_select" on session_players for select using (auth.role() = 'authenticated');
create policy "session_players_insert" on session_players for insert with check (auth.uid() = user_id);
create policy "session_players_update" on session_players for update using (auth.uid() = user_id);

-- debate_rounds
create policy "debate_rounds_select" on debate_rounds for select using (auth.role() = 'authenticated');
create policy "debate_rounds_insert" on debate_rounds for insert with check (auth.role() = 'authenticated');
create policy "debate_rounds_update" on debate_rounds for update using (auth.role() = 'authenticated');

-- round_votes: players write their own; see others only after voting phase ends
create policy "round_votes_insert" on round_votes for insert with check (auth.uid() = user_id);
create policy "round_votes_select" on round_votes for select using (
  auth.role() = 'authenticated' and (
    auth.uid() = user_id or
    (select status from debate_rounds where id = round_id) <> 'voting'
  )
);

-- round_revotes: same pattern — visible to all only after round finished
create policy "round_revotes_insert" on round_revotes for insert with check (auth.uid() = user_id);
create policy "round_revotes_select" on round_revotes for select using (
  auth.role() = 'authenticated' and (
    auth.uid() = user_id or
    (select status from debate_rounds where id = round_id) = 'finished'
  )
);

-- hot_seat_events
create policy "hot_seat_events_select" on hot_seat_events for select using (auth.role() = 'authenticated');
create policy "hot_seat_events_insert" on hot_seat_events for insert with check (auth.uid() = actor_id);

-- audience_ratings
create policy "audience_ratings_select" on audience_ratings for select using (auth.role() = 'authenticated');
create policy "audience_ratings_insert" on audience_ratings for insert with check (auth.uid() = rater_id);

-- ===================================================
-- RPC HELPERS (atomic increments — avoids race conditions)
-- ===================================================

-- Add points to a player in a session
create or replace function add_session_points(
  p_session_id  uuid,
  p_user_id     uuid,
  p_points      int,
  p_convinced   int default 0,
  p_mind_changed int default 0
) returns void language sql security definer as $$
  update session_players
  set
    total_points       = total_points + p_points,
    convinced_count    = convinced_count + p_convinced,
    mind_changed_count = mind_changed_count + p_mind_changed
  where session_id = p_session_id and user_id = p_user_id;
$$;

-- Flush session totals into the player's global profile
create or replace function flush_session_to_profile(p_session_id uuid)
returns void language plpgsql security definer as $$
declare
  rec record;
begin
  for rec in
    select user_id, total_points from session_players where session_id = p_session_id
  loop
    update profiles
    set total_points = total_points + rec.total_points
    where id = rec.user_id;
  end loop;
end;
$$;

-- Increment debate_count for topics used in a session
create or replace function increment_topic_debate_counts(p_session_id uuid)
returns void language sql security definer as $$
  update topics
  set debate_count = debate_count + 1
  where id in (
    select topic_id from session_topics where session_id = p_session_id
  );
$$;
