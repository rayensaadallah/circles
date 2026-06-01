import { Stack } from 'expo-router';

export default function AppLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'none' }}>

      {/* ── Tab screens: fade so direction never feels wrong ── */}
      <Stack.Screen name="index"    options={{ animation: 'fade', animationDuration: 150 }} />
      <Stack.Screen name="discover" options={{ animation: 'fade', animationDuration: 150 }} />
      <Stack.Screen name="profile"  options={{ animation: 'fade', animationDuration: 150 }} />

      {/* ── Forward / deeper screens: slide right ── */}
      <Stack.Screen name="settings"    options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="create-room" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="join-room"     options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="deck-detail"  options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="waiting-room" options={{ animation: 'slide_from_right' }} />

      {/* ── Modal: slides up from bottom ── */}
      <Stack.Screen name="topics-browser" options={{ presentation: 'modal' }} />
      <Stack.Screen name="combo-review"   options={{ presentation: 'modal' }} />

      {/* ── Game / transition screens: fade feels cinematic ── */}
      <Stack.Screen name="onboarding"           options={{ animation: 'fade' }} />
      <Stack.Screen name="topic-reveal"         options={{ animation: 'fade' }} />

      {/* ── Normal mode game flow ── */}
      <Stack.Screen name="normal-topic-reveal"  options={{ animation: 'fade' }} />
      <Stack.Screen name="normal-tally"         options={{ animation: 'fade' }} />
      <Stack.Screen name="normal-round"         options={{ animation: 'fade' }} />
      <Stack.Screen name="normal-mind-change"   options={{ animation: 'fade' }} />

    </Stack>
  );
}
