import { supabase } from '@/lib/supabase'
import { toRoom, toProfile } from '@/types/database'
import type { Room, RoomPlayer, RoomSettingsJSON } from '@/types/database'
import type { RealtimeChannel } from '@supabase/supabase-js'

export async function createRoom(
  settings: RoomSettingsJSON,
  hostId: string
): Promise<{ room: Room | null; error: Error | null }> {
  // name is auto-set by the DB trigger (migration 002) but we supply a
  // placeholder so the insert works even if that migration hasn't run yet.
  const { data: row, error } = await supabase
    .from('rooms')
    .insert({ settings, host_id: hostId, name: 'Cercle' })
    .select()
    .single()

  if (error || !row) return { room: null, error: error as Error }

  await supabase.from('room_players').insert({
    room_id: row.id,
    user_id: hostId,
    is_host: true,
  })

  return { room: toRoom(row), error: null }
}

export async function joinRoomByCode(
  code: string,
  userId: string
): Promise<{ room: Room | null; error: Error | null }> {
  const { data: row, error } = await supabase
    .from('rooms')
    .select()
    .eq('code', code.toUpperCase().trim())
    .eq('status', 'waiting')
    .single()

  if (error || !row) {
    return { room: null, error: new Error('Room not found or already started') }
  }

  const { error: joinError } = await supabase.from('room_players').insert({
    room_id: row.id,
    user_id: userId,
    is_host: false,
  })

  if (joinError) return { room: null, error: joinError as Error }

  return { room: toRoom(row), error: null }
}

export async function getRoomWithPlayers(roomId: string): Promise<{
  room: Room | null
  players: RoomPlayer[]
}> {
  const { data } = await supabase
    .from('rooms')
    .select(`*, room_players(*, profiles(*))`)
    .eq('id', roomId)
    .single()

  if (!data) return { room: null, players: [] }

  const room = toRoom(data)
  const players: RoomPlayer[] = (data.room_players ?? []).map((rp: any) => ({
    id: rp.id,
    roomId: rp.room_id,
    userId: rp.user_id,
    isHost: rp.is_host,
    joinedAt: rp.joined_at,
    profile: rp.profiles ? toProfile(rp.profiles) : undefined,
  }))

  return { room, players }
}

export async function leaveRoom(roomId: string, userId: string) {
  return supabase
    .from('room_players')
    .delete()
    .eq('room_id', roomId)
    .eq('user_id', userId)
}

// Called by the host. Creates the game session and moves everyone into it.
export async function startGame(
  roomId: string,
  topics: { id: string; text: string }[]
): Promise<{ sessionId: string | null; error: Error | null }> {
  const topicIds = topics.map((t) => t.id)

  // 1. Mark room active + embed topic texts in settings so every player
  //    receives them via the realtime room_update payload (no extra fetch needed).
  const { data: roomRow } = await supabase
    .from('rooms').select('settings').eq('id', roomId).single()
  await supabase.from('rooms').update({
    status: 'active',
    settings: { ...(roomRow?.settings ?? {}), topic_texts: topics.map((t) => t.text) },
  }).eq('id', roomId)

  // 2. Create game session
  const { data: session, error } = await supabase
    .from('game_sessions')
    .insert({ room_id: roomId })
    .select()
    .single()

  if (error || !session) return { sessionId: null, error: error as Error }

  // 3. Insert ordered topics
  const sessionTopics = topicIds.map((topicId, i) => ({
    session_id: session.id,
    topic_id: topicId,
    order_index: i,
  }))
  await supabase.from('session_topics').insert(sessionTopics)

  // 4. Snapshot all room players into session_players
  const { data: roomPlayers } = await supabase
    .from('room_players')
    .select('user_id')
    .eq('room_id', roomId)

  if (roomPlayers?.length) {
    await supabase.from('session_players').insert(
      roomPlayers.map((p) => ({ session_id: session.id, user_id: p.user_id }))
    )
  }

  return { sessionId: session.id, error: null }
}

// Fetch the active session ID for a room (used by non-host players on room start).
export async function getActiveSession(roomId: string): Promise<string | null> {
  const { data } = await supabase
    .from('game_sessions')
    .select('id')
    .eq('room_id', roomId)
    .eq('status', 'active')
    .single();
  return data?.id ?? null;
}

// Subscribe to player joins/leaves and room status changes.
// Returns the channel so the caller can unsubscribe.
export function subscribeToRoom(
  roomId: string,
  onChange: (event: 'players_changed' | 'room_update', payload: any) => void
): RealtimeChannel {
  return supabase
    .channel(`room-${roomId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'room_players',
        filter: `room_id=eq.${roomId}`,
      },
      (payload) => onChange('players_changed', payload.new)
    )
    .on(
      'postgres_changes',
      {
        event: 'DELETE',
        schema: 'public',
        table: 'room_players',
        filter: `room_id=eq.${roomId}`,
      },
      (payload) => onChange('players_changed', payload.old)
    )
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'rooms',
        filter: `id=eq.${roomId}`,
      },
      (payload) => onChange('room_update', payload.new)
    )
    .subscribe()
}
