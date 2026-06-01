import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle as SvgCircle } from 'react-native-svg';
import { useTheme } from '@/contexts/ThemeContext';
import { useProfile } from '@/contexts/ProfileContext';
import { CCard, CAvatar, MONO } from '@/components/ui';
import { getRoundVotes, submitRevote, getSessionTopics } from '@/services/game';
import type { RoundVote } from '@/types/database';

type Side = 'FOR' | 'AGAINST';

export default function NormalMindChangeScreen() {
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

  const roundNum    = params.roundNum    || '1';
  const totalRounds = params.totalRounds || '1';
  const myVote: Side = (params.myVote as Side) || 'FOR';
  const sessionId   = params.sessionId   || '';
  const roundId     = params.roundId     || '';

  const [step, setStep]           = useState<'vote' | 'attribution'>('vote');
  const [changed, setChanged]     = useState<boolean | null>(null);
  const [attributed, setAttributed] = useState<string | null>(null);
  const [votes, setVotes]         = useState<RoundVote[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!roundId) return;
    getRoundVotes(roundId).then(setVotes);
  }, [roundId]);

  const opposingSide: Side  = myVote === 'FOR' ? 'AGAINST' : 'FOR';
  const allPlayers          = votes.map((v) => ({
    id: v.userId,
    name: v.profile?.username ?? '?',
    color: v.profile?.ringColor ?? (v.position === 'agree' ? t.accents.lime : t.accents.cobalt),
    side: v.position === 'agree' ? 'FOR' as Side : 'AGAINST' as Side,
  }));
  const opposingSpeakers = allPlayers.filter((p) => p.side === opposingSide);
  const fors    = allPlayers.filter((p) => p.side === 'FOR');
  const agains  = allPlayers.filter((p) => p.side === 'AGAINST');

  const navigateForward = async () => {
    const nextRound = Number(roundNum) + 1;
    if (nextRound <= Number(totalRounds)) {
      const topics = await getSessionTopics(sessionId);
      const nextTopic = topics[nextRound - 1]?.text ?? '';
      router.replace({
        pathname: '/topic-reveal',
        params: {
          sessionId,
          topic: nextTopic,
          totalRounds,
          roundNum: String(nextRound),
        },
      });
    } else {
      router.replace('/');
    }
  };

  const handleVote = (didChange: boolean) => {
    setChanged(didChange);
    if (didChange) {
      setTimeout(() => setStep('attribution'), 300);
    } else {
      navigateForward();
    }
  };

  const handleDone = async () => {
    if (!attributed || submitting) return;
    setSubmitting(true);

    if (roundId && profile) {
      const newPosition = myVote === 'FOR' ? 'disagree' : 'agree';
      const convincedBy = attributed === 'both' ? undefined : attributed;
      await submitRevote(roundId, profile.id, newPosition, convincedBy);
    }

    navigateForward();
  };

  // ── Attribution step ──────────────────────────────────────────
  if (step === 'attribution') {
    return (
      <View style={{ flex: 1, backgroundColor: t.bg }}>
        <View style={{
          paddingTop: insets.top + 16, paddingHorizontal: 20,
          flexDirection: 'row', alignItems: 'center', gap: 12,
        }}>
          <TouchableOpacity onPress={() => setStep('vote')}>
            <Text style={{ fontSize: 22, color: t.ink }}>←</Text>
          </TouchableOpacity>
          <Text style={{ fontFamily: MONO, fontSize: 11, letterSpacing: 2, color: t.inkSoft }}>
            R{roundNum} · ATTRIBUTION
          </Text>
        </View>

        <View style={{ paddingHorizontal: 24, paddingTop: 20, paddingBottom: 8 }}>
          <Text style={{
            fontFamily: t.fontDisplay, fontSize: 30, color: t.ink,
            letterSpacing: t.letterSpacing, lineHeight: 32,
          }}>
            Who{'\n'}convinced you?
          </Text>
          <Text style={{ fontFamily: t.fontBody, fontSize: 13, color: t.inkSoft, marginTop: 8, lineHeight: 20 }}>
            You were <Text style={{ color: t.ink, fontFamily: t.fontBodyBold }}>{myVote}</Text>. Who from the {opposingSide} side got to you?
          </Text>
        </View>

        {/* Speaker cards */}
        <View style={{ flex: 1, paddingHorizontal: 20, gap: 10 }}>
          {opposingSpeakers.map((p) => (
            <CCard key={p.id} t={t} padding={0}
              onPress={() => setAttributed(p.id)}
              style={{
                flex: 1, overflow: 'hidden',
                backgroundColor: attributed === p.id ? p.color : t.paper,
                ...(attributed === p.id && { borderWidth: 3, borderColor: t.ink }),
              }}
            >
              <View style={{ padding: 18, flex: 1, flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                <CAvatar
                  color={attributed === p.id ? t.ink : p.color}
                  initial={p.name[0]} size={56} t={t}
                />
                <View style={{ flex: 1 }}>
                  <Text style={{
                    fontFamily: t.fontDisplay, fontSize: 24, color: t.ink,
                    letterSpacing: t.letterSpacing, lineHeight: 26,
                  }}>{p.name}</Text>
                  <View style={{
                    marginTop: 6, alignSelf: 'flex-start',
                    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999,
                    backgroundColor: opposingSide === 'FOR' ? t.accents.lime : t.accents.cobalt,
                  }}>
                    <Text style={{ fontFamily: MONO, fontSize: 9, fontWeight: '700', letterSpacing: 1.5, color: t.ink }}>
                      {opposingSide}
                    </Text>
                  </View>
                </View>
                <View style={{
                  width: 32, height: 32, borderRadius: 16,
                  backgroundColor: attributed === p.id ? t.ink : 'transparent',
                  borderWidth: attributed === p.id ? 0 : 1.5,
                  borderColor: t.inkSoft,
                  alignItems: 'center', justifyContent: 'center',
                }}>
                  {attributed === p.id && (
                    <Text style={{ fontSize: 16, color: t.bg }}>✓</Text>
                  )}
                </View>
              </View>
            </CCard>
          ))}

          {/* Both equally */}
          {opposingSpeakers.length > 1 && (
            <CCard t={t} padding={14}
              onPress={() => setAttributed('both')}
              style={{ backgroundColor: attributed === 'both' ? t.accents.yellow : t.paper }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <View style={{
                  width: 40, height: 40, borderRadius: 20,
                  backgroundColor: attributed === 'both' ? t.ink : t.bgAlt,
                  alignItems: 'center', justifyContent: 'center',
                }}>
                  <Text style={{
                    fontFamily: t.fontDisplay, fontSize: 18,
                    color: attributed === 'both' ? t.bg : t.inkSoft,
                  }}>=</Text>
                </View>
                <Text style={{
                  fontFamily: t.fontBodyBold, fontSize: 17, color: t.ink,
                  letterSpacing: t.letterSpacing,
                }}>Both equally</Text>
              </View>
            </CCard>
          )}
        </View>

        <View style={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: Math.max(insets.bottom + 16, 24) }}>
          <TouchableOpacity
            onPress={handleDone}
            activeOpacity={attributed ? 0.85 : 1}
            style={{
              height: 56, borderRadius: 999,
              backgroundColor: attributed ? t.ink : t.bgAlt,
              alignItems: 'center', justifyContent: 'center',
            }}
          >
            <Text style={{
              fontFamily: t.fontBodyBold, fontSize: 17, letterSpacing: t.letterSpacing,
              color: attributed ? t.bg : t.inkSoft,
            }}>{submitting ? 'Saving…' : 'Lock in →'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ── Vote step (did you change your mind?) ─────────────────────
  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      {/* BG rings */}
      <Svg
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
        viewBox="0 0 393 852"
        preserveAspectRatio="xMidYMid slice"
      >
        {[60, 130, 210, 300].map((r, i) => (
          <SvgCircle key={i} cx={196} cy={420} r={r}
            fill="none" stroke={t.ink} strokeWidth={1}
            opacity={Math.max(0, 0.04 - i * 0.005)}
          />
        ))}
      </Svg>

      <View style={{
        paddingTop: insets.top + 16, paddingHorizontal: 20,
        flexDirection: 'row', justifyContent: 'space-between',
      }}>
        <Text style={{ fontFamily: MONO, fontSize: 11, letterSpacing: 2, color: t.inkSoft }}>
          R{roundNum} · END
        </Text>
        <Text style={{ fontFamily: MONO, fontSize: 11, letterSpacing: 2, color: t.inkSoft }}>CERCLES</Text>
      </View>

      {/* All avatars stacked */}
      <View style={{ paddingHorizontal: 20, paddingTop: 16 }}>
        <Text style={{
          fontFamily: MONO, fontSize: 10, letterSpacing: 1.5,
          textTransform: 'uppercase', color: t.inkSoft, marginBottom: 12,
        }}>Round complete</Text>
        <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
          {allPlayers.map((p, i) => (
            <View key={p.id} style={{ marginLeft: i === 0 ? 0 : -10, zIndex: allPlayers.length - i }}>
              <CAvatar color={p.color} initial={p.name[0]} size={44} t={t} />
            </View>
          ))}
        </View>
        {(fors.length > 0 || agains.length > 0) && (
          <View style={{
            marginTop: 10, flexDirection: 'row', alignItems: 'center',
            justifyContent: 'center', gap: 4,
          }}>
            <Text style={{ color: t.accents.lime, fontFamily: MONO, fontSize: 10, fontWeight: '700' }}>●</Text>
            <Text style={{ fontFamily: MONO, fontSize: 10, color: t.inkSoft, letterSpacing: 1 }}>{fors.length} FOR</Text>
            <Text style={{ fontFamily: MONO, fontSize: 10, color: t.inkSoft, marginHorizontal: 4 }}>·</Text>
            <Text style={{ color: t.accents.cobalt, fontFamily: MONO, fontSize: 10, fontWeight: '700' }}>●</Text>
            <Text style={{ fontFamily: MONO, fontSize: 10, color: t.inkSoft, letterSpacing: 1 }}>{agains.length} AGAINST</Text>
          </View>
        )}
      </View>

      {/* Big question */}
      <View style={{ flex: 1, justifyContent: 'center', paddingHorizontal: 28 }}>
        <Text style={{
          fontFamily: t.fontDisplay, fontSize: 38, color: t.ink,
          letterSpacing: t.letterSpacing, lineHeight: 40,
        }}>
          Did you change your mind?
        </Text>
        <Text style={{ fontFamily: t.fontBody, fontSize: 14, color: t.inkSoft, marginTop: 12, lineHeight: 22 }}>
          You voted <Text style={{ fontFamily: t.fontBodyBold, color: t.ink }}>{myVote}</Text> at the start. Still feel the same?
        </Text>
      </View>

      {/* YES / NO */}
      <View style={{ paddingHorizontal: 20, paddingBottom: Math.max(insets.bottom + 20, 32), gap: 10 }}>
        {/* YES */}
        <TouchableOpacity
          onPress={() => handleVote(true)}
          activeOpacity={0.85}
          style={{
            height: 80, borderRadius: t.radius,
            backgroundColor: changed === true ? t.accents.lime : t.paper,
            alignItems: 'center', justifyContent: 'center',
            ...(t.cardBorder && { borderWidth: t.cardBorderWidth, borderColor: t.cardBorderColor }),
            ...(changed === true && t.isHardShadow && {
              shadowColor: t.ink, shadowOffset: { width: 3, height: 3 },
              shadowOpacity: 1, shadowRadius: 0,
            }),
          }}
        >
          <Text style={{
            fontFamily: t.fontDisplay, fontSize: 22, color: t.ink,
            letterSpacing: t.letterSpacing,
          }}>Yes, I changed my mind</Text>
          <Text style={{ fontFamily: t.fontBody, fontSize: 12, color: t.inkSoft, marginTop: 3 }}>
            Tell us who convinced you →
          </Text>
        </TouchableOpacity>

        {/* NO */}
        <TouchableOpacity
          onPress={() => { setChanged(false); setTimeout(() => navigateForward(), 300); }}
          activeOpacity={0.85}
          style={{
            height: 60, borderRadius: 999,
            backgroundColor: changed === false ? t.ink : 'transparent',
            borderWidth: 1.5,
            borderColor: changed === false ? t.ink : t.inkSoft,
            alignItems: 'center', justifyContent: 'center',
          }}
        >
          <Text style={{
            fontFamily: t.fontBodyBold, fontSize: 17, letterSpacing: t.letterSpacing,
            color: changed === false ? t.bg : t.ink,
          }}>
            No, I'm still {myVote}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
