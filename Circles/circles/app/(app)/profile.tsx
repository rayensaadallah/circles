import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts/ThemeContext';
import { useProfile } from '@/contexts/ProfileContext';
import { supabase } from '@/lib/supabase';
import { CAvatar, CCard, CTabBar, MONO } from '@/components/ui';

const MOCK_BADGES = [
  { n: 'Hot Take', c: 'coral', i: '🔥' },
  { n: 'Closer', c: 'lime', i: '⌗' },
  { n: 'Devil', c: 'plum', i: '◈' },
  { n: 'Vote', c: 'cobalt', i: '◉' },
];

interface GameHistory {
  sessionId: string;
  roomName: string;
  date: string;
  rank: number | null;
  points: number;
}

export default function ProfileScreen() {
  const { theme: t } = useTheme();
  const { profile } = useProfile();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const accentValues = Object.values(t.accents);

  const [gamesPlayed, setGamesPlayed] = useState(0);
  const [convinced, setConvinced] = useState(0);
  const [mindChanged, setMindChanged] = useState(0);
  const [history, setHistory] = useState<GameHistory[]>([]);

  useEffect(() => {
    if (!profile) return;

    // Load stats from session_players
    supabase
      .from('session_players')
      .select('total_points, convinced_count, mind_changed_count, final_rank, session_id, game_sessions(started_at, rooms(name))')
      .eq('user_id', profile.id)
      .order('game_sessions(started_at)', { ascending: false })
      .limit(20)
      .then(({ data }) => {
        if (!data) return;

        setGamesPlayed(data.length);
        setConvinced(data.reduce((s, r) => s + (r.convinced_count ?? 0), 0));
        setMindChanged(data.reduce((s, r) => s + (r.mind_changed_count ?? 0), 0));

        const hist: GameHistory[] = data
          .filter((r: any) => r.game_sessions)
          .map((r: any) => ({
            sessionId: r.session_id,
            roomName: r.game_sessions?.rooms?.name ?? 'Debate',
            date: new Date(r.game_sessions?.started_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            rank: r.final_rank,
            points: r.total_points,
          }));
        setHistory(hist);
      });
  }, [profile]);

  const joinedDate = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    : '';

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={{
          paddingTop: insets.top + 16, paddingHorizontal: 20, paddingBottom: 8,
          flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <Text style={{ fontFamily: t.fontDisplay, fontSize: 22, color: t.ink, letterSpacing: t.letterSpacing }}>
            You
          </Text>
          <TouchableOpacity onPress={() => router.push('/settings')}>
            <Text style={{ fontSize: 22, color: t.ink }}>⚙</Text>
          </TouchableOpacity>
        </View>

        {/* Identity card */}
        <View style={{ paddingHorizontal: 20 }}>
          <CCard t={t} padding={20} style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
            <CAvatar color={profile?.ringColor ?? accentValues[1]} initial={profile?.avatar ?? '?'} size={72} t={t} />
            <View style={{ flex: 1 }}>
              <Text style={{
                fontFamily: t.fontDisplay, fontSize: 26, color: t.ink,
                letterSpacing: t.letterSpacing, lineHeight: 28,
              }}>
                {profile?.username ?? '—'}
              </Text>
              <Text style={{ fontFamily: MONO, fontSize: 12, color: t.inkSoft, marginTop: 4 }}>
                @{profile?.username?.toLowerCase() ?? '—'}{joinedDate ? ` · joined ${joinedDate}` : ''}
              </Text>
              <Text style={{ fontFamily: MONO, fontSize: 11, color: t.primary, marginTop: 4 }}>
                {profile?.totalPoints ?? 0} pts · Lv. {profile?.level ?? 1}
              </Text>
            </View>
          </CCard>
        </View>

        {/* Stats */}
        <View style={{ paddingHorizontal: 20, paddingTop: 12, flexDirection: 'row', gap: 8 }}>
          {[
            ['Games', String(gamesPlayed)],
            ['Convinced', String(convinced)],
            ['Flipped', String(mindChanged)],
          ].map(([l, v], i) => (
            <CCard key={i} t={t} padding={14} style={{ flex: 1, alignItems: 'center' }}>
              <Text style={{
                fontFamily: t.fontDisplay, fontSize: 26, color: t.ink, letterSpacing: t.letterSpacing,
              }}>
                {v}
              </Text>
              <Text style={{
                fontFamily: MONO, fontSize: 10, color: t.inkSoft,
                letterSpacing: 1.5, textTransform: 'uppercase', marginTop: 2,
              }}>
                {l}
              </Text>
            </CCard>
          ))}
        </View>

        {/* Badges */}
        <View style={{ paddingHorizontal: 20, paddingTop: 20 }}>
          <Text style={{
            fontFamily: MONO, fontSize: 11, letterSpacing: 2,
            textTransform: 'uppercase', color: t.inkSoft, marginBottom: 12,
          }}>
            Badges
          </Text>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            {MOCK_BADGES.map((b, i) => (
              <View key={i} style={{ flex: 1, alignItems: 'center', gap: 6 }}>
                <View style={{
                  width: '100%', aspectRatio: 1, borderRadius: t.radiusSm,
                  backgroundColor: t.accents[b.c as keyof typeof t.accents],
                  alignItems: 'center', justifyContent: 'center',
                  ...(t.cardBorder && { borderWidth: t.cardBorderWidth, borderColor: t.cardBorderColor }),
                  ...(t.isHardShadow && {
                    shadowColor: t.ink,
                    shadowOffset: { width: 2, height: 2 },
                    shadowOpacity: 1, shadowRadius: 0,
                  }),
                }}>
                  <Text style={{ fontSize: 22 }}>{b.i}</Text>
                </View>
                <Text style={{ fontFamily: t.fontBody, fontSize: 11, color: t.ink }}>{b.n}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* History */}
        <View style={{ paddingHorizontal: 20, paddingTop: 20 }}>
          <Text style={{
            fontFamily: MONO, fontSize: 11, letterSpacing: 2,
            textTransform: 'uppercase', color: t.inkSoft, marginBottom: 10,
          }}>
            History
          </Text>
          {history.length === 0 ? (
            <CCard t={t} padding={20} style={{ alignItems: 'center' }}>
              <Text style={{ fontFamily: t.fontBody, fontSize: 14, color: t.inkSoft }}>
                No games played yet. Create or join a debate!
              </Text>
            </CCard>
          ) : (
            <CCard t={t} padding={0}>
              {history.map((h, i) => (
                <View key={h.sessionId} style={{
                  paddingHorizontal: 16, paddingVertical: 14,
                  flexDirection: 'row', alignItems: 'center', gap: 12,
                  borderBottomWidth: i < history.length - 1 ? 1 : 0,
                  borderBottomColor: t.bgAlt,
                }}>
                  <Text style={{ fontFamily: MONO, fontSize: 11, color: t.inkSoft, width: 36 }}>{h.date}</Text>
                  <Text style={{ flex: 1, fontFamily: t.fontBodyBold, fontSize: 15, color: t.ink, letterSpacing: t.letterSpacing }}>
                    {h.roomName}
                  </Text>
                  <Text style={{ fontFamily: MONO, fontSize: 12, color: t.inkSoft }}>
                    {h.rank ? `#${h.rank}` : '—'} · {h.points}pts
                  </Text>
                </View>
              ))}
            </CCard>
          )}
        </View>
      </ScrollView>

      <CTabBar t={t} active="profile" />
    </View>
  );
}
