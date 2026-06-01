-- Enable Supabase Realtime for the tables used in the waiting room.
-- Without these lines, postgres_changes events are never delivered.
alter publication supabase_realtime add table room_players;
alter publication supabase_realtime add table rooms;
