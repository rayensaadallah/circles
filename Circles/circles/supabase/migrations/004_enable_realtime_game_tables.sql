-- Enable Supabase Realtime for all game-related tables.
-- Migration 003 only covered room_players and rooms (the waiting room).
-- These additions are required for the tally, round, and session screens.
alter publication supabase_realtime add table round_votes;
alter publication supabase_realtime add table round_revotes;
alter publication supabase_realtime add table debate_rounds;
alter publication supabase_realtime add table game_sessions;
alter publication supabase_realtime add table session_players;
alter publication supabase_realtime add table hot_seat_events;
