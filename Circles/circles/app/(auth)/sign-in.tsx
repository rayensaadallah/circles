import { useState } from 'react';
import { View, Text, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts/ThemeContext';
import { CButton, CInput, cardStyle } from '@/components/ui';
import * as authService from '@/services/auth';

export default function SignInScreen() {
  const { theme: t } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }
    setLoading(true);
    const { error } = await authService.signIn(email, password);
    setLoading(false);
    if (error) Alert.alert('Sign in failed', error.message);
    // On success, root layout picks up session change and navigates to (app)
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: t.bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingTop: insets.top + 20, paddingHorizontal: 24 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Back */}
        <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: 32 }}>
          <Text style={{ fontFamily: t.fontBody, fontSize: 22, color: t.ink }}>←</Text>
        </TouchableOpacity>

        <Text style={{
          fontFamily: t.fontDisplay, fontSize: 36, color: t.ink,
          letterSpacing: t.letterSpacing, lineHeight: 40, marginBottom: 8,
        }}>
          Welcome back.
        </Text>
        <Text style={{ fontFamily: t.fontBody, fontSize: 15, color: t.inkSoft, marginBottom: 40 }}>
          Sign in to continue.
        </Text>

        {/* Form */}
        <View style={{ gap: 12 }}>
          <CInput
            t={t}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
          />

          <View style={{ position: 'relative' }}>
            <CInput
              t={t}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoComplete="password"
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
        </View>

        <View style={{ marginTop: 24 }}>
          <CButton t={t} full size="lg" onPress={handleSignIn} disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in →'}
          </CButton>
        </View>

        <Text style={{
          textAlign: 'center', fontFamily: t.fontBody, fontSize: 14,
          color: t.inkSoft, marginTop: 28,
        }}>
          New here?{' '}
          <Text
            style={{ color: t.ink, fontFamily: t.fontBodyBold }}
            onPress={() => router.replace('/(auth)/sign-up')}
          >
            Create account
          </Text>
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
