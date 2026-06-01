import { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, Animated } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle as SvgCircle, Line as SvgLine } from 'react-native-svg';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { useTheme } from '@/contexts/ThemeContext';
import { useProfile } from '@/contexts/ProfileContext';
import { CCard, CAvatar, CButton, MONO } from '@/components/ui';
import { getRoundVotes } from '@/services/game';
import { supabase } from '@/lib/supabase';

type Side = 'FOR' | 'AGAINST';
type Player = { id: string; name: string; color: string; side: Side };

const CIRCLE_SIZE = 264;
const CX = CIRCLE_SIZE / 2;
const CY = CIRCLE_SIZE / 2;
const RING_R = CIRCLE_SIZE / 2 - 36;
const TOTAL_TIME = 60;

export default function NormalRoundScreen() {
  const { theme: t } = useTheme();
  const { profile } = useProfile();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    topic?: string;
    roundNum?: string;
    totalRounds?: string;
    myVote?: string;
    sessionId?: string;
    roundId?: string;
  }>();

  const topic       = params.topic       || '';
  const roundNum    = params.roundNum    || '1';
  const totalRounds = params.totalRounds || '1';
  const myVote      = params.myVote      || 'FOR';
  const sessionId   = params.sessionId   || '';
  const roundId     = params.roundId     || '';

  const [players, setPlayers]       = useState<Player[]>([]);
  const [speakerIdx, setSpeakerIdx] = useState(0);
  const [timeLeft, setTimeLeft]     = useState(TOTAL_TIME);
  const [running, setRunning]       = useState(true);

  const channelRef = useRef<RealtimeChannel | null>(null);

  // Load votes once
  useEffect(() => {
    if (!roundId) return;
    getRoundVotes(roundId).then((votes) => {
      setPlayers(votes.map((v) => ({
        id: v.userId,
        name: v.profile?.username ?? '?',
        color: v.profile?.ringColor ?? (v.position === 'agree' ? t.accents.lime : t.accents.cobalt),
        side: v.position === 'agree' ? 'FOR' : 'AGAINST',
      })));
    });
  }, [roundId]);

  // Real-time speaker sync — all players subscribe, only the speaker can broadcast
  useEffect(() => {
    if (!roundId) return;
    const ch = supabase
      .channel(`speaker:${roundId}`, { config: { broadcast: { self: true } } })
      .on('broadcast', { event: 'speaker_advance' }, ({ payload }) => {
        if (payload.done) {
          router.replace({
            pathname: '/normal-mind-change',
            params: { topic, roundNum, totalRounds, sessionId, roundId, myVote },
          });
        } else {
          setSpeakerIdx(payload.idx);
          setTimeLeft(TOTAL_TIME);
          setRunning(true);
        }
      })
      .on('broadcast', { event: 'timer_sync' }, ({ payload }) => {
        setRunning(payload.running);
        setTimeLeft(payload.timeLeft);
      })
      .subscribe();
    channelRef.current = ch;
    return () => { supabase.removeChannel(ch); };
  }, [roundId]);

  const fors = players.filter((p) => p.side === 'FOR');
  const ags  = players.filter((p) => p.side === 'AGAINST');
  const speakerQueue = [...fors, ...ags];

  const speaker       = speakerQueue[speakerIdx];
  const phase: Side   = speakerIdx < fors.length ? 'FOR' : 'AGAINST';
  const isLastSpeaker = speakerIdx === speakerQueue.length - 1;
  const phaseColor    = phase === 'FOR' ? t.accents.lime : t.accents.cobalt;
  const timeColor     = timeLeft <= 10 ? t.accents.coral : phaseColor;
  const iAmSpeaker    = !!profile && !!speaker && profile.id === speaker.id;

  // Countdown (local — resets for everyone when speaker_advance is received)
  useEffect(() => {
    if (!running || !speaker) return;
    const id = setInterval(() => {
      setTimeLeft((s) => {
        if (s <= 1) { setRunning(false); return 0; }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [running, speaker]);

  // Broadcast the advance — called by the speaker only
  const handleAdvance = useCallback(async () => {
    if (!channelRef.current) return;
    await channelRef.current.send({
      type: 'broadcast',
      event: 'speaker_advance',
      payload: isLastSpeaker ? { done: true } : { idx: speakerIdx + 1 },
    });
  }, [isLastSpeaker, speakerIdx]);

  // Auto-advance when the speaker's timer runs out
  useEffect(() => {
    if (timeLeft === 0 && !running && iAmSpeaker) {
      handleAdvance();
    }
  }, [timeLeft, running, iAmSpeaker, handleAdvance]);

  // Speaker transition animations
  const cardSlideAnim    = useRef(new Animated.Value(50)).current;
  const cardOpacityAnim  = useRef(new Animated.Value(0)).current;
  const speakerBounce    = useRef(new Animated.Value(0.6)).current;
  const phaseFlashAnim   = useRef(new Animated.Value(0)).current;
  const prevIdxRef       = useRef(-1);
  const [phaseFlashColor, setPhaseFlashColor] = useState('');
  const [phaseLabel, setPhaseLabel]           = useState('');

  // Animate card + avatar every time speaker changes
  useEffect(() => {
    if (!speaker) return;
    const prevIdx = prevIdxRef.current;

    // Detect FOR → AGAINST phase transition
    if (prevIdx >= 0 && prevIdx < fors.length && speakerIdx >= fors.length && fors.length > 0) {
      setPhaseFlashColor(t.accents.cobalt);
      setPhaseLabel('AGAINST\nSPEAKS');
      Animated.sequence([
        Animated.timing(phaseFlashAnim, { toValue: 1, duration: 220, useNativeDriver: true }),
        Animated.delay(900),
        Animated.timing(phaseFlashAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
      ]).start();
    }
    prevIdxRef.current = speakerIdx;

    // Card slides up + avatar pops in
    cardSlideAnim.setValue(50);
    cardOpacityAnim.setValue(0);
    speakerBounce.setValue(0.55);
    Animated.parallel([
      Animated.spring(cardSlideAnim, { toValue: 0, friction: 7, tension: 100, useNativeDriver: true }),
      Animated.timing(cardOpacityAnim, { toValue: 1, duration: 240, useNativeDriver: true }),
      Animated.spring(speakerBounce, { toValue: 1, friction: 5, tension: 140, useNativeDriver: true }),
    ]).start();
  }, [speakerIdx]);

  // Pulse ring on active speaker
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const loopRef   = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    loopRef.current?.stop();
    if (running && speaker) {
      loopRef.current = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.14, duration: 800, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1,    duration: 800, useNativeDriver: true }),
        ])
      );
      loopRef.current.start();
    } else {
      Animated.timing(pulseAnim, { toValue: 1, duration: 200, useNativeDriver: true }).start();
    }
    return () => loopRef.current?.stop();
  }, [running, speakerIdx]);

  if (players.length === 0) {
    return (
      <View style={{ flex: 1, backgroundColor: t.bg, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontFamily: t.fontBody, fontSize: 15, color: t.inkSoft }}>Loading…</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      {/* Status bar */}
      <View style={{
        paddingTop: insets.top + 16, paddingHorizontal: 20,
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <Text style={{ fontFamily: MONO, fontSize: 11, letterSpacing: 2, color: t.inkSoft }}>
          R{roundNum} · {phase} SPEAKS
        </Text>
        <View style={{ paddingHorizontal: 10, paddingVertical: 3, borderRadius: 999, backgroundColor: phaseColor }}>
          <Text style={{ fontFamily: MONO, fontSize: 9, fontWeight: '700', letterSpacing: 1.5, color: t.ink }}>
            {speakerIdx + 1}/{speakerQueue.length}
          </Text>
        </View>
        <Text style={{ fontFamily: MONO, fontSize: 11, color: t.inkSoft }}>CERCLES</Text>
      </View>

      {/* Topic chip */}
      <View style={{ paddingHorizontal: 20, paddingTop: 8 }}>
        <CCard t={t} padding={10}>
          <Text style={{
            fontFamily: t.fontBodyBold, fontSize: 13, color: t.ink,
            letterSpacing: t.letterSpacing, textAlign: 'center', lineHeight: 18,
          }}>
            "{topic}"
          </Text>
        </CCard>
      </View>

      {/* Speaking circle */}
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <View style={{ width: CIRCLE_SIZE, height: CIRCLE_SIZE }}>

          {/* Dashed ring + connector lines */}
          <Svg
            viewBox={`0 0 ${CIRCLE_SIZE} ${CIRCLE_SIZE}`}
            style={{ position: 'absolute', width: CIRCLE_SIZE, height: CIRCLE_SIZE }}
          >
            <SvgCircle cx={CX} cy={CY} r={RING_R}
              fill="none" stroke={t.ink} strokeWidth={1}
              strokeDasharray="3 6" opacity={0.2}
            />
            {speakerQueue.map((p, i) => {
              const a = (i / speakerQueue.length) * Math.PI * 2 - Math.PI / 2;
              const x2 = CX + Math.cos(a) * RING_R;
              const y2 = CY + Math.sin(a) * RING_R;
              const isSpeaking = p.id === speaker.id;
              return (
                <SvgLine key={p.id}
                  x1={CX} y1={CY} x2={x2} y2={y2}
                  stroke={isSpeaking ? t.primary : t.inkSoft}
                  strokeWidth={isSpeaking ? 2 : 0.8}
                  opacity={isSpeaking ? 0.9 : 0.15}
                  strokeDasharray={isSpeaking ? undefined : '2 5'}
                />
              );
            })}
          </Svg>

          {/* Player avatars */}
          {speakerQueue.map((p, i) => {
            const a = (i / speakerQueue.length) * Math.PI * 2 - Math.PI / 2;
            const ax = CX + Math.cos(a) * RING_R;
            const ay = CY + Math.sin(a) * RING_R;

            const isSpeaking      = p.id === speaker.id;
            const hasSpokeAlready = speakerQueue.slice(0, speakerIdx).some((s) => s.id === p.id);
            const isOppositePhase = p.side !== phase;
            const isWaiting       = p.side === phase && !isSpeaking && !hasSpokeAlready;

            let opacity = 1;
            if (isOppositePhase)    opacity = 0.2;
            else if (hasSpokeAlready) opacity = 0.35;
            else if (isWaiting)     opacity = 0.6;

            const avatarSize = isSpeaking ? 58 : 44;

            return (
              <Animated.View key={p.id} style={{
                position: 'absolute',
                left: ax - avatarSize / 2,
                top: ay - avatarSize / 2,
                alignItems: 'center',
                opacity,
                zIndex: isSpeaking ? 2 : 1,
                transform: isSpeaking ? [{ scale: speakerBounce }] : [],
              }}>
                {isSpeaking && (
                  <Animated.View style={{
                    position: 'absolute',
                    width: avatarSize + 14, height: avatarSize + 14, borderRadius: 999,
                    borderWidth: 2.5, borderColor: phaseColor,
                    top: -7, left: -7,
                    transform: [{ scale: pulseAnim }],
                    opacity: 0.75,
                  }} />
                )}
                <CAvatar color={p.color} initial={p.name[0]} size={avatarSize} t={t} />
                {hasSpokeAlready && (
                  <View style={{
                    position: 'absolute', top: -4, right: -4,
                    width: 16, height: 16, borderRadius: 8,
                    backgroundColor: t.accents.lime, borderWidth: 1.5, borderColor: t.bg,
                    alignItems: 'center', justifyContent: 'center', zIndex: 3,
                  }}>
                    <Text style={{ fontSize: 9, fontWeight: '900', color: t.ink }}>✓</Text>
                  </View>
                )}
                <Text style={{
                  marginTop: 4, fontFamily: MONO, fontSize: 9, fontWeight: '700',
                  letterSpacing: 1, textTransform: 'uppercase',
                  color: isSpeaking ? t.ink : t.inkSoft,
                }}>
                  {isSpeaking ? p.name : p.name[0]}
                </Text>
              </Animated.View>
            );
          })}

          {/* Center: phase label */}
          <View style={{
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
            alignItems: 'center', justifyContent: 'center',
          }}>
            <Text style={{
              fontFamily: MONO, fontSize: 9, letterSpacing: 2,
              textTransform: 'uppercase', color: t.inkSoft, marginBottom: 2,
            }}>phase</Text>
            <Text style={{
              fontFamily: t.fontDisplay, fontSize: 15,
              color: t.ink, letterSpacing: t.letterSpacing,
            }}>{phase}</Text>
          </View>

        </View>
      </View>

      {/* Now speaking card + timer bar */}
      <Animated.View style={{
        paddingHorizontal: 20, paddingBottom: 8,
        transform: [{ translateY: cardSlideAnim }],
        opacity: cardOpacityAnim,
      }}>
        <CCard t={t} padding={0} style={{ overflow: 'hidden' }}>
          <View style={{
            padding: 12, paddingHorizontal: 14,
            flexDirection: 'row', alignItems: 'center', gap: 12,
            borderBottomWidth: 1, borderBottomColor: t.bgAlt,
          }}>
            <CAvatar color={speaker.color} initial={speaker.name[0]} size={40} t={t} />
            <View style={{ flex: 1 }}>
              <Text style={{
                fontFamily: MONO, fontSize: 9, letterSpacing: 1.5,
                color: t.inkSoft, textTransform: 'uppercase',
              }}>Now speaking</Text>
              <Text style={{
                fontFamily: t.fontDisplay, fontSize: 18, color: t.ink,
                letterSpacing: t.letterSpacing, lineHeight: 22, marginTop: 1,
              }}>{speaker.name}</Text>
            </View>
            <View style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, backgroundColor: phaseColor }}>
              <Text style={{ fontFamily: MONO, fontSize: 10, fontWeight: '700', letterSpacing: 1, color: t.ink }}>
                {phase}
              </Text>
            </View>
            <Text style={{
              fontFamily: t.fontDisplay, fontSize: 26, letterSpacing: -0.78,
              color: timeColor, minWidth: 44, textAlign: 'right',
            }}>{timeLeft}s</Text>
          </View>
          {/* Timer bar */}
          <View style={{ height: 5, backgroundColor: t.bgAlt, flexDirection: 'row' }}>
            <View style={{ flex: timeLeft, backgroundColor: timeColor }} />
            <View style={{ flex: TOTAL_TIME - timeLeft }} />
          </View>
        </CCard>
      </Animated.View>

      {/* Controls — speaker gets buttons, everyone else waits */}
      <View style={{ paddingHorizontal: 20, paddingBottom: Math.max(insets.bottom + 16, 24) }}>
        {iAmSpeaker ? (
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <CButton t={t} variant="outline" onPress={() => {
              const next = !running;
              channelRef.current?.send({
                type: 'broadcast', event: 'timer_sync',
                payload: { running: next, timeLeft },
              });
            }} style={{ flex: 1 }}>
              {running ? 'Pause' : 'Resume'}
            </CButton>
            <CButton t={t} onPress={handleAdvance} style={{ flex: 2 }}>
              {isLastSpeaker ? 'Close the floor →' : 'Pass the mic →'}
            </CButton>
          </View>
        ) : (
          <View style={{ height: 52, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{
              fontFamily: MONO, fontSize: 11, letterSpacing: 2,
              textTransform: 'uppercase', color: t.inkSoft,
            }}>
              Listening to {speaker.name}…
            </Text>
          </View>
        )}
      </View>

      {/* Phase transition overlay — flashes when FOR → AGAINST */}
      <Animated.View
        pointerEvents="none"
        style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: phaseFlashColor,
          opacity: phaseFlashAnim,
          alignItems: 'center', justifyContent: 'center',
          zIndex: 50,
        }}
      >
        <Text style={{
          fontFamily: t.fontDisplay, fontSize: 52, color: '#fff',
          letterSpacing: t.letterSpacing, textAlign: 'center', lineHeight: 54,
        }}>
          {phaseLabel}
        </Text>
        <Text style={{
          fontFamily: MONO, fontSize: 11, letterSpacing: 2.5,
          color: 'rgba(255,255,255,0.75)', marginTop: 12, textTransform: 'uppercase',
        }}>
          Your turn to respond
        </Text>
      </Animated.View>
    </View>
  );
}
