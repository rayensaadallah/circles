import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts/ThemeContext';
import * as authService from '@/services/auth';
import { CCard, CButton, MONO } from '@/components/ui';
import { THEMES, ThemeName } from '@/constants/themes';
import { CMark } from '@/components/ui';

const THEME_OPTIONS: ThemeName[] = ['arena', 'blockParty', 'softCircle'];

export default function SettingsScreen() {
  const { theme: t, themeName, setThemeName } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleSignOut = () => {
    Alert.alert('Sign out', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign out', style: 'destructive',
        onPress: async () => {
          await authService.signOut();
          // Navigate immediately — don't rely on onAuthStateChange firing
          router.replace('/(auth)');
        },
      },
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={{
          paddingTop: insets.top + 20, paddingHorizontal: 20, paddingBottom: 8,
          flexDirection: 'row', alignItems: 'center', gap: 12,
        }}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={{ fontFamily: t.fontBody, fontSize: 22, color: t.ink }}>←</Text>
          </TouchableOpacity>
          <Text style={{ fontFamily: t.fontDisplay, fontSize: 22, color: t.ink, letterSpacing: t.letterSpacing }}>
            Settings
          </Text>
        </View>

        {/* Theme picker */}
        <View style={{ paddingHorizontal: 20, paddingTop: 24 }}>
          <Text style={{
            fontFamily: MONO, fontSize: 11, letterSpacing: 2,
            textTransform: 'uppercase', color: t.inkSoft, marginBottom: 14,
          }}>
            App theme
          </Text>
          <View style={{ gap: 10 }}>
            {THEME_OPTIONS.map((name) => {
              const th = THEMES[name];
              const isActive = themeName === name;
              return (
                <TouchableOpacity
                  key={name}
                  onPress={() => setThemeName(name)}
                  activeOpacity={0.8}
                  style={{
                    flexDirection: 'row', alignItems: 'center', gap: 16,
                    padding: 16, borderRadius: t.radius,
                    backgroundColor: isActive ? th.primary : t.paper,
                    borderWidth: isActive ? (th.cardBorderWidth || 1.5) : t.cardBorderWidth,
                    borderColor: isActive ? (th.cardBorderColor || th.primary) : t.cardBorderColor,
                    ...t.shadow,
                  }}
                >
                  <View style={{
                    width: 44, height: 44, borderRadius: 22,
                    backgroundColor: th.primary,
                    alignItems: 'center', justifyContent: 'center',
                    borderWidth: 1, borderColor: th.ink + '33',
                  }}>
                    <CMark t={th} size={32} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{
                      fontFamily: t.fontBodyBold, fontSize: 16,
                      color: isActive ? th.primaryFg : t.ink,
                      letterSpacing: t.letterSpacing,
                    }}>
                      {th.name}
                    </Text>
                    <Text style={{
                      fontFamily: t.fontBody, fontSize: 13,
                      color: isActive ? th.primaryFg : t.inkSoft,
                      opacity: 0.8, marginTop: 2,
                    }}>
                      {th.tagline}
                    </Text>
                  </View>
                  {isActive && (
                    <View style={{
                      width: 24, height: 24, borderRadius: 12,
                      backgroundColor: th.primaryFg,
                      alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Text style={{ fontSize: 14, color: th.primary }}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Account section */}
        <View style={{ paddingHorizontal: 20, paddingTop: 28 }}>
          <Text style={{
            fontFamily: MONO, fontSize: 11, letterSpacing: 2,
            textTransform: 'uppercase', color: t.inkSoft, marginBottom: 10,
          }}>
            Account
          </Text>
          <CCard t={t} padding={0}>
            {[
              ['Game', 'Notifications', 'On'],
              ['Privacy', 'Public profile', 'Off'],
              ['Debug', 'Show debug info', 'Off'],
            ].map(([section, k, v], i, arr) => (
              <View key={k} style={{
                paddingHorizontal: 16, paddingVertical: 14,
                flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
                borderBottomWidth: i < arr.length - 1 ? 1 : 0,
                borderBottomColor: t.bgAlt,
              }}>
                <Text style={{ fontFamily: t.fontBody, fontSize: 15, color: t.ink }}>{k}</Text>
                <Text style={{ fontFamily: MONO, fontSize: 13, color: t.inkSoft }}>{v} ›</Text>
              </View>
            ))}
          </CCard>
        </View>

        {/* Sign out */}
        <View style={{ paddingHorizontal: 20, paddingTop: 28 }}>
          <CButton t={t} variant="outline" full onPress={handleSignOut}>
            Sign out
          </CButton>
        </View>
      </ScrollView>
    </View>
  );
}
