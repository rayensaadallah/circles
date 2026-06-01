import { supabase } from '@/lib/supabase'
import type {
  Position,
  DebateMode,
  RoundStatus,
  DebateRound,
  RoundVote,
  SessionPlayer,
  Topic,
} from '@/types/database'
import { toProfile, toTopic } from '@/types/database'
import type { RealtimeChannel } from '@supabase/supabase-js'

// ===================================================
// SCORING CONSTANTS
// ===================================================
export const POINTS = {
  CONVINCE:     10,
  OPEN_MIND:    10,
  RATING_BONUS:  1,  // per star above 1
  FLAG_PENALTY: -2,
} as const

// ===================================================
// ROUNDS
// ===================================================

// Fetch existing round or create one for this session + round index.
// Safe to call from every player — uses upsert semantics.
export async function getOrCreateDebateRound(
  sessionId: string,
  roundIndex: number
): Promise<DebateRound | null> {
  // Get topic_id for this round index
  const { data: st } = await supabase
    .from('session_topics')
    .select('topic_id')
    .eq('session_id', sessionId)
    .eq('order_index', roundIndex)
    .single()

  if (!st) return null

  // Upsert: safe for concurrent callers — unique(session_id, round_index)
  // ensures only one row is ever created even if two players call simultaneously.
  await supabase
    .from('debate_rounds')
    .upsert(
      { session_id: sessionId, topic_id: st.topic_id, round_index: roundIndex },
      { onConflict: 'session_id,round_index', ignoreDuplicates: true }
    )

  // Always fetch the canonical row so every player gets the same ID
  const { data } = await supabase
    .from('debate_rounds')
    .select('*')
    .eq('session_id', sessionId)
    .eq('round_index', roundIndex)
    .single()

  if (!data) return null
  return {
    id: data.id, sessionId: data.session_id, topicId: data.topic_id,
    roundIndex: data.round_index, mode: data.mode, status: data.status,
    startedAt: data.started_at, finishedAt: data.finished_at,
  }
}

export async function createDebateRound(
  sessionId: string,
  topicId: string,
  roundIndex: number
): Promise<DebateRound | null> {
  const { data, error } = await supabase
    .from('debate_rounds')
    .insert({ session_id: sessionId, topic_id: topicId, round_index: roundIndex })
    .select()
    .single()

  if (error || !data) return null
  return {
    id: data.id,
    sessionId: data.session_id,
    topicId: data.topic_id,
    roundIndex: data.round_index,
    mode: data.mode,
    status: data.status,
    startedAt: data.started_at,
    finishedAt: data.finished_at,
  }
}

export async function updateRoundStatus(
  roundId: string,
  status: RoundStatus,
  mode?: DebateMode
) {
  const patch: any = { status }
  if (mode !== undefined) patch.mode = mode
  if (status === 'finished') patch.finished_at = new Date().toISOString()
  return supabase.from('debate_rounds').update(patch).eq('id', roundId)
}

export async function getSessionTopics(sessionId: string): Promise<Topic[]> {
  const { data } = await supabase
    .from('session_topics')
    .select('order_index, topics(*)')
    .eq('session_id', sessionId)
    .order('order_index')

  return (data ?? []).map((row: any) => toTopic(row.topics))
}

export async function advanceRound(sessionId: string, nextIndex: number) {
  return supabase
    .from('game_sessions')
    .update({ current_round_index: nextIndex })
    .eq('id', sessionId)
}

// ===================================================
// VOTING
// ===================================================

// Submit or update the initial vote for a round.
export async function submitVote(roundId: string, userId: string, position: Position) {
  return supabase.from('round_votes').upsert(
    { round_id: roundId, user_id: userId, position },
    { onConflict: 'round_id,user_id' }
  )
}

export async function getRoundVotes(roundId: string): Promise<RoundVote[]> {
  const { data } = await supabase
    .from('round_votes')
    .select('*, profiles(*)')
    .eq('round_id', roundId)

  return (data ?? []).map((row: any) => ({
    id: row.id,
    roundId: row.round_id,
    userId: row.user_id,
    position: row.position,
    votedAt: row.voted_at,
    profile: row.profiles ? toProfile(row.profiles) : undefined,
  }))
}

// Determine debate mode from votes.
// Hot Seat = exactly 1 player on one side. Structured = 2+ on each side.
export function detectMode(votes: RoundVote[]): DebateMode {
  const agree = votes.filter((v) => v.position === 'agree').length
  const disagree = votes.filter((v) => v.position === 'disagree').length
  return agree === 1 || disagree === 1 ? 'hot_seat' : 'structured'
}

// ===================================================
// REVOTING
// ===================================================

export async function submitRevote(
  roundId: string,
  userId: string,
  position: Position,
  convincedBy?: string
) {
  return supabase.from('round_revotes').upsert(
    {
      round_id: roundId,
      user_id: userId,
      position,
      convinced_by: convincedBy ?? null,
    },
    { onConflict: 'round_id,user_id' }
  )
}

// Compare initial votes and revotes to find who flipped and who convinced them.
export async function resolveRoundScores(
  sessionId: string,
  roundId: string
) {
  const { data: votes } = await supabase
    .from('round_votes')
    .select('user_id, position')
    .eq('round_id', roundId)

  const { data: revotes } = await supabase
    .from('round_revotes')
    .select('user_id, position, convinced_by')
    .eq('round_id', roundId)

  if (!votes || !revotes) return

  const initialMap = Object.fromEntries(votes.map((v) => [v.user_id, v.position]))

  for (const revote of revotes) {
    const flipped = initialMap[revote.user_id] !== revote.position

    if (flipped) {
      // Player who changed mind earns open-mind points
      await addSessionPoints(sessionId, revote.user_id, POINTS.OPEN_MIND, 0, 1)

      // Player who convinced them earns convince points
      if (revote.convinced_by) {
        await addSessionPoints(sessionId, revote.convinced_by, POINTS.CONVINCE, 1, 0)
      }
    }
  }
}

// ===================================================
// HOT SEAT
// ===================================================

export async function tapHotSeat(roundId: string, actorId: string, targetId: string) {
  return supabase.from('hot_seat_events').insert({
    round_id: roundId,
    event_type: 'tap',
    actor_id: actorId,
    target_id: targetId,
  })
}

export async function flagDebater(roundId: string, actorId: string, targetId: string) {
  return supabase.from('hot_seat_events').insert({
    round_id: roundId,
    event_type: 'flag_vote',
    actor_id: actorId,
    target_id: targetId,
  })
}

export async function emitHotSeatEvent(
  roundId: string,
  eventType: 'flag_out' | 'debate_start' | 'debate_end',
  actorId: string,
  targetId?: string
) {
  return supabase.from('hot_seat_events').insert({
    round_id: roundId,
    event_type: eventType,
    actor_id: actorId,
    target_id: targetId ?? null,
  })
}

// Apply flag-out penalty to a debater
export async function applyFlagPenalty(sessionId: string, userId: string) {
  return addSessionPoints(sessionId, userId, POINTS.FLAG_PENALTY)
}

// ===================================================
// AUDIENCE RATINGS
// ===================================================

export async function rateArgument(
  roundId: string,
  raterId: string,
  rateeId: string,
  rating: number
) {
  return supabase.from('audience_ratings').upsert(
    { round_id: roundId, rater_id: raterId, ratee_id: rateeId, rating },
    { onConflict: 'round_id,rater_id,ratee_id' }
  )
}

// Sum audience ratings for a player in a round and convert to bonus points
export async function applyRatingPoints(sessionId: string, roundId: string, userId: string) {
  const { data } = await supabase
    .from('audience_ratings')
    .select('rating')
    .eq('round_id', roundId)
    .eq('ratee_id', userId)

  if (!data?.length) return

  const avg = data.reduce((sum, r) => sum + r.rating, 0) / data.length
  const bonus = Math.max(0, Math.round(avg - 1)) * POINTS.RATING_BONUS
  if (bonus > 0) await addSessionPoints(sessionId, userId, bonus)
}

// ===================================================
// SCORING
// ===================================================

// Atomic point increment via RPC (avoids read-modify-write races)
export async function addSessionPoints(
  sessionId: string,
  userId: string,
  points: number,
  convinced = 0,
  mindChanged = 0
) {
  return supabase.rpc('add_session_points', {
    p_session_id: sessionId,
    p_user_id: userId,
    p_points: points,
    p_convinced: convinced,
    p_mind_changed: mindChanged,
  })
}

export async function getSessionPlayerCount(sessionId: string): Promise<number> {
  const { count } = await supabase
    .from('session_players')
    .select('*', { count: 'exact', head: true })
    .eq('session_id', sessionId)
  return count ?? 0
}

export async function getSessionLeaderboard(sessionId: string): Promise<SessionPlayer[]> {
  const { data } = await supabase
    .from('session_players')
    .select('*, profiles(*)')
    .eq('session_id', sessionId)
    .order('total_points', { ascending: false })

  return (data ?? []).map((row: any) => ({
    id: row.id,
    sessionId: row.session_id,
    userId: row.user_id,
    totalPoints: row.total_points,
    convincedCount: row.convinced_count,
    mindChangedCount: row.mind_changed_count,
    finalRank: row.final_rank,
    profile: row.profiles ? toProfile(row.profiles) : undefined,
  }))
}

// Call at the end of the game: assign ranks, flush to profiles, update topic stats.
export async function finishGame(sessionId: string) {
  const players = await getSessionLeaderboard(sessionId)

  // Write final ranks
  await Promise.all(
    players.map((p, i) =>
      supabase
        .from('session_players')
        .update({ final_rank: i + 1 })
        .eq('id', p.id)
    )
  )

  // Push session totals into global profile points
  await supabase.rpc('flush_session_to_profile', { p_session_id: sessionId })

  // Bump debate_count on all topics used
  await supabase.rpc('increment_topic_debate_counts', { p_session_id: sessionId })

  // Mark session finished
  return supabase
    .from('game_sessions')
    .update({ status: 'finished', finished_at: new Date().toISOString() })
    .eq('id', sessionId)
}

// ===================================================
// REALTIME SUBSCRIPTIONS
// ===================================================

// Watch session-level changes (round advances, session finish)
export function subscribeToSession(
  sessionId: string,
  onChange: (table: string, payload: any) => void
): RealtimeChannel {
  return supabase
    .channel(`session:${sessionId}`)
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'game_sessions', filter: `id=eq.${sessionId}` },
      (p) => onChange('game_sessions', p.new)
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'debate_rounds', filter: `session_id=eq.${sessionId}` },
      (p) => onChange('debate_rounds', p.new)
    )
    .subscribe()
}

// Watch the round status — used to synchronize all players into the next screen
export function subscribeToRoundStatus(
  roundId: string,
  onStatus: (status: RoundStatus) => void
): RealtimeChannel {
  return supabase
    .channel(`round-status:${roundId}`)
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'debate_rounds', filter: `id=eq.${roundId}` },
      (p) => onStatus(p.new.status)
    )
    .subscribe()
}

// Watch as players cast their initial vote for a round
export function subscribeToRoundVotes(
  roundId: string,
  onVote: (payload: any) => void
): RealtimeChannel {
  return supabase
    .channel(`votes:${roundId}`)
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'round_votes', filter: `round_id=eq.${roundId}` },
      (p) => onVote(p.new)
    )
    .subscribe()
}

// Watch hot seat events in real time (taps, flags, state transitions)
export function subscribeToHotSeat(
  roundId: string,
  onEvent: (payload: any) => void
): RealtimeChannel {
  return supabase
    .channel(`hotseat:${roundId}`)
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'hot_seat_events', filter: `round_id=eq.${roundId}` },
      (p) => onEvent(p.new)
    )
    .subscribe()
}

// Watch leaderboard updates during or after the game
export function subscribeToLeaderboard(
  sessionId: string,
  onChange: (payload: any) => void
): RealtimeChannel {
  return supabase
    .channel(`leaderboard:${sessionId}`)
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'session_players', filter: `session_id=eq.${sessionId}` },
      (p) => onChange(p.new)
    )
    .subscribe()
}
