// ===================================================
// CERCLES — Database Types
// Matches the Supabase schema exactly.
// ===================================================

export type Position = 'agree' | 'disagree'
export type RoomStatus = 'waiting' | 'active' | 'finished'
export type SessionStatus = 'active' | 'finished'
export type RoundStatus = 'voting' | 'debating' | 'revoting' | 'finished'
export type DebateMode = 'hot_seat' | 'structured'
export type FriendshipStatus = 'pending' | 'accepted' | 'blocked'
export type HotSeatEventType = 'tap' | 'flag_vote' | 'flag_out' | 'debate_start' | 'debate_end'
export type TopicCategory =
  | 'fun'
  | 'lifestyle'
  | 'relationships'
  | 'philosophy'
  | 'politics'
  | 'tech'
  | 'hot_takes'
  | 'would_you_rather'

// ===================================================
// DB ROW TYPES  (snake_case — matches Supabase columns)
// ===================================================

export interface ProfileRow {
  id: string
  username: string
  avatar: string
  ring_color: string
  level: number
  total_points: number
  created_at: string
}

export interface TopicRow {
  id: string
  text: string
  category: TopicCategory
  is_active: boolean
  debate_count: number
  created_at: string
}

export interface RoomSettingsJSON {
  time_per_topic: number  // minutes: 2 | 3 | 5 | 10
  hot_seat_enabled: boolean
  topic_texts?: string[]  // set when host starts the game; shared via realtime
}

export interface RoomRow {
  id: string
  code: string
  name: string
  host_id: string
  status: RoomStatus
  settings: RoomSettingsJSON
  created_at: string
}

export interface RoomPlayerRow {
  id: string
  room_id: string
  user_id: string
  is_host: boolean
  joined_at: string
}

export interface GameSessionRow {
  id: string
  room_id: string
  status: SessionStatus
  current_round_index: number
  started_at: string
  finished_at: string | null
}

export interface SessionTopicRow {
  id: string
  session_id: string
  topic_id: string
  order_index: number
}

export interface SessionPlayerRow {
  id: string
  session_id: string
  user_id: string
  total_points: number
  convinced_count: number
  mind_changed_count: number
  final_rank: number | null
}

export interface DebateRoundRow {
  id: string
  session_id: string
  topic_id: string
  round_index: number
  mode: DebateMode | null
  status: RoundStatus
  started_at: string
  finished_at: string | null
}

export interface RoundVoteRow {
  id: string
  round_id: string
  user_id: string
  position: Position
  voted_at: string
}

export interface RoundRevoteRow {
  id: string
  round_id: string
  user_id: string
  position: Position
  convinced_by: string | null
  voted_at: string
}

export interface HotSeatEventRow {
  id: string
  round_id: string
  event_type: HotSeatEventType
  actor_id: string
  target_id: string | null
  created_at: string
}

export interface AudienceRatingRow {
  id: string
  round_id: string
  rater_id: string
  ratee_id: string
  rating: number  // 1–5
  created_at: string
}

export interface FriendshipRow {
  id: string
  requester_id: string
  addressee_id: string
  status: FriendshipStatus
  created_at: string
}

// ===================================================
// APP-LEVEL TYPES  (camelCase — used in components)
// ===================================================

export interface Profile {
  id: string
  username: string
  avatar: string
  ringColor: string
  level: number
  totalPoints: number
  createdAt: string
}

export interface Topic {
  id: string
  text: string
  category: TopicCategory
  isActive: boolean
  debateCount: number
}

export interface RoomSettings {
  timePerTopic: number
  hotSeatEnabled: boolean
}

export interface RoomPlayer {
  id: string
  roomId: string
  userId: string
  isHost: boolean
  joinedAt: string
  profile?: Profile
}

export interface Room {
  id: string
  code: string
  name: string
  hostId: string
  status: RoomStatus
  settings: RoomSettings
  createdAt: string
  players?: RoomPlayer[]
}

export interface GameSession {
  id: string
  roomId: string
  status: SessionStatus
  currentRoundIndex: number
  startedAt: string
  finishedAt: string | null
}

export interface DebateRound {
  id: string
  sessionId: string
  topicId: string
  roundIndex: number
  mode: DebateMode | null
  status: RoundStatus
  startedAt: string
  finishedAt: string | null
  topic?: Topic
}

export interface RoundVote {
  id: string
  roundId: string
  userId: string
  position: Position
  votedAt: string
  profile?: Profile
}

export interface RoundRevote {
  id: string
  roundId: string
  userId: string
  position: Position
  convincedBy: string | null
  votedAt: string
  profile?: Profile
  convincedByProfile?: Profile
}

export interface SessionPlayer {
  id: string
  sessionId: string
  userId: string
  totalPoints: number
  convincedCount: number
  mindChangedCount: number
  finalRank: number | null
  profile?: Profile
}

export interface HotSeatEvent {
  id: string
  roundId: string
  eventType: HotSeatEventType
  actorId: string
  targetId: string | null
  createdAt: string
  actor?: Profile
  target?: Profile
}

export interface Friendship {
  id: string
  requesterId: string
  addresseeId: string
  status: FriendshipStatus
  createdAt: string
  profile?: Profile  // the other person's profile
}

// ===================================================
// CONVERTERS  (DB row → app type)
// ===================================================

export function toProfile(row: ProfileRow): Profile {
  return {
    id: row.id,
    username: row.username,
    avatar: row.avatar,
    ringColor: row.ring_color,
    level: row.level,
    totalPoints: row.total_points,
    createdAt: row.created_at,
  }
}

export function toRoom(row: RoomRow): Room {
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    hostId: row.host_id,
    status: row.status,
    settings: {
      timePerTopic: row.settings.time_per_topic,
      hotSeatEnabled: row.settings.hot_seat_enabled,
    },
    createdAt: row.created_at,
  }
}

export function toTopic(row: TopicRow): Topic {
  return {
    id: row.id,
    text: row.text,
    category: row.category,
    isActive: row.is_active,
    debateCount: row.debate_count,
  }
}

export function toSessionPlayer(row: SessionPlayerRow): SessionPlayer {
  return {
    id: row.id,
    sessionId: row.session_id,
    userId: row.user_id,
    totalPoints: row.total_points,
    convincedCount: row.convinced_count,
    mindChangedCount: row.mind_changed_count,
    finalRank: row.final_rank,
  }
}
