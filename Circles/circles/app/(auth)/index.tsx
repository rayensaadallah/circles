import { useState } from 'react';
import { View, Text, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts/ThemeContext';
import { CMark, CButton, CConcentricRings } from '@/components/ui';
import { signInAsGuest } from '@/services/auth';

export default function SplashScreen() {
  const { theme: t } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [guestLoading, setGuestLoading] = useState(false);

  const handleGuest = async () => {
    setGuestLoading(true);
    const { error } = await signInAsGuest();
    setGuestLoading(false);
    if (error) Alert.alert('Could not start guest session', error.message);
    // On success, root layout detects the new session and navigates to (app)
  };

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <CConcentricRings t={t} cx={196} cy={280} />

      {/* Center content */}
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 }}>
        <CMark t={t} size={88} />
        <Text style={{
          fontFamily: t.fontDisplay, fontSize: 64, lineHeight: 64,
          color: t.ink, letterSpacing: -2.5, marginTop: 24, textAlign: 'center',
        }}>
          cercles
        </Text>
        <Text style={{
          fontFamily: t.fontBody, fontSize: 16, color: t.inkSoft,
          marginTop: 14, textAlign: 'center', maxWidth: 280, lineHeight: 22,
        }}>
          The debate game for friends who actually talk to each other.
        </Text>
      </View>

      {/* Bottom actions */}
      <View style={{
        paddingHorizontal: 24,
        paddingBottom: Math.max(insets.bottom + 16, 32),
        gap: 12,
      }}>
        <CButton t={t} full size="lg" onPress={() => router.push('/(auth)/sign-up')}>
          Create account
        </CButton>
        <CButton t={t} variant="outline" full size="lg" onPress={() => router.push('/(auth)/sign-in')}>
          Sign in
        </CButton>

        {/* Guest mode */}
        <View style={{ alignItems: 'center', marginTop: 4 }}>
          {guestLoading ? (
            <ActivityIndicator color={t.inkSoft} />
          ) : (
            <Text
              onPress={handleGuest}
              style={{ fontFamily: t.fontBody, fontSize: 14, color: t.inkSoft }}
            >
              Just playing?{' '}
              <Text style={{ color: t.ink, fontFamily: t.fontBodyBold }}>
                Continue as guest →
              </Text>
            </Text>
          )}
        </View>
      </View>
    </View>
  );
}
