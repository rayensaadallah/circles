-- The original session_players_insert policy blocked any insert where
-- auth.uid() != user_id. The host bulk-inserts ALL players' rows in startGame,
-- so the entire batch was silently failing — leaving session_players empty.
-- getSessionLeaderboard() returned [], totalPlayers = 0, and the tally screen
-- never detected "all voted" because 0 > 0 is always false.
drop policy if exists "session_players_insert" on session_players;

create policy "session_players_insert" on session_players
  for insert with check (auth.role() = 'authenticated');
