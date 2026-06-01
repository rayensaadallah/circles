import { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as storage from '@/lib/storage';
import Svg, { Circle as SvgCircle } from 'react-native-svg';
import { useTheme } from '@/contexts/ThemeContext';
import { CButton, CAvatar } from '@/components/ui';

const STEPS = [
  {
    title: 'Sit in a circle.\nPhones at the ready.',
    body: 'One host creates a room. Everyone else joins with a 4-letter code. The app picks a topic and runs the rules.',
    icon: '◉',
  },
  {
    title: 'Pick your side.\nNo undecided.',
    body: 'Every topic splits the room. You\'re either For or Against. The app assigns debate roles based on the split.',
    icon: '⚖',
  },
  {
    title: 'Convince people.\nChange minds.',
    body: 'You earn points by persuading others. The best debater wins the round. At the end, the champion is crowned.',
    icon: '🏆',
  },
];

export default function OnboardingScreen() {
  const { theme: t } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState(0);

  const accentValues = Object.values(t.accents);

  const finish = async () => {
    await storage.setItem('hasSeenOnboarding', '1');
    router.replace('/');
  };

  const current = STEPS[step];

  return (
    <View style={{ flex: 1, backgroundColor: t.bg, paddingTop: insets.top + 20, paddingHorizontal: 24 }}>
      {/* Top bar */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 }}>
        <View style={{ flexDirection: 'row', gap: 6 }}>
          {STEPS.map((_, i) => (
            <View key={i} style={{
              width: i === step ? 24 : 8, height: 8, borderRadius: 4,
              backgroundColor: i <= step ? t.ink : t.inkSoft,
              opacity: i === step ? 1 : 0.3,
            }} />
          ))}
        </View>
        <TouchableOpacity onPress={finish}>
          <Text style={{ fontFamily: t.fontBody, fontSize: 14, color: t.inkSoft }}>Skip</Text>
        </TouchableOpacity>
      </View>

      {/* Visual */}
      <View style={{ alignItems: 'center', marginBottom: 40 }}>
        <View style={{ width: 240, height: 240, position: 'relative', alignItems: 'center', justifyContent: 'center' }}>
          <Svg width={240} height={240} viewBox="0 0 240 240" style={{ position: 'absolute' }}>
            <SvgCircle cx={120} cy={120} r={92} fill="none" stroke={t.ink} strokeWidth={1.5} strokeDasharray="3 6" opacity={0.4} />
          </Svg>
          {Array.from({ length: 6 }).map((_, i) => {
            const a = (i / 6) * Math.PI * 2 - Math.PI / 2;
            const x = 120 + Math.cos(a) * 92 - 24;
            const y = 120 + Math.sin(a) * 92 - 24;
            return (
              <View key={i} style={{ position: 'absolute', left: x, top: y }}>
                <CAvatar color={accentValues[i % 5]} initial={'ABCDEF'[i]} size={48} t={t} />
              </View>
            );
          })}
          {/* Center */}
          <View style={{
            width: 80, height: 80, borderRadius: 40,
            backgroundColor: t.primary,
            alignItems: 'center', justifyContent: 'center',
            ...(t.isHardShadow && { borderWidth: t.cardBorderWidth, borderColor: t.cardBorderColor }),
          }}>
            <Text style={{ fontSize: 32, color: t.primaryFg }}>{current.icon}</Text>
          </View>
        </View>
      </View>

      {/* Text */}
      <View style={{ flex: 1 }}>
        <Text style={{
          fontFamily: t.fontDisplay, fontSize: 30, color: t.ink,
          letterSpacing: t.letterSpacing, lineHeight: 34, marginBottom: 16,
        }}>
          {current.title}
        </Text>
        <Text style={{
          fontFamily: t.fontBody, fontSize: 15, color: t.inkSoft,
          lineHeight: 22, maxWidth: 300,
        }}>
          {current.body}
        </Text>
      </View>

      {/* Actions */}
      <View style={{ paddingBottom: Math.max(insets.bottom + 16, 32) }}>
        <CButton
          t={t} full size="lg"
          onPress={step < STEPS.length - 1 ? () => setStep(step + 1) : finish}
        >
          {step < STEPS.length - 1 ? 'Continue' : 'Start debating →'}
        </CButton>
      </View>
    </View>
  );
}
