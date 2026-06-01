import { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import Svg, { Circle as SvgCircle } from 'react-native-svg';
import { useTheme } from '@/contexts/ThemeContext';
import { MONO } from '@/components/ui';
import { comboStore } from '@/store/combo-store';
import { roomStore } from '@/store/room-store';
import { CATEGORY_COLORS, CATEGORY_LABELS } from '@/services/topics';
import topicsData from '@/constants/topics.json';

export default function DeckDetailScreen() {
  const { theme: t } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { categoryId } = useLocalSearchParams<{ categoryId: string }>();

  const [, forceUpdate] = useState(0);
  const refresh = () => forceUpdate((n) => n + 1);

  // Keep combo count in sync when returning from elsewhere
  useFocusEffect(useCallback(() => { refresh(); }, []));

  const category = topicsData.find((c) => c.id === categoryId);
  if (!category) return null;

  const accent = CATEGORY_COLORS[categoryId] ?? t.primary;
  const label = CATEGORY_LABELS[categoryId] ?? category.label;

  const questions = category.questions.map((text, i) => ({
    id: `${categoryId}_${i}`,
    text,
    category: categoryId,
    categoryLabel: label,
  }));

  const toggleQuestion = (q: (typeof questions)[0]) => {
    comboStore.toggle(q);
    refresh();
  };

  const playThisDeck = () => {
    roomStore.selectedTopics = questions.map((q) => ({ id: q.id, text: q.text }));
    router.push('/create-room');
  };

  const addAllToCombo = () => {
    questions.forEach((q) => {
      if (!comboStore.has(q.id)) comboStore.toggle(q);
    });
    refresh();
  };

  const comboCount = comboStore.count;
  const deckInCombo = questions.filter((q) => comboStore.has(q.id)).length;

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 140 }} showsVerticalScrollIndicator={false}>

        {/* Hero header */}
        <View style={{
          paddingTop: insets.top,
          backgroundColor: accent,
          overflow: 'hidden',
          position: 'relative',
        }}>
          {/* Decorative circles */}
          <Svg width={200} height={200} viewBox="0 0 200 200"
            style={{ position: 'absolute', right: -40, top: -40, opacity: 0.25 }}>
            {[40, 65, 90].map((r, i) => (
              <SvgCircle key={i} cx={100} cy={100} r={r} fill="none" stroke={t.ink} strokeWidth={2} />
            ))}
          </Svg>

          {/* Back button */}
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ padding: 20, paddingBottom: 8, alignSelf: 'flex-start' }}
          >
            <Text style={{ fontSize: 22, color: t.ink }}>←</Text>
          </TouchableOpacity>

          <View style={{ paddingHorizontal: 24, paddingBottom: 28 }}>
            <Text style={{ fontFamily: MONO, fontSize: 11, letterSpacing: 2, color: t.ink, opacity: 0.7, textTransform: 'uppercase', marginBottom: 8 }}>
              {category.icon}  Deck
            </Text>
            <Text style={{ fontFamily: t.fontDisplay, fontSize: 36, color: t.ink, letterSpacing: t.letterSpacing, lineHeight: 40 }}>
              {label}
            </Text>
            <Text style={{ fontFamily: t.fontBody, fontSize: 14, color: t.ink, opacity: 0.75, marginTop: 8 }}>
              {questions.length} questions · debate with friends
            </Text>

            {/* Action buttons */}
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 20 }}>
              <TouchableOpacity
                onPress={playThisDeck}
                style={{
                  backgroundColor: t.ink, borderRadius: 999,
                  paddingHorizontal: 20, paddingVertical: 12,
                  ...(t.isHardShadow && {
                    shadowColor: '#00000044', shadowOffset: { width: 2, height: 2 },
                    shadowOpacity: 1, shadowRadius: 0,
                  }),
                }}
              >
                <Text style={{ fontFamily: t.fontBodyBold, fontSize: 14, color: t.bg, letterSpacing: t.letterSpacing }}>
                  ▶  Play this deck
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={addAllToCombo}
                style={{
                  backgroundColor: 'transparent', borderRadius: 999,
                  paddingHorizontal: 20, paddingVertical: 12,
                  borderWidth: 1.5, borderColor: t.ink,
                }}
              >
                <Text style={{ fontFamily: t.fontBodyBold, fontSize: 14, color: t.ink, letterSpacing: t.letterSpacing }}>
                  + Add all
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Questions list */}
        <View style={{ paddingHorizontal: 20, paddingTop: 24 }}>
          <Text style={{ fontFamily: MONO, fontSize: 11, letterSpacing: 2, color: t.inkSoft, textTransform: 'uppercase', marginBottom: 14 }}>
            Questions · {deckInCombo > 0 ? `${deckInCombo} in your combo` : 'tap to add to combo'}
          </Text>

          <View style={{ gap: 8 }}>
            {questions.map((q) => {
              const inCombo = comboStore.has(q.id);
              return (
                <TouchableOpacity
                  key={q.id}
                  onPress={() => toggleQuestion(q)}
                  activeOpacity={0.75}
                  style={{
                    flexDirection: 'row', alignItems: 'center', gap: 14,
                    padding: 16, borderRadius: t.radius,
                    backgroundColor: inCombo ? t.bgAlt : t.paper,
                    borderWidth: inCombo ? 1.5 : (t.cardBorder ? t.cardBorderWidth : 0),
                    borderColor: inCombo ? accent : (t.cardBorder ? t.cardBorderColor : 'transparent'),
                    ...t.shadow,
                  }}
                >
                  <Text style={{ flex: 1, fontFamily: t.fontBody, fontSize: 15, color: t.ink, lineHeight: 22 }}>
                    {q.text}
                  </Text>
                  <View style={{
                    width: 28, height: 28, borderRadius: 14, flexShrink: 0,
                    backgroundColor: inCombo ? accent : 'transparent',
                    borderWidth: 1.5,
                    borderColor: inCombo ? accent : t.inkSoft,
                    alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Text style={{ fontSize: 14, color: inCombo ? t.bg : t.inkSoft, lineHeight: 16 }}>
                      {inCombo ? '✓' : '+'}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>

      {/* Sticky bottom bar */}
      <View style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        paddingHorizontal: 20, paddingTop: 14,
        paddingBottom: Math.max(insets.bottom + 14, 24),
        backgroundColor: t.bg,
        borderTopWidth: 1, borderTopColor: t.bgAlt,
        flexDirection: 'row', gap: 10, alignItems: 'center',
      }}>
        {comboCount > 0 ? (
          <>
            <View style={{ flex: 1, padding: 14, borderRadius: t.radius, backgroundColor: t.paper, ...t.shadow }}>
              <Text style={{ fontFamily: MONO, fontSize: 11, color: t.inkSoft, letterSpacing: 1 }}>MY COMBO</Text>
              <Text style={{ fontFamily: t.fontBodyBold, fontSize: 16, color: t.ink, marginTop: 2 }}>
                {comboCount} question{comboCount !== 1 ? 's' : ''}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => {
                roomStore.selectedTopics = comboStore.questions.map((q) => ({ id: q.id, text: q.text }));
                router.push('/create-room');
              }}
              style={{
                flex: 2, height: 56, borderRadius: 999,
                backgroundColor: t.primary, alignItems: 'center', justifyContent: 'center',
                ...(t.isHardShadow && {
                  shadowColor: t.ink, shadowOffset: { width: 3, height: 3 },
                  shadowOpacity: 1, shadowRadius: 0,
                }),
              }}
            >
              <Text style={{ fontFamily: t.fontBodyBold, fontSize: 16, color: t.primaryFg, letterSpacing: t.letterSpacing }}>
                Play My Combo →
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity
            onPress={playThisDeck}
            style={{
              flex: 1, height: 56, borderRadius: 999,
              backgroundColor: t.primary, alignItems: 'center', justifyContent: 'center',
              ...(t.isHardShadow && {
                shadowColor: t.ink, shadowOffset: { width: 3, height: 3 },
                shadowOpacity: 1, shadowRadius: 0,
              }),
            }}
          >
            <Text style={{ fontFamily: t.fontBodyBold, fontSize: 16, color: t.primaryFg, letterSpacing: t.letterSpacing }}>
              ▶  Play this deck
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
