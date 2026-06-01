import { useEffect, useRef, useState } from 'react';
import { View, Text, Animated } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle as SvgCircle } from 'react-native-svg';
import { useTheme } from '@/contexts/ThemeContext';
import { CCard, CAvatar, CButton, MONO } from '@/components/ui';
import { getRoundVotes, getSessionLeaderboard, subscribeToRoundVotes } from '@/services/game';
import { supabase } from '@/lib/supabase';
import type { RoundVote, SessionPlayer } from '@/types/database';
import type { RealtimeChannel } from '@supabase/supabase-js';

export default function NormalTallyScreen() {
  const { theme: t } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    topic?: string;
    roundNum?: string;
    totalRounds?: string;
    sessionId?: string;
    roundId?: string;
    myVote?: string;
  }>();

  const topic       = params.topic       || '';
  const roundNum    = params.roundNum    || '1';
  const totalRounds = params.totalRounds || '1';
  const sessionId   = params.sessionId   || '';
  const roundId     = params.roundId     || '';
  const myVote      = params.myVote      || '';

  const [votes, setVotes]                   = useState<RoundVote[]>([]);
  const [sessionPlayers, setSessionPlayers] = useState<SessionPlayer[]>([]);
  const [totalPlayers, setTotal]            = useState(0);
  const [allVoted, setAllVoted]             = useState(false);

  // Refs so async callbacks always see the latest values without stale closures
  const totalPlayersRef  = useRef(0);
  const autoNavFiredRef  = useRef(false);
  const votesChannelRef  = useRef<RealtimeChannel | null>(null);

  const revealAnim       = useRef(new Animated.Value(0)).current;
  const breathAnim       = useRef(new Animated.Value(0.4)).current;
  const forSlideAnim     = useRef(new Animated.Value(0)).current;
  const againstSlideAnim = useRef(new Animated.Value(0)).current;
  const vsScaleAnim      = useRef(new Animated.Value(0)).current;
  const battleFlashAnim  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(breathAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(breathAnim, { toValue: 0.4, duration: 700, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  // Called the moment all votes are confirmed — plays battle reveal then navigates
  const handleAllVoted = () => {
    if (autoNavFiredRef.current) return;
    autoNavFiredRef.current = true;
    setAllVoted(true);

    // Flash the screen
    Animated.sequence([
      Animated.timing(battleFlashAnim, { toValue: 0.3, duration: 100, useNativeDriver: true }),
      Animated.timing(battleFlashAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();

    // Columns slam in from each side, then VS badge bounces
    forSlideAnim.setValue(-140);
    againstSlideAnim.setValue(140);
    Animated.sequence([
      Animated.delay(80),
      Animated.parallel([
        Animated.spring(forSlideAnim, { toValue: 0, friction: 7, tension: 55, useNativeDriver: true }),
        Animated.spring(againstSlideAnim, { toValue: 0, friction: 7, tension: 55, useNativeDriver: true }),
        Animated.timing(revealAnim, { toValue: 1, duration: 450, useNativeDriver: true }),
      ]),
      Animated.spring(vsScaleAnim, { toValue: 1, friction: 4, tension: 200, useNativeDriver: true }),
    ]).start();

    setTimeout(() => {
      router.replace({
        pathname: '/normal-round',
        params: { topic, roundNum, totalRounds, sessionId, roundId, myVote },
      });
    }, 2200);
  };

  useEffect(() => {
    if (!roundId || !sessionId) return;

    Promise.all([
      getRoundVotes(roundId),
      getSessionLeaderboard(sessionId),
    ]).then(([v, players]) => {
      totalPlayersRef.current = players.length;
      setVotes(v);
      setSessionPlayers(players);
      setTotal(players.length);

      // Already have all votes when we arrive (e.g. last to vote)
      if (players.length > 0 && v.length >= players.length) {
        handleAllVoted();
      }
    });

    // On every new vote: re-fetch with profiles, then check if we're done
    votesChannelRef.current = subscribeToRoundVotes(roundId, async () => {
      const fresh = await getRoundVotes(roundId);
      setVotes(fresh);
      if (totalPlayersRef.current > 0 && fresh.length >= totalPlayersRef.current) {
        handleAllVoted();
      }
    });

    return () => { if (votesChannelRef.current) supabase.removeChannel(votesChannelRef.current); };
  }, [roundId, sessionId]);

  const fors         = votes.filter((v) => v.position === 'agree');
  const agains       = votes.filter((v) => v.position === 'disagree');
  const votedIds     = new Set(votes.map((v) => v.userId));
  const pending      = sessionPlayers.filter((p) => !votedIds.has(p.userId));
  const waitingCount = totalPlayers - votes.length;

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      {/* Status bar */}
      <View style={{
        paddingTop: insets.top + 16, paddingHorizontal: 20,
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <Text style={{ fontFamily: MONO, fontSize: 11, letterSpacing: 2, color: t.inkSoft }}>
          R{roundNum} · TALLY
        </Text>
        <Text style={{ fontFamily: MONO, fontSize: 11, letterSpacing: 2, color: t.inkSoft }}>CERCLES</Text>
      </View>

      {/* Topic chip */}
      <View style={{ paddingHorizontal: 20, paddingTop: 10 }}>
        <CCard t={t} padding={12}>
          <Text style={{
            fontFamily: t.fontBodyBold, fontSize: 14, color: t.ink,
            letterSpacing: t.letterSpacing, textAlign: 'center', lineHeight: 20,
          }}>
            "{topic}"
          </Text>
        </CCard>
      </View>

      {/* Headline */}
      <View style={{ paddingHorizontal: 24, paddingTop: 18 }}>
        {allVoted ? (
          <>
            <Text style={{ fontFamily: t.fontDisplay, fontSize: 32, color: t.ink, letterSpacing: t.letterSpacing, lineHeight: 34 }}>
              The room{'\n'}has voted.
            </Text>
            <Text style={{ fontFamily: t.fontBody, fontSize: 13, color: t.inkSoft, marginTop: 8 }}>
              Starting the round…
            </Text>
          </>
        ) : (
          <>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Animated.View style={{
                width: 8, height: 8, borderRadius: 4,
                backgroundColor: t.primary, opacity: breathAnim,
              }} />
              <Text style={{ fontFamily: t.fontDisplay, fontSize: 32, color: t.ink, letterSpacing: t.letterSpacing, lineHeight: 34 }}>
                Waiting{'\n'}for votes…
              </Text>
            </View>
            <Text style={{ fontFamily: t.fontBody, fontSize: 13, color: t.inkSoft, marginTop: 8 }}>
              {votes.length} of {totalPlayers || '?'} voted · {waitingCount > 0 ? `${waitingCount} left` : 'all in'}
            </Text>
          </>
        )}
      </View>

      {/* Split bar — visible as votes come in */}
      {(fors.length > 0 || agains.length > 0) && (
        <View style={{ paddingHorizontal: 20, paddingTop: 16 }}>
          <View style={{
            flexDirection: 'row', height: 68, borderRadius: t.radius, overflow: 'hidden',
            ...(t.cardBorder && { borderWidth: t.cardBorderWidth, borderColor: t.cardBorderColor }),
            ...t.shadow,
          }}>
            {fors.length > 0 && (
              <View style={{
                flex: fors.length, backgroundColor: t.accents.lime,
                alignItems: 'flex-start', justifyContent: 'center', paddingLeft: 16,
              }}>
                <Text style={{ fontFamily: MONO, fontSize: 9, letterSpacing: 1.5, color: t.ink, opacity: 0.7 }}>FOR</Text>
                <Text style={{ fontFamily: t.fontDisplay, fontSize: 32, lineHeight: 34, color: t.ink, letterSpacing: t.letterSpacing }}>
                  {fors.length}
                </Text>
              </View>
            )}
            {agains.length > 0 && (
              <View style={{
                flex: agains.length, backgroundColor: t.accents.cobalt,
                alignItems: 'flex-end', justifyContent: 'center', paddingRight: 16,
              }}>
                <Text style={{ fontFamily: MONO, fontSize: 9, letterSpacing: 1.5, color: '#fff', opacity: 0.8 }}>AGAINST</Text>
                <Text style={{ fontFamily: t.fontDisplay, fontSize: 32, lineHeight: 34, color: '#fff', letterSpacing: t.letterSpacing }}>
                  {agains.length}
                </Text>
              </View>
            )}
          </View>
        </View>
      )}

      {/* FOR / AGAINST battle formation */}
      <View style={{ paddingHorizontal: 20, paddingTop: 12 }}>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          {/* FOR column */}
          <Animated.View style={{
            flex: 1,
            transform: [{ translateX: forSlideAnim }],
            opacity: allVoted ? revealAnim : 0.35,
          }}>
            <CCard t={t} padding={12}>
              <Text style={{
                fontFamily: MONO, fontSize: 9, letterSpacing: 1.5,
                color: t.inkSoft, marginBottom: 10, textTransform: 'uppercase',
              }}>
                FOR · {fors.length}
              </Text>
              {fors.length === 0 ? (
                <Text style={{ fontFamily: t.fontBody, fontSize: 12, color: t.inkSoft }}>—</Text>
              ) : fors.map((v) => (
                <View key={v.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <CAvatar
                    color={v.profile?.ringColor ?? t.accents.lime}
                    initial={(v.profile?.username ?? '?')[0].toUpperCase()}
                    size={28} t={t}
                  />
                  <Text style={{ fontFamily: t.fontBodyBold, fontSize: 13, color: t.ink }}>
                    {v.profile?.username ?? '…'}
                  </Text>
                </View>
              ))}
            </CCard>
          </Animated.View>

          {/* AGAINST column */}
          <Animated.View style={{
            flex: 1,
            transform: [{ translateX: againstSlideAnim }],
            opacity: allVoted ? revealAnim : 0.35,
          }}>
            <CCard t={t} padding={12}>
              <Text style={{
                fontFamily: MONO, fontSize: 9, letterSpacing: 1.5,
                color: t.inkSoft, marginBottom: 10, textTransform: 'uppercase',
              }}>
                AGAINST · {agains.length}
              </Text>
              {agains.length === 0 ? (
                <Text style={{ fontFamily: t.fontBody, fontSize: 12, color: t.inkSoft }}>—</Text>
              ) : agains.map((v) => (
                <View key={v.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <CAvatar
                    color={v.profile?.ringColor ?? t.accents.cobalt}
                    initial={(v.profile?.username ?? '?')[0].toUpperCase()}
                    size={28} t={t}
                  />
                  <Text style={{ fontFamily: t.fontBodyBold, fontSize: 13, color: t.ink }}>
                    {v.profile?.username ?? '…'}
                  </Text>
                </View>
              ))}
            </CCard>
          </Animated.View>
        </View>

        {/* VS battle badge — bounces in after columns settle */}
        <Animated.View
          pointerEvents="none"
          style={{
            position: 'absolute',
            left: '50%',
            marginLeft: -22,
            top: 28,
            zIndex: 10,
            transform: [{ scale: vsScaleAnim }],
          }}
        >
          <View style={{
            width: 44, height: 44, borderRadius: 22,
            backgroundColor: t.ink,
            alignItems: 'center', justifyContent: 'center',
            borderWidth: 3, borderColor: t.bg,
          }}>
            <Text style={{
              color: t.bg, fontFamily: MONO,
              fontSize: 11, fontWeight: '900', letterSpacing: 1.5,
            }}>
              VS
            </Text>
          </View>
        </Animated.View>
      </View>

      {/* Still deciding — who hasn't voted yet */}
      {!allVoted && pending.length > 0 && (
        <View style={{ paddingHorizontal: 20, paddingTop: 14 }}>
          <Text style={{
            fontFamily: MONO, fontSize: 9, letterSpacing: 1.5,
            color: t.inkSoft, marginBottom: 8, textTransform: 'uppercase',
          }}>
            Still deciding · {pending.length}
          </Text>
          <CCard t={t} padding={12}>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
              {pending.map((p) => (
                <View key={p.userId} style={{ alignItems: 'center', gap: 4 }}>
                  <View style={{ position: 'relative' }}>
                    <CAvatar
                      color={p.profile?.ringColor ?? t.inkSoft}
                      initial={(p.profile?.username ?? '?')[0].toUpperCase()}
                      size={36} t={t}
                    />
                    <Animated.View style={{
                      position: 'absolute', bottom: -1, right: -1,
                      width: 10, height: 10, borderRadius: 5,
                      backgroundColor: t.bgAlt,
                      borderWidth: 1.5, borderColor: t.bg,
                      opacity: breathAnim,
                    }} />
                  </View>
                  <Text style={{
                    fontFamily: t.fontBody, fontSize: 10,
                    color: t.inkSoft, maxWidth: 52, textAlign: 'center',
                  }} numberOfLines={1}>
                    {p.profile?.username ?? '…'}
                  </Text>
                </View>
              ))}
            </View>
          </CCard>
        </View>
      )}

      {/* Round rule card */}
      <View style={{ flex: 1, paddingHorizontal: 20, paddingTop: 12, justifyContent: 'flex-end', paddingBottom: 12 }}>
        <CCard t={t} padding={14}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Svg width={44} height={44} viewBox="0 0 44 44">
              <SvgCircle cx={22} cy={22} r={18} fill="none" stroke={t.ink} strokeWidth={1.2} strokeDasharray="3 4" opacity={0.3} />
              {fors.map((_, i) => {
                const a = (i / Math.max(fors.length, 1)) * Math.PI * 2 - Math.PI / 2;
                return <SvgCircle key={'f'+i} cx={22 + Math.cos(a) * 12} cy={22 + Math.sin(a) * 12} r={4} fill={t.accents.lime} />;
              })}
              {agains.map((_, i) => {
                const a = ((i / Math.max(agains.length, 1)) * Math.PI * 2 - Math.PI / 2) + Math.PI;
                return <SvgCircle key={'a'+i} cx={22 + Math.cos(a) * 12} cy={22 + Math.sin(a) * 12} r={4} fill={t.accents.cobalt} opacity={0.5} />;
              })}
            </Svg>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: t.fontBodyBold, fontSize: 16, color: t.ink, letterSpacing: t.letterSpacing, lineHeight: 18 }}>
                FOR speaks first
              </Text>
              <Text style={{ fontFamily: t.fontBody, fontSize: 12, color: t.inkSoft, marginTop: 3, lineHeight: 18 }}>
                Each person gets 60s. AGAINST listens first, then responds.
              </Text>
            </View>
          </View>
        </CCard>
      </View>

      {/* CTA */}
      <View style={{ paddingHorizontal: 20, paddingBottom: Math.max(insets.bottom + 16, 24) }}>
        <CButton
          t={t} full size="lg"
          disabled={!allVoted}
          onPress={handleAllVoted}
        >
          {allVoted ? 'Starting… (tap to skip)' : `Waiting · ${votes.length}/${totalPlayers || '?'}`}
        </CButton>
      </View>

      {/* Battle flash overlay */}
      <Animated.View
        pointerEvents="none"
        style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: t.ink,
          opacity: battleFlashAnim,
        }}
      />
    </View>
  );
}
