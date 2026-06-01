import { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, Animated } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle as SvgCircle } from 'react-native-svg';
import { useTheme } from '@/contexts/ThemeContext';
import { useProfile } from '@/contexts/ProfileContext';
import { MONO } from '@/components/ui';
import { supabase } from '@/lib/supabase';
import { getSessionPlayerCount } from '@/services/game';
import type { RealtimeChannel } from '@supabase/supabase-js';

export default function TopicRevealScreen() {
  const { theme: t } = useTheme();
  const { profile } = useProfile();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    topic?: string;
    roundNum?: string;
    totalRounds?: string;
    sessionId?: string;
  }>();

  const topic       = params.topic        || '';
  const roundNum    = params.roundNum     || '1';
  const totalRounds = params.totalRounds  || '1';
  const sessionId   = params.sessionId    || '';

  // 'idle' → 'waiting' → 'countdown' → navigate
  const [phase, setPhase]           = useState<'idle' | 'waiting' | 'countdown'>('idle');
  const [count, setCount]           = useState(3);
  const [readyCount, setReadyCount] = useState(0);
  const [totalPlayers, setTotal]    = useState(0);

  const channelRef        = useRef<RealtimeChannel | null>(null);
  const totalPlayersRef   = useRef(0);
  const countdownFiredRef = useRef(false);

  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(0.97)).current;
  const countAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1, duration: 600, delay: 200, useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    if (phase !== 'idle') return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1,    duration: 1100, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0.97, duration: 1100, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [phase]);

  const startCountdown = () => {
    if (countdownFiredRef.current) return;
    countdownFiredRef.current = true;
    setPhase('countdown');

    const pop = () => {
      countAnim.setValue(1.5);
      Animated.spring(countAnim, {
        toValue: 1, friction: 4, tension: 120, useNativeDriver: true,
      }).start();
    };

    pop();
    let current = 3;
    const tick = () => {
      current -= 1;
      if (current > 0) {
        setCount(current);
        pop();
        setTimeout(tick, 900);
      } else {
        router.replace({
          pathname: '/normal-topic-reveal',
          params: { topic, roundNum, totalRounds, sessionId },
        });
      }
    };
    setTimeout(tick, 900);
  };

  // Presence-based ready sync + broadcast-based countdown start
  useEffect(() => {
    if (!sessionId || !profile?.id) return;

    const channel = supabase.channel(`ready:${sessionId}:${roundNum}`, {
      config: { broadcast: { self: true } },
    });
    channelRef.current = channel;

    // All devices start the countdown only when they receive this broadcast,
    // so everyone ticks from the exact same moment regardless of presence jitter.
    channel.on('broadcast', { event: 'countdown_start' }, () => {
      startCountdown();
    });

    const sentRef = { current: false };
    const checkAllReady = () => {
      const state = channel.presenceState<{ userId: string; ready: boolean }>();
      const all = Object.values(state).flat();
      const ready = all.filter((p: any) => p.ready).length;
      setReadyCount(ready);
      if (totalPlayersRef.current > 0 && ready >= totalPlayersRef.current && !sentRef.current) {
        sentRef.current = true;
        channel.send({ type: 'broadcast', event: 'countdown_start', payload: {} });
      }
    };

    // 'sync' fires on initial state snapshot; 'join' fires on every presence update
    // (including when a player re-tracks with ready:true). Both are needed.
    channel.on('presence', { event: 'sync' }, checkAllReady);
    channel.on('presence', { event: 'join' }, checkAllReady);

    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await channel.track({ userId: profile.id, ready: false });
      }
    });

    // Fetch count after subscribing; re-check presence in case all ready signals
    // already arrived before the count resolved.
    getSessionPlayerCount(sessionId).then((n) => {
      totalPlayersRef.current = n;
      setTotal(n);
      checkAllReady();
    });

    return () => { supabase.removeChannel(channel); };
  }, [sessionId, roundNum, profile?.id]);

  const handleReady = async () => {
    if (phase !== 'idle' || !channelRef.current) return;
    setPhase('waiting');
    await channelRef.current.track({ userId: profile!.id, ready: true });
  };

  return (
    <View style={{ flex: 1, backgroundColor: t.primary }}>
      {/* Concentric rings */}
      <Svg
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
        viewBox="0 0 393 852"
        preserveAspectRatio="xMidYMid slice"
      >
        {[80, 160, 240, 320, 400, 480].map((r, i) => (
          <SvgCircle
            key={i} cx={196} cy={426} r={r}
            fill="none" stroke={t.primaryFg}
            strokeWidth={1.5}
            opacity={Math.max(0, 0.18 - i * 0.02)}
          />
        ))}
      </Svg>

      {/* Header */}
      <View style={{
        paddingTop: insets.top + 16, paddingHorizontal: 20, paddingBottom: 8,
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <Text style={{
          fontFamily: MONO, fontSize: 11, letterSpacing: 2,
          textTransform: 'uppercase', color: t.primaryFg, opacity: 0.85,
        }}>
          Round {roundNum} of {totalRounds}
        </Text>
        <Text style={{ fontFamily: MONO, fontSize: 11, letterSpacing: 2, color: t.primaryFg, opacity: 0.85 }}>
          CERCLES
        </Text>
      </View>

      {/* Center content */}
      <Animated.View style={{
        flex: 1, justifyContent: 'center', alignItems: 'center',
        paddingHorizontal: 32, opacity: fadeAnim,
      }}>
        {phase === 'countdown' ? (
          <Animated.Text style={{
            fontFamily: t.fontDisplay, fontSize: 120, lineHeight: 120,
            color: t.primaryFg, letterSpacing: t.letterSpacing,
            transform: [{ scale: countAnim }],
          }}>
            {count}
          </Animated.Text>
        ) : (
          <>
            <Text style={{
              fontFamily: MONO, fontSize: 11, letterSpacing: 2.5,
              textTransform: 'uppercase', color: t.primaryFg, opacity: 0.7,
              marginBottom: 20, textAlign: 'center',
            }}>
              {phase === 'waiting' ? `${readyCount} / ${totalPlayers} ready` : 'Next round'}
            </Text>
            <Text style={{
              fontFamily: t.fontDisplay, fontSize: 42, lineHeight: 46,
              color: t.primaryFg, letterSpacing: t.letterSpacing, textAlign: 'center',
            }}>
              {phase === 'waiting' ? 'Waiting for\neveryone…' : 'Get ready'}
            </Text>
            <Text style={{
              fontFamily: t.fontBody, fontSize: 14, color: t.primaryFg,
              opacity: 0.7, marginTop: 20, lineHeight: 22, textAlign: 'center',
            }}>
              Hot takes welcome, grudges not. Keep an open mind, enjoy the chaos — it's a game, not a personality test.
            </Text>
          </>
        )}
      </Animated.View>

      {/* Bottom area */}
      <Animated.View style={{
        paddingHorizontal: 24,
        paddingBottom: Math.max(insets.bottom + 24, 36),
        opacity: fadeAnim,
      }}>
        {phase === 'idle' && (
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <TouchableOpacity
              onPress={handleReady}
              activeOpacity={0.9}
              style={{
                paddingVertical: 20, borderRadius: 999,
                backgroundColor: t.ink, alignItems: 'center',
              }}
            >
              <Text style={{
                fontFamily: t.fontBodyBold, fontSize: 17,
                color: t.bg, letterSpacing: t.letterSpacing,
              }}>
                I'm ready →
              </Text>
            </TouchableOpacity>
          </Animated.View>
        )}

        {phase === 'waiting' && (
          <View style={{
            paddingVertical: 20, borderRadius: 999,
            backgroundColor: `${t.primaryFg}22`, alignItems: 'center',
          }}>
            <Text style={{
              fontFamily: t.fontBodyBold, fontSize: 17,
              color: t.primaryFg, opacity: 0.6, letterSpacing: t.letterSpacing,
            }}>
              ✓ Locked in
            </Text>
          </View>
        )}
      </Animated.View>
    </View>
  );
}
