import { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import Svg, { Circle as SvgCircle } from 'react-native-svg';
import { useTheme } from '@/contexts/ThemeContext';
import { CCard, CTabBar, MONO } from '@/components/ui';
import { comboStore } from '@/store/combo-store';
import { CATEGORY_COLORS } from '@/services/topics';

const FILTER_CHIPS = ['All', 'Spicy', 'Chill', 'Debate', 'Social'];

const DECKS = [
  { name: 'Hot Takes',        categoryId: 'hot_takes',       icon: '🔥', topics: 15 },
  { name: 'Relationships',    categoryId: 'relationships',    icon: '◎',  topics: 15 },
  { name: 'Lifestyle',        categoryId: 'lifestyle',        icon: '✦',  topics: 15 },
  { name: 'Philosophy',       categoryId: 'philosophy',       icon: '∞',  topics: 15 },
  { name: 'Politics',         categoryId: 'politics',         icon: '⚖',  topics: 15 },
  { name: 'Tech',             categoryId: 'tech',             icon: '◈',  topics: 15 },
  { name: 'Fun',              categoryId: 'fun',              icon: '🎉', topics: 15 },
  { name: 'Would You Rather', categoryId: 'would_you_rather', icon: '⇄',  topics: 15 },
];

export default function DiscoverScreen() {
  const { theme: t } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [activeFilter, setActiveFilter] = useState('All');
  const [, forceUpdate] = useState(0);

  // Re-read combo count every time this screen is focused
  useFocusEffect(useCallback(() => { forceUpdate((n) => n + 1); }, []));

  const comboCount = comboStore.count;
  const bottomPad = 110;

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <ScrollView contentContainerStyle={{ paddingBottom: bottomPad }} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={{
          paddingTop: insets.top + 16, paddingHorizontal: 20, paddingBottom: 8,
          flexDirection: 'row', alignItems: 'center',
        }}>
          <Text style={{ fontFamily: t.fontDisplay, fontSize: 32, color: t.ink, letterSpacing: t.letterSpacing, flex: 1 }}>
            Decks
          </Text>
          {comboCount > 0 && (
            <TouchableOpacity
              onPress={() => router.push('/combo-review')}
              style={{
                flexDirection: 'row', alignItems: 'center', gap: 6,
                backgroundColor: t.primary, borderRadius: 999,
                paddingHorizontal: 14, paddingVertical: 8,
              }}
            >
              <Text style={{ fontFamily: MONO, fontSize: 12, color: t.primaryFg }}>◉</Text>
              <Text style={{ fontFamily: t.fontBodyBold, fontSize: 13, color: t.primaryFg, letterSpacing: t.letterSpacing }}>
                My Combo · {comboCount}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Filter chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, gap: 8, paddingBottom: 14 }}>
          {FILTER_CHIPS.map((c) => (
            <TouchableOpacity
              key={c}
              onPress={() => setActiveFilter(c)}
              style={{
                paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999,
                backgroundColor: activeFilter === c ? t.ink : t.paper,
                ...(t.cardBorder && activeFilter !== c && { borderWidth: t.cardBorderWidth, borderColor: t.cardBorderColor }),
              }}
            >
              <Text style={{
                fontFamily: t.fontBodyBold, fontSize: 13, letterSpacing: t.letterSpacing,
                color: activeFilter === c ? t.bg : t.ink,
              }}>
                {c}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Featured deck */}
        <View style={{ paddingHorizontal: 20, marginBottom: 14 }}>
          <CCard t={t} padding={0} color={CATEGORY_COLORS['hot_takes']} style={{ overflow: 'hidden', position: 'relative' }}>
            <View style={{ padding: 20, paddingRight: 80 }}>
              <Text style={{ fontFamily: MONO, fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: t.ink, opacity: 0.7 }}>
                Featured
              </Text>
              <Text style={{ fontFamily: t.fontDisplay, fontSize: 30, lineHeight: 32, color: t.ink, letterSpacing: t.letterSpacing, marginTop: 8 }}>
                Hot Takes 2026
              </Text>
              <Text style={{ fontFamily: t.fontBody, fontSize: 14, color: t.ink, opacity: 0.85, marginTop: 12 }}>
                The original. Wedding etiquette to AI.
              </Text>
              <TouchableOpacity
                onPress={() => router.push({ pathname: '/deck-detail', params: { categoryId: 'hot_takes' } })}
                style={{
                  marginTop: 18, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 999,
                  backgroundColor: t.ink, alignSelf: 'flex-start',
                }}
              >
                <Text style={{ fontFamily: t.fontBodyBold, fontSize: 14, color: t.bg, letterSpacing: t.letterSpacing }}>
                  Browse · 15 questions
                </Text>
              </TouchableOpacity>
            </View>
            <Svg width={160} height={160} viewBox="0 0 160 160"
              style={{ position: 'absolute', right: -30, top: -30, opacity: 0.35 }}>
              {[30, 50, 70].map((r, i) => (
                <SvgCircle key={i} cx={80} cy={80} r={r} fill="none" stroke={t.ink} strokeWidth={2} />
              ))}
            </Svg>
          </CCard>
        </View>

        {/* Deck grid */}
        <View style={{ paddingHorizontal: 20 }}>
          <Text style={{ fontFamily: MONO, fontSize: 11, letterSpacing: 2, color: t.inkSoft, textTransform: 'uppercase', marginBottom: 12 }}>
            All decks
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
            {DECKS.map((d) => {
              const accent = CATEGORY_COLORS[d.categoryId] ?? t.primary;
              return (
                <CCard
                  key={d.categoryId}
                  t={t} padding={14}
                  style={{ width: '47%' }}
                  onPress={() => router.push({ pathname: '/deck-detail', params: { categoryId: d.categoryId } })}
                >
                  {/* Color swatch */}
                  <View style={{
                    width: '100%', aspectRatio: 1.5, borderRadius: t.radiusSm,
                    backgroundColor: accent, marginBottom: 10,
                    overflow: 'hidden', position: 'relative',
                    alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Svg viewBox="0 0 100 67" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
                      {[16, 24, 32].map((r, j) => (
                        <SvgCircle key={j} cx={70} cy={20} r={r} fill="none" stroke={t.ink} strokeWidth={0.8} opacity={0.35} />
                      ))}
                    </Svg>
                    <Text style={{ fontSize: 28 }}>{d.icon}</Text>
                  </View>
                  <Text style={{ fontFamily: t.fontBodyBold, fontSize: 15, color: t.ink, letterSpacing: t.letterSpacing }}>
                    {d.name}
                  </Text>
                  <Text style={{ fontFamily: MONO, fontSize: 11, color: t.inkSoft, marginTop: 2 }}>
                    {d.topics} questions
                  </Text>
                </CCard>
              );
            })}
          </View>
        </View>
      </ScrollView>

      <CTabBar t={t} active="discover" />
    </View>
  );
}
