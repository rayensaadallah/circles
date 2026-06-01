import { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, Animated } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle as SvgCircle } from 'react-native-svg';
import { useTheme } from '@/contexts/ThemeContext';
import { useProfile } from '@/contexts/ProfileContext';
import { MONO } from '@/components/ui';
import { getOrCreateDebateRound, submitVote } from '@/services/game';

export default function NormalTopicRevealScreen() {
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

  const topic       = params.topic       || '';
  const roundNum    = params.roundNum    || '1';
  const totalRounds = params.totalRounds || '1';
  const sessionId   = params.sessionId   || '';

  const [picked, setPicked]       = useState<'FOR' | 'AGAINST' | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [roundId, setRoundId]     = useState<string | null>(null);

  const fadeAnim        = useRef(new Animated.Value(0)).current;
  const confirmBounce   = useRef(new Animated.Value(1)).current;
  const flashAnim       = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, delay: 150, useNativeDriver: true }).start();
  }, []);

  // Create or fetch the debate round for this round index
  useEffect(() => {
    if (!sessionId) return;
    getOrCreateDebateRound(sessionId, Number(roundNum) - 1).then((round) => {
      if (round) setRoundId(round.id);
    });
  }, [sessionId, roundNum]);

  const handleConfirm = async () => {
    if (!picked || confirmed) return;
    setConfirmed(true);

    // Button bounce + flash
    Animated.sequence([
      Animated.timing(confirmBounce, { toValue: 0.93, duration: 80, useNativeDriver: true }),
      Animated.spring(confirmBounce, { toValue: 1, friction: 3, tension: 400, useNativeDriver: true }),
    ]).start();
    Animated.sequence([
      Animated.timing(flashAnim, { toValue: 0.18, duration: 100, useNativeDriver: true }),
      Animated.timing(flashAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start();

    if (roundId && profile) {
      await submitVote(roundId, profile.id, picked === 'FOR' ? 'agree' : 'disagree');
    }

    setTimeout(() => {
      router.replace({
        pathname: '/normal-tally',
        params: { topic, roundNum, totalRounds, sessionId, roundId: roundId ?? '', myVote: picked },
      });
    }, 600);
  };

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      {/* Concentric rings backdrop */}
      <Svg
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
        viewBox="0 0 393 852"
        preserveAspectRatio="xMidYMid slice"
      >
        {[60, 120, 190, 270, 360].map((r, i) => (
          <SvgCircle key={i} cx={196} cy={320} r={r}
            fill="none" stroke={t.ink} strokeWidth={1}
            opacity={Math.max(0, 0.045 - i * 0.006)}
          />
        ))}
      </Svg>

      {/* Status */}
      <View style={{
        paddingTop: insets.top + 16, paddingHorizontal: 20,
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <Text style={{ fontFamily: MONO, fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: t.inkSoft }}>
          Round {roundNum} of {totalRounds}
        </Text>
        <Text style={{ fontFamily: MONO, fontSize: 11, letterSpacing: 2, color: t.inkSoft }}>CERCLES</Text>
      </View>

      {/* Question */}
      <Animated.View style={{ flex: 1, justifyContent: 'center', paddingHorizontal: 28, opacity: fadeAnim }}>
        <Text style={{
          fontFamily: MONO, fontSize: 11, letterSpacing: 2.5,
          textTransform: 'uppercase', color: t.inkSoft, marginBottom: 18,
        }}>
          The question
        </Text>
        <Text style={{
          fontFamily: t.fontDisplay, fontSize: 40, lineHeight: 42,
          color: t.ink, letterSpacing: t.letterSpacing,
        }}>
          {topic}
        </Text>
        <Text style={{
          marginTop: 22, fontFamily: t.fontBody, fontSize: 14,
          color: t.inkSoft, lineHeight: 22, maxWidth: 300,
        }}>
          Vote privately. No one sees your answer until everyone has chosen.
        </Text>
      </Animated.View>

      {/* Vote + confirm */}
      <View style={{ paddingHorizontal: 20, paddingBottom: Math.max(insets.bottom + 20, 32) }}>
        <Text style={{
          fontFamily: MONO, fontSize: 10, letterSpacing: 2,
          textTransform: 'uppercase', color: t.inkSoft,
          marginBottom: 12, textAlign: 'center',
        }}>
          Your position
        </Text>

        <View style={{ flexDirection: 'row', gap: 10 }}>
          {/* FOR */}
          <TouchableOpacity
            onPress={() => !confirmed && setPicked('FOR')}
            activeOpacity={confirmed ? 1 : 0.8}
            style={{
              flex: 1, height: 80, borderRadius: t.radius,
              backgroundColor: picked === 'FOR' ? t.accents.lime : t.paper,
              alignItems: 'center', justifyContent: 'center',
              ...(t.cardBorder && { borderWidth: t.cardBorderWidth, borderColor: t.cardBorderColor }),
              ...(picked === 'FOR' && t.isHardShadow && {
                shadowColor: t.ink, shadowOffset: { width: 3, height: 3 },
                shadowOpacity: 1, shadowRadius: 0,
              }),
            }}
          >
            <Text style={{ fontFamily: t.fontDisplay, fontSize: 22, color: t.ink, letterSpacing: t.letterSpacing }}>FOR</Text>
            <Text style={{ fontFamily: MONO, fontSize: 9, letterSpacing: 1.5, color: t.inkSoft, textTransform: 'uppercase', marginTop: 3 }}>I agree</Text>
          </TouchableOpacity>

          {/* AGAINST */}
          <TouchableOpacity
            onPress={() => !confirmed && setPicked('AGAINST')}
            activeOpacity={confirmed ? 1 : 0.8}
            style={{
              flex: 1, height: 80, borderRadius: t.radius,
              backgroundColor: picked === 'AGAINST' ? t.accents.cobalt : t.paper,
              alignItems: 'center', justifyContent: 'center',
              ...(t.cardBorder && { borderWidth: t.cardBorderWidth, borderColor: t.cardBorderColor }),
              ...(picked === 'AGAINST' && t.isHardShadow && {
                shadowColor: t.ink, shadowOffset: { width: 3, height: 3 },
                shadowOpacity: 1, shadowRadius: 0,
              }),
            }}
          >
            <Text style={{
              fontFamily: t.fontDisplay, fontSize: 22, letterSpacing: t.letterSpacing,
              color: picked === 'AGAINST' ? '#fff' : t.ink,
            }}>AGAINST</Text>
            <Text style={{
              fontFamily: MONO, fontSize: 9, letterSpacing: 1.5, textTransform: 'uppercase', marginTop: 3,
              color: picked === 'AGAINST' ? 'rgba(255,255,255,0.75)' : t.inkSoft,
            }}>I disagree</Text>
          </TouchableOpacity>
        </View>

        {/* Lock in */}
        <Animated.View style={{ transform: [{ scale: confirmBounce }] }}>
          <TouchableOpacity
            onPress={handleConfirm}
            activeOpacity={picked ? 0.85 : 1}
            style={{
              marginTop: 12, height: 56, borderRadius: 999,
              backgroundColor: picked ? t.ink : t.bgAlt,
              alignItems: 'center', justifyContent: 'center',
            }}
          >
            <Text style={{
              fontFamily: t.fontBodyBold, fontSize: 17, letterSpacing: t.letterSpacing,
              color: picked ? t.bg : t.inkSoft,
            }}>
              {confirmed ? 'Locked in ✓' : picked ? `Lock in · ${picked} →` : 'Choose your side'}
            </Text>
          </TouchableOpacity>
        </Animated.View>

        {picked && !confirmed && (
          <Text style={{
            marginTop: 10, textAlign: 'center',
            fontFamily: t.fontBody, fontSize: 12, color: t.inkSoft, lineHeight: 18,
          }}>
            Your vote is hidden until everyone has answered.
          </Text>
        )}
      </View>

      {/* Confirm flash overlay */}
      <Animated.View
        pointerEvents="none"
        style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: picked === 'FOR' ? t.accents.lime : t.accents.cobalt,
          opacity: flashAnim,
        }}
      />
    </View>
  );
}
