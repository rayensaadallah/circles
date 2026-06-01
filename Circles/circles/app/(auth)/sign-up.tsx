import { useState } from 'react';
import {
  View, Text, TouchableOpacity, KeyboardAvoidingView, Platform,
  ScrollView, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts/ThemeContext';
import { CButton, CInput, CAvatar } from '@/components/ui';
import * as authService from '@/services/auth';

const AVATARS = ['🦊', '🐺', '🦁', '🐻', '🦅', '🐉', '🦋', '🐬', '🐯', '🦄', '🐙', '🦎', '🐦', '🦝', '🐱', '🦖'];

const RING_COLORS = ['#FF6B35', '#22D3EE', '#A855F7', '#34D399', '#F59E0B', '#F43F5E', '#3B82F6', '#EC4899'];

export default function SignUpScreen() {
  const { theme: t } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [step, setStep] = useState(0);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [avatar, setAvatar] = useState('🦊');
  const [ringColor, setRingColor] = useState('#FF6B35');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleNext = () => {
    if (step === 0) {
      if (!email || !password) return Alert.alert('Error', 'Please fill in all fields.');
      if (password.length < 6) return Alert.alert('Error', 'Password must be at least 6 characters.');
      if (password !== confirmPassword) return Alert.alert('Error', 'Passwords do not match.');
      setStep(1);
    } else if (step === 1) {
      if (!username.trim()) return Alert.alert('Error', 'Please enter a username.');
      setStep(2);
    }
  };

  const handleCreate = async () => {
    setLoading(true);
    const { data, error } = await authService.signUp(email, password, username.trim(), avatar, ringColor);
    setLoading(false);
    if (error) return Alert.alert('Sign up failed', error.message);
    // Session is set → root layout navigates to (app)
  };

  const titles = ['Create account', 'Your name', 'Pick your avatar'];
  const subtitles = ['Start your debate journey.', 'What should people call you?', 'Choose how you appear in rooms.'];

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: t.bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingTop: insets.top + 20, paddingHorizontal: 24 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
          <TouchableOpacity onPress={() => (step === 0 ? router.back() : setStep(step - 1))}>
            <Text style={{ fontFamily: t.fontBody, fontSize: 22, color: t.ink }}>←</Text>
          </TouchableOpacity>
          {/* Progress dots */}
          <View style={{ flexDirection: 'row', gap: 6 }}>
            {[0, 1, 2].map(i => (
              <View key={i} style={{
                width: i === step ? 24 : 8, height: 8, borderRadius: 4,
                backgroundColor: i <= step ? t.ink : t.inkSoft,
                opacity: i === step ? 1 : 0.3,
              }} />
            ))}
          </View>
          <View style={{ width: 22 }} />
        </View>

        <Text style={{
          fontFamily: t.fontDisplay, fontSize: 34, color: t.ink,
          letterSpacing: t.letterSpacing, lineHeight: 38, marginBottom: 8,
        }}>
          {titles[step]}
        </Text>
        <Text style={{ fontFamily: t.fontBody, fontSize: 15, color: t.inkSoft, marginBottom: 40 }}>
          {subtitles[step]}
        </Text>

        {/* Step 0: Email + Password */}
        {step === 0 && (
          <View style={{ gap: 12 }}>
            <CInput
              t={t} placeholder="Email" value={email} onChangeText={setEmail}
              autoCapitalize="none" keyboardType="email-address" autoComplete="email"
            />
            <View style={{ position: 'relative' }}>
              <CInput
                t={t} placeholder="Password" value={password} onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: 16, top: 0, bottom: 0, justifyContent: 'center' }}
              >
                <Text style={{ fontFamily: t.fontBody, fontSize: 13, color: t.inkSoft }}>
                  {showPassword ? 'Hide' : 'Show'}
                </Text>
              </TouchableOpacity>
            </View>
            <CInput
              t={t} placeholder="Confirm password" value={confirmPassword}
              onChangeText={setConfirmPassword} secureTextEntry
            />
          </View>
        )}

        {/* Step 1: Username */}
        {step === 1 && (
          <CInput
            t={t} placeholder="Username (e.g. kenza)" value={username}
            onChangeText={setUsername} autoCapitalize="none"
          />
        )}

        {/* Step 2: Avatar + Ring color */}
        {step === 2 && (
          <View style={{ gap: 28 }}>
            {/* Avatar preview */}
            <View style={{ alignItems: 'center' }}>
              <View style={{
                width: 88, height: 88, borderRadius: 44,
                backgroundColor: ringColor,
                alignItems: 'center', justifyContent: 'center',
                shadowColor: ringColor, shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.5, shadowRadius: 12, elevation: 8,
              }}>
                <Text style={{ fontSize: 42 }}>{avatar}</Text>
              </View>
            </View>

            {/* Avatar grid */}
            <View>
              <Text style={{
                fontFamily: t.fontBodyBold, fontSize: 11, letterSpacing: 1.5,
                textTransform: 'uppercase', color: t.inkSoft, marginBottom: 12,
              }}>
                Choose avatar
              </Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                {AVATARS.map((a) => (
                  <TouchableOpacity
                    key={a}
                    onPress={() => setAvatar(a)}
                    style={{
                      width: 52, height: 52, borderRadius: t.radiusSm,
                      backgroundColor: avatar === a ? t.primary : t.paper,
                      alignItems: 'center', justifyContent: 'center',
                      ...(t.cardBorder && { borderWidth: t.cardBorderWidth, borderColor: avatar === a ? t.primary : t.cardBorderColor }),
                    }}
                  >
                    <Text style={{ fontSize: 26 }}>{a}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Ring color */}
            <View>
              <Text style={{
                fontFamily: t.fontBodyBold, fontSize: 11, letterSpacing: 1.5,
                textTransform: 'uppercase', color: t.inkSoft, marginBottom: 12,
              }}>
                Ring color
              </Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
                {RING_COLORS.map((c) => (
                  <TouchableOpacity
                    key={c}
                    onPress={() => setRingColor(c)}
                    style={{
                      width: 40, height: 40, borderRadius: 20,
                      backgroundColor: c,
                      ...(ringColor === c && {
                        borderWidth: 3,
                        borderColor: t.ink,
                        shadowColor: c, shadowOffset: { width: 0, height: 0 },
                        shadowOpacity: 0.6, shadowRadius: 6,
                      }),
                    }}
                  />
                ))}
              </View>
            </View>
          </View>
        )}

        <View style={{ marginTop: 32, marginBottom: 32 }}>
          <CButton
            t={t} full size="lg"
            onPress={step < 2 ? handleNext : handleCreate}
            disabled={loading}
          >
            {step < 2 ? 'Continue →' : loading ? 'Creating account…' : 'Create account →'}
          </CButton>
        </View>

        {step === 0 && (
          <Text style={{
            textAlign: 'center', fontFamily: t.fontBody, fontSize: 14,
            color: t.inkSoft, marginBottom: 32,
          }}>
            Already have an account?{' '}
            <Text
              style={{ color: t.ink, fontFamily: t.fontBodyBold }}
              onPress={() => router.replace('/(auth)/sign-in')}
            >
              Sign in
            </Text>
          </Text>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
