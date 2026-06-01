import { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { MONO } from '@/components/ui';
import { comboStore } from '@/store/combo-store';
import { roomStore } from '@/store/room-store';
import { CATEGORY_COLORS } from '@/services/topics';

export default function ComboReviewScreen() {
  const { theme: t } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [, forceUpdate] = useState(0);

  useFocusEffect(useCallback(() => { forceUpdate((n) => n + 1); }, []));

  const questions = comboStore.questions;

  const removeQuestion = (id: string) => {
    comboStore.remove(id);
    forceUpdate((n) => n + 1);
  };

  const clearAll = () => {
    comboStore.clear();
    router.back();
  };

  const play = () => {
    roomStore.selectedTopics = questions.map((q) => ({ id: q.id, text: q.text }));
    router.back();
    router.push('/create-room');
  };

  // Group questions by category
  const grouped = questions.reduce<Record<string, typeof questions>>((acc, q) => {
    if (!acc[q.categoryLabel]) acc[q.categoryLabel] = [];
    acc[q.categoryLabel].push(q);
    return acc;
  }, {});

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      {/* Header */}
      <View style={{
        paddingTop: insets.top + 20, paddingHorizontal: 20, paddingBottom: 16,
        flexDirection: 'row', alignItems: 'center', gap: 12,
        borderBottomWidth: 1, borderBottomColor: t.bgAlt,
      }}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={{ fontSize: 22, color: t.ink }}>←</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: t.fontDisplay, fontSize: 22, color: t.ink, letterSpacing: t.letterSpacing }}>
            My Combo
          </Text>
          <Text style={{ fontFamily: MONO, fontSize: 11, color: t.inkSoft, marginTop: 1 }}>
            {questions.length} question{questions.length !== 1 ? 's' : ''} queued
          </Text>
        </View>
        {questions.length > 0 && (
          <TouchableOpacity onPress={clearAll}>
            <Text style={{ fontFamily: t.fontBody, fontSize: 14, color: t.inkSoft }}>Clear all</Text>
          </TouchableOpacity>
        )}
      </View>

      {questions.length === 0 ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 }}>
          <Text style={{ fontSize: 40 }}>◎</Text>
          <Text style={{ fontFamily: t.fontBodyBold, fontSize: 18, color: t.ink }}>Combo is empty</Text>
          <Text style={{ fontFamily: t.fontBody, fontSize: 14, color: t.inkSoft, textAlign: 'center', paddingHorizontal: 40 }}>
            Browse decks and tap + on questions to add them here
          </Text>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              marginTop: 8, borderRadius: 999, borderWidth: 1.5, borderColor: t.ink,
              paddingHorizontal: 20, paddingVertical: 10,
            }}
          >
            <Text style={{ fontFamily: t.fontBodyBold, fontSize: 14, color: t.ink }}>Browse decks</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 120, gap: 24 }} showsVerticalScrollIndicator={false}>
            {Object.entries(grouped).map(([label, qs]) => (
              <View key={label}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <View style={{
                    width: 8, height: 8, borderRadius: 4,
                    backgroundColor: CATEGORY_COLORS[qs[0].category] ?? t.primary,
                  }} />
                  <Text style={{ fontFamily: MONO, fontSize: 11, color: t.inkSoft, letterSpacing: 1.5, textTransform: 'uppercase' }}>
                    {label} · {qs.length}
                  </Text>
                </View>
                <View style={{ gap: 8 }}>
                  {qs.map((q) => (
                    <View
                      key={q.id}
                      style={{
                        flexDirection: 'row', alignItems: 'center', gap: 12,
                        padding: 14, borderRadius: t.radius,
                        backgroundColor: t.paper,
                        ...(t.cardBorder && { borderWidth: t.cardBorderWidth, borderColor: t.cardBorderColor }),
                        ...t.shadow,
                      }}
                    >
                      <Text style={{ flex: 1, fontFamily: t.fontBody, fontSize: 15, color: t.ink, lineHeight: 22 }}>
                        {q.text}
                      </Text>
                      <TouchableOpacity
                        onPress={() => removeQuestion(q.id)}
                        style={{
                          width: 28, height: 28, borderRadius: 14, flexShrink: 0,
                          backgroundColor: t.bgAlt,
                          alignItems: 'center', justifyContent: 'center',
                        }}
                      >
                        <Text style={{ fontSize: 16, color: t.inkSoft, lineHeight: 18 }}>×</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              </View>
            ))}
          </ScrollView>

          {/* Play bar */}
          <View style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            paddingHorizontal: 20, paddingTop: 14,
            paddingBottom: Math.max(insets.bottom + 14, 24),
            backgroundColor: t.bg, borderTopWidth: 1, borderTopColor: t.bgAlt,
          }}>
            <TouchableOpacity
              onPress={play}
              style={{
                height: 56, borderRadius: 999,
                backgroundColor: t.primary, alignItems: 'center', justifyContent: 'center',
                ...(t.isHardShadow && {
                  shadowColor: t.ink, shadowOffset: { width: 3, height: 3 },
                  shadowOpacity: 1, shadowRadius: 0,
                }),
              }}
            >
              <Text style={{ fontFamily: t.fontBodyBold, fontSize: 17, color: t.primaryFg, letterSpacing: t.letterSpacing }}>
                Play {questions.length} questions →
              </Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}
