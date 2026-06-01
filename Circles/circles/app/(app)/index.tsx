import { useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as storage from '@/lib/storage';
import Svg, { Circle as SvgCircle } from 'react-native-svg';
import { useTheme } from '@/contexts/ThemeContext';
import { useProfile } from '@/contexts/ProfileContext';
import { CLogo, CAvatar, CCard, CTabBar, MONO } from '@/components/ui';

const MOCK_CERCLES = [
  { name: 'Roommates', members: 4, accentIdx: 0, last: 'Tue · Pineapple pizza' },
  { name: 'Soccer crew', members: 7, accentIdx: 2, last: 'Sat · Tipping culture' },
  { name: 'Sunday dinner', members: 5, accentIdx: 3, last: 'Sun · Open relationships' },
];

export default function HomeScreen() {
  const { theme: t } = useTheme();
  const { profile } = useProfile();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const accentValues = Object.values(t.accents);

  useEffect(() => {
    // Show onboarding for first-time users
    storage.getItem('hasSeenOnboarding').then((val) => {
      if (!val) router.push('/onboarding');
    });
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={{
          paddingTop: insets.top + 16, paddingHorizontal: 20, paddingBottom: 4,
          flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <CLogo t={t} size={28} />
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <TouchableOpacity onPress={() => {}}>
              <View style={{
                width: 36, height: 36, borderRadius: 18,
                backgroundColor: t.paper,
                alignItems: 'center', justifyContent: 'center',
                ...(t.cardBorder && { borderWidth: t.cardBorderWidth, borderColor: t.cardBorderColor }),
              }}>
                <Text style={{ fontSize: 16 }}>🔔</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/profile')}>
              <CAvatar color={profile?.ringColor ?? accentValues[1]} initial={profile?.avatar ?? '?'} size={36} t={t} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Hero CTA */}
        <View style={{ paddingHorizontal: 20, paddingTop: 20 }}>
          <TouchableOpacity
            onPress={() => router.push('/create-room')}
            activeOpacity={0.88}
            style={{
              backgroundColor: t.primary,
              borderRadius: t.radius,
              overflow: 'hidden',
              position: 'relative',
              ...(t.cardBorder && { borderWidth: t.cardBorderWidth, borderColor: t.cardBorderColor }),
              ...(t.isHardShadow && {
                shadowColor: t.ink,
                shadowOffset: { width: 4, height: 4 },
                shadowOpacity: 1,
                shadowRadius: 0,
              }),
            }}
          >
            {/* Decorative rings */}
            <Svg
              width={180} height={180}
              viewBox="0 0 180 180"
              style={{ position: 'absolute', right: -60, top: -40 }}
              opacity={0.25}
            >
              {[40, 60, 80, 100].map((r, i) => (
                <SvgCircle key={i} cx={90} cy={90} r={r} fill="none" stroke={t.primaryFg} strokeWidth={1.5} />
              ))}
            </Svg>

            <View style={{ padding: 20, paddingRight: 100 }}>
              <Text style={{ fontFamily: MONO, fontSize: 11, letterSpacing: 1.5, color: t.primaryFg, opacity: 0.8, textTransform: 'uppercase' }}>
                Tonight
              </Text>
              <Text style={{
                fontFamily: t.fontDisplay, fontSize: 36, lineHeight: 38,
                color: t.primaryFg, letterSpacing: t.letterSpacing, marginTop: 8,
              }}>
                Start a new{'\n'}cercle →
              </Text>
              <Text style={{ fontFamily: t.fontBody, fontSize: 14, color: t.primaryFg, opacity: 0.85, marginTop: 14 }}>
                Pick a deck, invite the room, debate it out.
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Your cercles */}
        <View style={{ paddingHorizontal: 20, paddingTop: 24 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
            <Text style={{
              fontFamily: t.fontDisplay, fontSize: 18, color: t.ink, letterSpacing: t.letterSpacing,
            }}>
              Your cercles
            </Text>
            <Text style={{ fontFamily: t.fontBody, fontSize: 13, color: t.inkSoft }}>See all</Text>
          </View>

          <View style={{ gap: 10 }}>
            {MOCK_CERCLES.map((c, i) => (
              <CCard
                key={i} t={t} padding={14}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}
                onPress={() => {}}
              >
                <View style={{ position: 'relative', flexShrink: 0 }}>
                  <View style={{
                    width: 52, height: 52, borderRadius: 26,
                    backgroundColor: accentValues[c.accentIdx],
                    alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Text style={{ fontFamily: t.fontDisplay, fontSize: 22, color: t.primaryFg }}>
                      {c.name[0]}
                    </Text>
                  </View>
                  <View style={{
                    position: 'absolute', bottom: -2, right: -2,
                    width: 22, height: 22, borderRadius: 11,
                    backgroundColor: t.bg,
                    alignItems: 'center', justifyContent: 'center',
                    borderWidth: 1.5, borderColor: t.ink,
                  }}>
                    <Text style={{ fontFamily: MONO, fontSize: 10, color: t.ink }}>{c.members}</Text>
                  </View>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: t.fontBodyBold, fontSize: 17, color: t.ink, letterSpacing: t.letterSpacing }}>
                    {c.name}
                  </Text>
                  <Text style={{ fontFamily: t.fontBody, fontSize: 13, color: t.inkSoft, marginTop: 2 }}>
                    {c.last}
                  </Text>
                </View>
                <Text style={{ fontSize: 22, color: t.inkSoft }}>›</Text>
              </CCard>
            ))}
          </View>
        </View>

        {/* Join with code */}
        <View style={{ paddingHorizontal: 20, paddingTop: 16 }}>
          <CCard
            t={t} padding={16}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}
            onPress={() => router.push('/join-room')}
          >
            <View style={{
              width: 44, height: 44, borderRadius: t.radiusSm,
              backgroundColor: t.accents.lime,
              alignItems: 'center', justifyContent: 'center',
            }}>
              <Text style={{ fontFamily: t.fontDisplay, fontSize: 22, color: t.ink }}>#</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: t.fontBodyBold, fontSize: 16, color: t.ink, letterSpacing: t.letterSpacing }}>
                Join with code
              </Text>
              <Text style={{ fontFamily: t.fontBody, fontSize: 13, color: t.inkSoft }}>
                4 letters from your host
              </Text>
            </View>
            <Text style={{ fontSize: 22, color: t.inkSoft }}>›</Text>
          </CCard>
        </View>
      </ScrollView>

      <CTabBar t={t} active="home" />
    </View>
  );
}
