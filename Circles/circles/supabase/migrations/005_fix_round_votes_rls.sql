-- The original round_votes_select policy blocked players from seeing each
-- other's votes while the round was still in 'voting' status. This broke
-- the tally screen AND suppressed realtime events (Supabase applies RLS to
-- postgres_changes delivery). The UI already handles the "hidden until all
-- voted" reveal with opacity animations, so the DB doesn't need to enforce it.
drop policy if exists "round_votes_select" on round_votes;

create policy "round_votes_select" on round_votes
  for select using (auth.role() = 'authenticated');
