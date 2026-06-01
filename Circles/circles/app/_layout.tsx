import { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { useFonts } from 'expo-font';
import { SpaceGrotesk_700Bold, SpaceGrotesk_600SemiBold } from '@expo-google-fonts/space-grotesk';
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold } from '@expo-google-fonts/inter';
import { Fraunces_600SemiBold } from '@expo-google-fonts/fraunces';
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';
import { ProfileProvider } from '@/contexts/ProfileContext';

SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session) {
        // getUser() validates the token against the server.
        // If the refresh token has expired, clear the dead session immediately
        // so the user is sent to auth instead of being stuck in a broken state.
        const { error } = await supabase.auth.getUser();
        if (error) {
          await supabase.auth.signOut({ scope: 'local' });
          setSession(null);
        } else {
          setSession(session);
        }
      } else {
        setSession(null);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'TOKEN_REFRESHED' || event === 'SIGNED_IN') {
        setSession(session);
      } else if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
        setSession(null);
      } else {
        setSession(session);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Redirect based on session state — runs whenever session or loading changes
  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!session && !inAuthGroup) {
      // No session and not already on auth screens → force to auth
      router.replace('/(auth)');
    } else if (session && inAuthGroup) {
      // Has session but still on auth screens → go to app
      router.replace('/(app)');
    }
  }, [session, loading, segments]);

  if (loading) return null;

  const isDark = theme.bg.startsWith('#0') || theme.bg.startsWith('#1');

  return (
    <>
      <Stack screenOptions={{ headerShown: false, animation: 'fade', animationDuration: 200 }}>
        <Stack.Screen name="(app)" />
        <Stack.Screen name="(auth)" />
      </Stack>
      <StatusBar style={isDark ? 'light' : 'dark'} />
    </>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    SpaceGrotesk_700Bold,
    SpaceGrotesk_600SemiBold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Fraunces_600SemiBold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <ThemeProvider>
      <ProfileProvider>
        <RootLayoutNav />
      </ProfileProvider>
    </ThemeProvider>
  );
}
