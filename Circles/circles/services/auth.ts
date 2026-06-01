import { supabase } from '@/lib/supabase'
import { toProfile } from '@/types/database'
import type { Profile } from '@/types/database'

const GUEST_POOL = [
  { name: 'Fox',       avatar: '🦊', color: '#FF6B35' },
  { name: 'Wolf',      avatar: '🐺', color: '#A855F7' },
  { name: 'Bear',      avatar: '🐻', color: '#34D399' },
  { name: 'Eagle',     avatar: '🦅', color: '#F59E0B' },
  { name: 'Dragon',    avatar: '🐉', color: '#F43F5E' },
  { name: 'Tiger',     avatar: '🐯', color: '#22D3EE' },
  { name: 'Raccoon',   avatar: '🦝', color: '#EC4899' },
  { name: 'Lion',      avatar: '🦁', color: '#3B82F6' },
  { name: 'Dolphin',   avatar: '🐬', color: '#22D3EE' },
  { name: 'Butterfly', avatar: '🦋', color: '#A855F7' },
  { name: 'Octopus',   avatar: '🐙', color: '#F43F5E' },
  { name: 'Unicorn',   avatar: '🦄', color: '#EC4899' },
]

function randomGuest() {
  const pick = GUEST_POOL[Math.floor(Math.random() * GUEST_POOL.length)]
  const num  = Math.floor(Math.random() * 900) + 100
  return {
    username:   `${pick.name}${num}`,
    avatar:     pick.avatar,
    ring_color: pick.color,
  }
}

export async function signIn(email: string, password: string) {
  return supabase.auth.signInWithPassword({ email, password })
}

// Profile is auto-created by the DB trigger handle_new_user.
// We pass username/avatar/ring_color in user_metadata so the trigger picks them up.
export async function signUp(
  email: string,
  password: string,
  username: string,
  avatar: string,
  ringColor: string
) {
  return supabase.auth.signUp({
    email,
    password,
    options: {
      data: { username, avatar, ring_color: ringColor },
    },
  })
}

// Creates an anonymous Supabase user with a random fun identity.
// The DB trigger handle_new_user picks up the metadata and creates the profile row.
// Requires "Enable anonymous sign-ins" to be ON in Supabase Auth → Settings.
export async function signInAsGuest() {
  const guest = randomGuest()

  const { data, error } = await supabase.auth.signInAnonymously({
    options: { data: guest },
  })

  if (error) return { data, error }

  // Belt-and-suspenders: insert profile manually in case the DB trigger didn't fire
  if (data.user) {
    await supabase.from('profiles').upsert(
      {
        id: data.user.id,
        username: guest.username,
        avatar: guest.avatar,
        ring_color: guest.ring_color,
      },
      { onConflict: 'id', ignoreDuplicates: true }
    )
  }

  return { data, error }
}

export async function signOut() {
  // Always do a local-only sign-out first so the SecureStore cache is
  // guaranteed to be cleared even if the server call fails (e.g. expired token).
  await supabase.auth.signOut({ scope: 'local' });
  // Best-effort server-side revocation — ignore any error.
  supabase.auth.signOut().catch(() => {});
}

export async function getUser() {
  return supabase.auth.getUser()
}

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error || !data) return null
  return toProfile(data)
}

export async function updateProfile(
  userId: string,
  updates: { username?: string; avatar?: string; ring_color?: string }
): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()

  if (error || !data) return null
  return toProfile(data)
}

export async function searchProfiles(query: string): Promise<Profile[]> {
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .ilike('username', `%${query}%`)
    .limit(20)

  return (data ?? []).map(toProfile)
}
