import { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts/ThemeContext';
import { useProfile } from '@/contexts/ProfileContext';
import { CButton, CCard, MONO } from '@/components/ui';
import { roomStore } from '@/store/room-store';
import { createRoom } from '@/services/rooms';

const TIME_OPTIONS: { label: string; value: number }[] = [
  { label: '2 min', value: 2 },
  { label: '3 min', value: 3 },
  { label: '5 min', value: 5 },
  { label: '10 min', value: 10 },
];

export default function CreateRoomScreen() {
  const { theme: t } = useTheme();
  const { profile } = useProfile();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [selectedTimeIdx, setSelectedTimeIdx] = useState(1); // default: 3 min
  const [hotSeat, setHotSeat] = useState(true);
  const [selectedTopics, setSelectedTopics] = useState([...roomStore.selectedTopics]);
  const [creating, setCreating] = useState(false);

  // Sync topics when returning from topics-browser
  useFocusEffect(
    useCallback(() => {
      setSelectedTopics([...roomStore.selectedTopics]);
    }, [])
  );

  const handleCreate = async () => {
    if (!profile) return;
    if (selectedTopics.length === 0) {
      Alert.alert('No topics', 'Please select at least one topic before creating the room.');
      return;
    }

    setCreating(true);

    const settings = {
      time_per_topic: TIME_OPTIONS[selectedTimeIdx].value,
      hot_seat_enabled: hotSeat,
    };

    roomStore.settings = settings;

    const { room, error } = await createRoom(settings, profile.id);

    if (error || !room) {
      setCreating(false);
      Alert.alert('Error', 'Could not create the room. Please try again.');
      return;
    }

    roomStore.roomId = room.id;
    roomStore.roomCode = room.code;
    roomStore.isHost = true;

    router.push({ pathname: '/waiting-room', params: { roomId: room.id } });
    setCreating(false);
  };

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={{
          paddingTop: insets.top + 20, paddingHorizontal: 20, paddingBottom: 8,
          flexDirection: 'row', alignItems: 'center', gap: 12,
        }}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={{ fontSize: 22, color: t.ink }}>←</Text>
          </TouchableOpacity>
          <Text style={{ fontFamily: t.fontDisplay, fontSize: 22, color: t.ink, letterSpacing: t.letterSpacing }}>
            New cercle
          </Text>
        </View>

        {/* Time per topic */}
        <View style={{ paddingHorizontal: 20, paddingTop: 20 }}>
          <Text style={{
            fontFamily: MONO, fontSize: 11, letterSpacing: 1.5,
            textTransform: 'uppercase', color: t.inkSoft, marginBottom: 10,
          }}>
            Time per topic
          </Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {TIME_OPTIONS.map((opt, i) => (
              <TouchableOpacity
                key={opt.label}
                onPress={() => setSelectedTimeIdx(i)}
                style={{
                  flex: 1, padding: 12, borderRadius: t.radiusSm,
                  backgroundColor: i === selectedTimeIdx ? t.primary : t.paper,
                  alignItems: 'center',
                  ...(t.cardBorder && {
                    borderWidth: t.cardBorderWidth,
                    borderColor: i === selectedTimeIdx ? t.primary : t.cardBorderColor,
                  }),
                }}
              >
                <Text style={{
                  fontFamily: t.fontBodyBold, fontSize: 13,
                  color: i === selectedTimeIdx ? t.primaryFg : t.ink,
                }}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Topics */}
        <View style={{ paddingHorizontal: 20, paddingTop: 20 }}>
          <Text style={{
            fontFamily: MONO, fontSize: 11, letterSpacing: 1.5,
            textTransform: 'uppercase', color: t.inkSoft, marginBottom: 10,
          }}>
            Topics
          </Text>
          <TouchableOpacity
            onPress={() => router.push('/topics-browser')}
            style={{
              flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
              padding: 16, borderRadius: t.radius, backgroundColor: t.paper,
              ...(t.cardBorder && { borderWidth: t.cardBorderWidth, borderColor: t.cardBorderColor }),
            }}
          >
            <Text style={{ fontFamily: t.fontBody, fontSize: 15, color: selectedTopics.length ? t.ink : t.inkSoft }}>
              {selectedTopics.length > 0 ? `${selectedTopics.length} topics selected` : 'Browse & select topics →'}
            </Text>
            <Text style={{ fontSize: 18, color: t.inkSoft }}>›</Text>
          </TouchableOpacity>

          {selectedTopics.length > 0 && (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
              {selectedTopics.slice(0, 4).map((topic) => (
                <View key={topic.id} style={{
                  paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999,
                  backgroundColor: t.bgAlt,
                }}>
                  <Text style={{ fontFamily: t.fontBody, fontSize: 12, color: t.ink }} numberOfLines={1}>
                    {topic.text}
                  </Text>
                </View>
              ))}
              {selectedTopics.length > 4 && (
                <View style={{ paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, backgroundColor: t.bgAlt }}>
                  <Text style={{ fontFamily: t.fontBody, fontSize: 12, color: t.inkSoft }}>
                    +{selectedTopics.length - 4} more
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>

        {/* Hot Seat toggle */}
        <View style={{ paddingHorizontal: 20, paddingTop: 20 }}>
          <CCard t={t} padding={0}>
            <TouchableOpacity
              onPress={() => setHotSeat(!hotSeat)}
              style={{
                padding: 16, flexDirection: 'row',
                alignItems: 'center', justifyContent: 'space-between',
              }}
            >
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: t.fontBodyBold, fontSize: 15, color: t.ink }}>Hot Seat mode</Text>
                <Text style={{ fontFamily: t.fontBody, fontSize: 13, color: t.inkSoft, marginTop: 2 }}>
                  1 vs all when someone stands alone
                </Text>
              </View>
              <View style={{
                width: 48, height: 28, borderRadius: 14,
                backgroundColor: hotSeat ? t.primary : t.bgAlt,
                justifyContent: 'center', paddingHorizontal: 3,
              }}>
                <View style={{
                  width: 22, height: 22, borderRadius: 11,
                  backgroundColor: hotSeat ? t.primaryFg : t.inkSoft,
                  alignSelf: hotSeat ? 'flex-end' : 'flex-start',
                }} />
              </View>
            </TouchableOpacity>
          </CCard>
        </View>

        {/* Create button */}
        <View style={{ paddingHorizontal: 20, paddingTop: 28 }}>
          {creating ? (
            <View style={{
              height: 56, borderRadius: t.radius, backgroundColor: t.primary,
              alignItems: 'center', justifyContent: 'center',
            }}>
              <ActivityIndicator color={t.primaryFg} />
            </View>
          ) : (
            <CButton
              t={t} full size="lg"
              onPress={handleCreate}
              disabled={selectedTopics.length === 0}
            >
              Create & open lobby →
            </CButton>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
