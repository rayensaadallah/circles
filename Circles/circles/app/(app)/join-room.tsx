import { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts/ThemeContext';
import { useProfile } from '@/contexts/ProfileContext';
import { CButton, MONO } from '@/components/ui';
import { joinRoomByCode } from '@/services/rooms';
import { roomStore } from '@/store/room-store';

const KEYBOARD_ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M', '⌫'],
];

export default function JoinRoomScreen() {
  const { theme: t } = useTheme();
  const { profile } = useProfile();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [code, setCode] = useState('');
  const [joining, setJoining] = useState(false);

  const handleKey = (key: string) => {
    if (key === '⌫') {
      setCode((prev) => prev.slice(0, -1));
    } else if (code.length < 4) {
      setCode((prev) => prev + key);
    }
  };

  const handleJoin = async () => {
    if (code.length !== 4 || !profile) return;
    setJoining(true);

    const { room, error } = await joinRoomByCode(code, profile.id);

    if (error || !room) {
      setJoining(false);
      Alert.alert('Room not found', 'That code doesn\'t match any open room. Check the code and try again.');
      return;
    }

    roomStore.roomId = room.id;
    roomStore.roomCode = room.code;
    roomStore.roomName = room.name;
    roomStore.isHost = false;

    router.push({ pathname: '/waiting-room', params: { roomId: room.id } });
    setJoining(false);
  };

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      {/* Header */}
      <View style={{
        paddingTop: insets.top + 20, paddingHorizontal: 20, paddingBottom: 8,
        flexDirection: 'row', alignItems: 'center', gap: 12,
      }}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={{ fontSize: 22, color: t.ink }}>←</Text>
        </TouchableOpacity>
        <Text style={{ fontFamily: t.fontDisplay, fontSize: 22, color: t.ink, letterSpacing: t.letterSpacing }}>
          Join cercle
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ flex: 1 }} keyboardShouldPersistTaps="handled">
        {/* Code display */}
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24, gap: 24 }}>
          <Text style={{
            fontFamily: MONO, fontSize: 12, letterSpacing: 2,
            textTransform: 'uppercase', color: t.inkSoft,
          }}>
            Enter the 4-letter code
          </Text>

          <View style={{ flexDirection: 'row', gap: 12 }}>
            {[0, 1, 2, 3].map((i) => {
              const char = code[i];
              const isFilled = !!char;
              return (
                <View key={i} style={{
                  width: 64, height: 80, borderRadius: t.radiusSm,
                  backgroundColor: isFilled ? t.primary : t.paper,
                  alignItems: 'center', justifyContent: 'center',
                  borderWidth: isFilled ? (t.cardBorder ? t.cardBorderWidth : 0) : (t.cardBorder ? t.cardBorderWidth : 2),
                  borderColor: isFilled
                    ? (t.cardBorder ? t.cardBorderColor : t.primary)
                    : (t.cardBorder ? t.cardBorderColor : t.bgAlt),
                  ...(isFilled && t.isHardShadow && {
                    shadowColor: t.ink,
                    shadowOffset: { width: 3, height: 3 },
                    shadowOpacity: 1, shadowRadius: 0,
                  }),
                }}>
                  <Text style={{
                    fontFamily: t.fontDisplay, fontSize: 44,
                    color: isFilled ? t.primaryFg : t.inkSoft,
                    letterSpacing: t.letterSpacing, lineHeight: 52,
                  }}>
                    {char || ' '}
                  </Text>
                </View>
              );
            })}
          </View>

          <Text style={{
            fontFamily: t.fontBody, fontSize: 14, color: t.inkSoft,
            maxWidth: 280, textAlign: 'center', lineHeight: 20,
          }}>
            The host can find this code on their lobby screen. It changes every game.
          </Text>
        </View>

        {/* Custom keyboard */}
        <View style={{ paddingHorizontal: 20, gap: 8, marginBottom: 16 }}>
          {KEYBOARD_ROWS.map((row, ri) => (
            <View key={ri} style={{ flexDirection: 'row', justifyContent: 'center', gap: 6 }}>
              {row.map((key) => (
                <TouchableOpacity
                  key={key}
                  onPress={() => handleKey(key)}
                  activeOpacity={0.7}
                  style={{
                    width: key === '⌫' ? 54 : 34, height: 44,
                    borderRadius: 10,
                    backgroundColor: key === '⌫' ? t.bgAlt : t.paper,
                    alignItems: 'center', justifyContent: 'center',
                    ...(t.cardBorder && { borderWidth: t.cardBorderWidth, borderColor: t.cardBorderColor }),
                  }}
                >
                  <Text style={{ fontFamily: t.fontBodyBold, fontSize: key === '⌫' ? 16 : 15, color: t.ink }}>
                    {key}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          ))}
        </View>

        {/* Join button */}
        <View style={{ paddingHorizontal: 20, marginBottom: Math.max(insets.bottom + 20, 32) }}>
          {joining ? (
            <View style={{
              height: 56, borderRadius: t.radius, backgroundColor: t.primary,
              alignItems: 'center', justifyContent: 'center',
            }}>
              <ActivityIndicator color={t.primaryFg} />
            </View>
          ) : (
            <CButton t={t} full size="lg" onPress={handleJoin} disabled={code.length !== 4}>
              Join cercle →
            </CButton>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
