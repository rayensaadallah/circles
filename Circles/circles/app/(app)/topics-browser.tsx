import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts/ThemeContext';
import { MONO } from '@/components/ui';
import { roomStore } from '@/store/room-store';
import { fetchTopicsFromDB, CATEGORY_LABELS, CATEGORY_COLORS } from '@/services/topics';
import type { TopicRow } from '@/types/database';

const ALL_CATEGORIES = ['All', 'fun', 'lifestyle', 'relationships', 'philosophy', 'politics', 'tech', 'hot_takes', 'would_you_rather'];

export default function TopicsBrowserScreen() {
  const { theme: t } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [topics, setTopics] = useState<TopicRow[]>([]);
  const [loadingTopics, setLoadingTopics] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');
  // selectedIds keyed by topic id
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    new Set(roomStore.selectedTopics.map((t) => t.id))
  );

  useEffect(() => {
    fetchTopicsFromDB().then((data) => {
      setTopics(data);
      setLoadingTopics(false);
    });
  }, []);

  const filtered = topics.filter((topic) => {
    const matchCat = activeCategory === 'All' || topic.category === activeCategory;
    const matchSearch = search === '' || topic.text.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const toggle = (topic: TopicRow) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(topic.id)) {
        next.delete(topic.id);
      } else {
        next.add(topic.id);
      }
      return next;
    });
  };

  const confirm = () => {
    const selected = topics.filter((t) => selectedIds.has(t.id));
    roomStore.selectedTopics = selected.map((t) => ({ id: t.id, text: t.text }));
    router.back();
  };

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      {/* Header */}
      <View style={{
        paddingTop: insets.top + 20, paddingHorizontal: 20, paddingBottom: 12,
        flexDirection: 'row', alignItems: 'center', gap: 12,
      }}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={{ fontSize: 22, color: t.ink }}>←</Text>
        </TouchableOpacity>
        <Text style={{ fontFamily: t.fontDisplay, fontSize: 22, color: t.ink, letterSpacing: t.letterSpacing, flex: 1 }}>
          Select topics
        </Text>
        {selectedIds.size > 0 && (
          <Text style={{ fontFamily: MONO, fontSize: 12, color: t.inkSoft }}>
            {selectedIds.size} selected
          </Text>
        )}
      </View>

      {/* Search */}
      <View style={{ paddingHorizontal: 20, marginBottom: 12 }}>
        <TextInput
          style={{
            backgroundColor: t.paper,
            borderRadius: t.radiusSm,
            borderWidth: t.cardBorder ? t.cardBorderWidth : 1,
            borderColor: t.cardBorder ? t.cardBorderColor : t.bgAlt,
            paddingHorizontal: 16, paddingVertical: 12,
            fontFamily: t.fontBody, fontSize: 15, color: t.ink,
          }}
          placeholder="Search topics…"
          placeholderTextColor={t.inkSoft}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Category tabs */}
      <ScrollView
        horizontal showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, gap: 8, paddingBottom: 12 }}
      >
        {ALL_CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat}
            onPress={() => setActiveCategory(cat)}
            style={{
              paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999,
              backgroundColor: activeCategory === cat ? t.ink : t.paper,
              ...(t.cardBorder && activeCategory !== cat && {
                borderWidth: t.cardBorderWidth, borderColor: t.cardBorderColor,
              }),
            }}
          >
            <Text style={{
              fontFamily: t.fontBodyBold, fontSize: 13,
              color: activeCategory === cat ? t.bg : t.ink,
              letterSpacing: t.letterSpacing,
            }}>
              {cat === 'All' ? 'All' : CATEGORY_LABELS[cat]}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Topics list */}
      {loadingTopics ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={t.primary} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100, gap: 8 }}
          showsVerticalScrollIndicator={false}
        >
          {filtered.map((topic) => {
            const isSelected = selectedIds.has(topic.id);
            return (
              <TouchableOpacity
                key={topic.id}
                onPress={() => toggle(topic)}
                activeOpacity={0.8}
                style={{
                  flexDirection: 'row', alignItems: 'center', gap: 14,
                  padding: 14, borderRadius: t.radius,
                  backgroundColor: isSelected ? t.bgAlt : t.paper,
                  borderWidth: isSelected ? 1.5 : (t.cardBorder ? t.cardBorderWidth : 0),
                  borderColor: isSelected ? t.primary : (t.cardBorder ? t.cardBorderColor : 'transparent'),
                  ...t.shadow,
                }}
              >
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: t.fontBody, fontSize: 15, color: t.ink, lineHeight: 21 }}>
                    {topic.text}
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
                    <View style={{
                      width: 6, height: 6, borderRadius: 3,
                      backgroundColor: CATEGORY_COLORS[topic.category] ?? t.inkSoft,
                    }} />
                    <Text style={{ fontFamily: MONO, fontSize: 10, color: t.inkSoft, letterSpacing: 1 }}>
                      {(CATEGORY_LABELS[topic.category] ?? topic.category).toUpperCase()}
                    </Text>
                  </View>
                </View>
                <View style={{
                  width: 24, height: 24, borderRadius: 12,
                  backgroundColor: isSelected ? t.primary : 'transparent',
                  borderWidth: 1.5,
                  borderColor: isSelected ? t.primary : t.inkSoft,
                  alignItems: 'center', justifyContent: 'center',
                }}>
                  {isSelected && (
                    <Text style={{ fontSize: 13, color: t.primaryFg }}>✓</Text>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}

      {/* Confirm bar */}
      {selectedIds.size > 0 && (
        <View style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          paddingHorizontal: 20, paddingTop: 16,
          paddingBottom: Math.max(insets.bottom + 16, 24),
          backgroundColor: t.bg, borderTopWidth: 1, borderTopColor: t.bgAlt,
        }}>
          <TouchableOpacity
            onPress={confirm}
            style={{
              backgroundColor: t.primary, borderRadius: 999,
              height: 56, alignItems: 'center', justifyContent: 'center',
              ...(t.isHardShadow && {
                shadowColor: t.ink, shadowOffset: { width: 3, height: 3 },
                shadowOpacity: 1, shadowRadius: 0,
              }),
            }}
          >
            <Text style={{ fontFamily: t.fontBodyBold, fontSize: 17, color: t.primaryFg }}>
              {selectedIds.size} selected — Confirm ✓
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
