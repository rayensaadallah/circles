import { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Animated, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts/ThemeContext';
import { useProfile } from '@/contexts/ProfileContext';
import { CLogo, CCard, CButton, MONO } from '@/components/ui';
import { getRoomWithPlayers, startGame, subscribeToRoom, getActiveSession, leaveRoom } from '@/services/rooms';
import { supabase } from '@/lib/supabase';
import { roomStore } from '@/store/room-store';
import type { Room, RoomPlayer } from '@/types/database';
import type { RealtimeChannel } from '@supabase/supabase-js';

export default function WaitingRoomScreen() {
  const { theme: t } = useTheme();
  const { profile } = useProfile();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { roomId } = useLocalSearchParams<{ roomId: string }>();

  const [room, setRoom] = useState<Room | null>(null);
  const [players, setPlayers] = useState<RoomPlayer[]>([]);
  const [loadingRoom, setLoadingRoom] = useState(true);
  const [starting, setStarting] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const channelRef = useRef<RealtimeChannel | null>(null);

  // Breathing dot
  const breathAnim = useRef(new Animated.Value(0.3)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(breathAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(breathAnim, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const navigateToGame = useCallback((sessionId: string, topicTexts?: string[]) => {
    const texts = topicTexts ?? roomStore.selectedTopics.map((t) => t.text);
    router.replace({
      pathname: '/topic-reveal',
      params: {
        sessionId,
        topic: texts[0] ?? '',
        totalRounds: String(texts.length || 1),
        roundNum: '1',
      },
    });
  }, [router]);

  useEffect(() => {
    if (!roomId) return;

    getRoomWithPlayers(roomId).then(({ room, players }) => {
      setRoom(room);
      setPlayers(players);
      setLoadingRoom(false);

      // Edge case: user joins after game already started
      if (room?.status === 'active') {
        getActiveSession(roomId).then((sid) => {
          if (sid) navigateToGame(sid);
        });
      }
    });

    // Realtime: re-fetch the full player list on any change so we're always in sync
    channelRef.current = subscribeToRoom(roomId, async (event, payload) => {
      if (event === 'players_changed') {
        const { players: fresh } = await getRoomWithPlayers(roomId);
        setPlayers(fresh);
      } else if (event === 'room_update' && payload.status === 'active') {
        const sid = await getActiveSession(roomId);
        const topicTexts: string[] = payload.settings?.topic_texts ?? [];
        if (sid) navigateToGame(sid, topicTexts);
      }
    });

    return () => {
      if (channelRef.current) supabase.removeChannel(channelRef.current);
    };
  }, [roomId, navigateToGame]);

  const isHost = profile?.id === room?.hostId;
  const roomCode = room?.code ?? roomStore.roomCode ?? '----';
  const roomName = room?.name ?? roomStore.roomCode ?? 'Lobby';
  const topics = isHost ? roomStore.selectedTopics : [];
  const timeLabel = `${room?.settings.timePerTopic ?? roomStore.settings.time_per_topic} min`;
  const hotSeatLabel = (room?.settings.hotSeatEnabled ?? roomStore.settings.hot_seat_enabled) ? 'On' : 'Off';

  const handleStart = async () => {
    if (!roomId || !profile || starting) return;
    if (players.length < 2) {
      Alert.alert('Not enough players', 'At least 2 players must join before starting.');
      return;
    }

    setStarting(true);

    const { sessionId, error } = await startGame(roomId, roomStore.selectedTopics);
    if (error || !sessionId) {
      setStarting(false);
      Alert.alert('Error', 'Could not start the game. Please try again.');
      return;
    }

    roomStore.sessionId = sessionId;
    navigateToGame(sessionId);
  };

  const handleLeave = () => {
    Alert.alert(
      isHost ? 'Close room?' : 'Leave room?',
      isHost
        ? 'You are the host. Leaving will close the room for everyone.'
        : 'You will be removed from the lobby.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: isHost ? 'Close room' : 'Leave',
          style: 'destructive',
          onPress: async () => {
            setLeaving(true);
            if (roomId && profile) await leaveRoom(roomId, profile.id);
            if (channelRef.current) supabase.removeChannel(channelRef.current);
            router.replace('/');
          },
        },
      ]
    );
  };

  if (loadingRoom) {
    return (
      <View style={{ flex: 1, backgroundColor: t.bg, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontFamily: t.fontBody, fontSize: 15, color: t.inkSoft }}>Loading lobby…</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={{
          paddingTop: insets.top + 16, paddingHorizontal: 20, paddingBottom: 8,
          flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <TouchableOpacity onPress={handleLeave} disabled={leaving}>
            <Text style={{ fontSize: 22, color: t.ink }}>×</Text>
          </TouchableOpacity>
          <CLogo t={t} size={22} />
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Animated.View style={{
              width: 8, height: 8, borderRadius: 4,
              backgroundColor: t.primary, opacity: breathAnim,
            }} />
            <Text style={{ fontFamily: MONO, fontSize: 11, letterSpacing: 1.5, color: t.inkSoft }}>
              Waiting…
            </Text>
          </View>
        </View>

        {/* Room name */}
        <View style={{ paddingHorizontal: 20, paddingTop: 4 }}>
          <Text style={{
            fontFamily: t.fontDisplay, fontSize: 26, color: t.ink,
            letterSpacing: t.letterSpacing, lineHeight: 30,
          }}>
            {roomName}
          </Text>
        </View>

        {/* Room code card */}
        <View style={{ paddingHorizontal: 20, paddingTop: 12 }}>
          <CCard t={t} padding={20} color={t.ink} style={{ alignItems: 'center', overflow: 'hidden', position: 'relative' }}>
            <Text style={{ fontFamily: MONO, fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: t.bg, opacity: 0.6 }}>
              Room code
            </Text>
            <Text style={{
              fontFamily: t.fontDisplay, fontSize: 72, lineHeight: 80,
              color: t.bg, letterSpacing: 8, marginTop: 4,
            }}>
              {roomCode}
            </Text>
            <Text style={{ fontFamily: t.fontBody, fontSize: 13, color: t.bg, opacity: 0.55, marginTop: 6 }}>
              Share with your friends to join
            </Text>
          </CCard>
        </View>

        {/* Players */}
        <View style={{ paddingHorizontal: 20, paddingTop: 20 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <Text style={{ fontFamily: t.fontDisplay, fontSize: 18, color: t.ink, letterSpacing: t.letterSpacing }}>
              Players{' '}
              <Text style={{ color: t.inkSoft, fontFamily: t.fontBody }}>
                · {players.length} joined
              </Text>
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Animated.View style={{
                width: 8, height: 8, borderRadius: 4,
                backgroundColor: t.accents.lime, opacity: breathAnim,
              }} />
              <Text style={{ fontFamily: MONO, fontSize: 12, color: t.inkSoft }}>Live</Text>
            </View>
          </View>

          <View style={{ gap: 8 }}>
            {players.map((p) => {
              const displayName = p.profile?.username ?? 'Player';
              const displayAvatar = p.profile?.avatar ?? '?';
              const ringColor = p.profile?.ringColor ?? t.inkSoft;
              const isMe = p.userId === profile?.id;

              return (
                <CCard key={p.id} t={t} padding={12} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <View style={{
                    width: 40, height: 40, borderRadius: 20,
                    backgroundColor: ringColor,
                    alignItems: 'center', justifyContent: 'center',
                    shadowColor: ringColor,
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: 0.6, shadowRadius: 8,
                  }}>
                    <Text style={{ fontSize: 22 }}>{displayAvatar}</Text>
                  </View>
                  <Text style={{ flex: 1, fontFamily: t.fontBodyBold, fontSize: 16, color: t.ink, letterSpacing: t.letterSpacing }}>
                    {displayName}{isMe ? ' (you)' : ''}
                  </Text>
                  {p.isHost && (
                    <View style={{
                      paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6,
                      backgroundColor: t.accents.yellow,
                    }}>
                      <Text style={{ fontFamily: MONO, fontSize: 10, color: t.ink, letterSpacing: 1 }}>HOST</Text>
                    </View>
                  )}
                  <Text style={{ fontFamily: MONO, fontSize: 11, color: t.accents.lime }}>ready</Text>
                </CCard>
              );
            })}

            {/* Empty slot hint */}
            <View style={{
              padding: 14, borderRadius: t.radius,
              borderWidth: 1.5, borderColor: t.inkSoft, borderStyle: 'dashed',
              flexDirection: 'row', alignItems: 'center', gap: 12, opacity: 0.5,
            }}>
              <View style={{ width: 40, height: 40, borderRadius: 20, borderWidth: 1.5, borderColor: t.inkSoft, borderStyle: 'dashed' }} />
              <Text style={{ fontFamily: t.fontBody, fontSize: 14, color: t.inkSoft }}>Waiting for player…</Text>
            </View>
          </View>
        </View>

        {/* Topics (visible to host who selected them) */}
        {topics.length > 0 && (
          <View style={{ paddingHorizontal: 20, paddingTop: 20 }}>
            <Text style={{
              fontFamily: MONO, fontSize: 11, letterSpacing: 2,
              textTransform: 'uppercase', color: t.inkSoft, marginBottom: 10,
            }}>
              Topics ({topics.length})
            </Text>
            <CCard t={t} padding={0}>
              {topics.slice(0, 5).map((topic, i) => (
                <View key={topic.id} style={{
                  paddingHorizontal: 16, paddingVertical: 12,
                  flexDirection: 'row', alignItems: 'center', gap: 12,
                  borderBottomWidth: i < Math.min(topics.length, 5) - 1 ? 1 : 0,
                  borderBottomColor: t.bgAlt,
                }}>
                  <Text style={{ fontFamily: MONO, fontSize: 11, color: t.inkSoft, width: 24 }}>
                    {String(i + 1).padStart(2, '0')}
                  </Text>
                  <Text style={{ flex: 1, fontFamily: t.fontBody, fontSize: 14, color: t.ink }}>{topic.text}</Text>
                </View>
              ))}
              {topics.length > 5 && (
                <View style={{ paddingHorizontal: 16, paddingVertical: 12 }}>
                  <Text style={{ fontFamily: t.fontBody, fontSize: 13, color: t.inkSoft }}>
                    +{topics.length - 5} more topics…
                  </Text>
                </View>
              )}
            </CCard>
          </View>
        )}

        {/* Settings summary */}
        <View style={{ paddingHorizontal: 20, paddingTop: 16, flexDirection: 'row', gap: 8 }}>
          {[
            ['Time', timeLabel],
            ['Hot Seat', hotSeatLabel],
            ['Players', String(players.length)],
          ].map(([k, v]) => (
            <CCard key={k} t={t} padding={12} style={{ flex: 1, alignItems: 'center' }}>
              <Text style={{ fontFamily: MONO, fontSize: 9, color: t.inkSoft, letterSpacing: 1.5, textTransform: 'uppercase' }}>{k}</Text>
              <Text style={{ fontFamily: t.fontBodyBold, fontSize: 14, color: t.ink, marginTop: 4 }}>{v}</Text>
            </CCard>
          ))}
        </View>
      </ScrollView>

      {/* Footer: start (host) or waiting (player) */}
      <View style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        paddingHorizontal: 20, paddingTop: 16,
        paddingBottom: Math.max(insets.bottom + 16, 24),
        backgroundColor: t.bg, borderTopWidth: 1, borderTopColor: t.bgAlt,
      }}>
        {isHost ? (
          <>
            <CButton
              t={t} full size="lg"
              onPress={handleStart}
              disabled={players.length < 2 || starting || leaving}
            >
              {starting ? 'Starting…' : 'Start debate →'}
            </CButton>
            {players.length < 2 && (
              <Text style={{
                fontFamily: t.fontBody, fontSize: 12, color: t.inkSoft,
                textAlign: 'center', marginTop: 8,
              }}>
                Waiting for at least 1 more player to join
              </Text>
            )}
          </>
        ) : (
          <Text style={{ fontFamily: t.fontBody, fontSize: 14, color: t.inkSoft, textAlign: 'center' }}>
            Waiting for the host to start the debate…
          </Text>
        )}
        <TouchableOpacity
          onPress={handleLeave}
          disabled={leaving}
          style={{ alignItems: 'center', paddingTop: 14 }}
        >
          <Text style={{
            fontFamily: t.fontBody, fontSize: 13,
            color: leaving ? t.inkSoft : t.accents.coral,
          }}>
            {leaving ? 'Leaving…' : isHost ? 'Close room' : 'Leave room'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
