import React from 'react';
import {
  View, Text, TouchableOpacity, ViewStyle, TextStyle, Platform,
  StyleSheet, Pressable,
} from 'react-native';
import Svg, { Circle as SvgCircle, Line as SvgLine } from 'react-native-svg';
import { useRouter, usePathname } from 'expo-router';
import { CTheme } from '@/constants/themes';

// ─── Helpers ──────────────────────────────────────────────────

export const MONO = Platform.select({
  ios: 'Courier New',
  android: 'monospace',
  default: 'Courier New',
}) as string;

export function cardStyle(t: CTheme, extra: ViewStyle = {}): ViewStyle {
  return {
    backgroundColor: t.paper,
    borderRadius: t.radius,
    ...(t.cardBorder && {
      borderWidth: t.cardBorderWidth,
      borderColor: t.cardBorderColor,
    }),
    ...t.shadow,
    ...extra,
  };
}

// ─── CMark: circle of 8 dots with one filled ──────────────────

export function CMark({ t, size = 56, accent }: { t: CTheme; size?: number; accent?: string }) {
  const c = accent || t.primary;
  const cx = size / 2, cy = size / 2, r = size / 2 - 4;
  const dots = 8;
  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {Array.from({ length: dots }).map((_, i) => {
        const a = (i / dots) * Math.PI * 2 - Math.PI / 2;
        const x = cx + Math.cos(a) * r;
        const y = cy + Math.sin(a) * r;
        const filled = i === 0;
        return (
          <SvgCircle
            key={i} cx={x} cy={y} r={filled ? 5 : 3}
            fill={filled ? c : t.ink} opacity={filled ? 1 : 0.7}
          />
        );
      })}
    </Svg>
  );
}

// ─── CLogo: mark + wordmark ────────────────────────────────────

export function CLogo({ t, size = 28 }: { t: CTheme; size?: number }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      <CMark t={t} size={size} />
      <Text style={{
        fontFamily: t.fontDisplay,
        fontSize: size * 0.62,
        color: t.ink,
        letterSpacing: -0.04 * size,
        lineHeight: size,
      }}>
        cercles
      </Text>
    </View>
  );
}

// ─── CAvatar: filled circle with initial/emoji ────────────────

interface CAvatarProps {
  color: string;
  initial: string;
  size?: number;
  t: CTheme;
  ring?: boolean;
}

export function CAvatar({ color, initial, size = 36, t, ring = false }: CAvatarProps) {
  return (
    <View style={{
      width: size, height: size, borderRadius: size / 2,
      backgroundColor: color,
      alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
      ...(ring && {
        borderWidth: 3,
        borderColor: color,
        shadowColor: color,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 8,
      }),
    }}>
      <Text style={{
        fontFamily: t.fontDisplay,
        fontSize: size * 0.44,
        color: t.primaryFg,
        lineHeight: size * 0.56,
      }}>
        {initial}
      </Text>
    </View>
  );
}

// ─── CButton ──────────────────────────────────────────────────

interface CButtonProps {
  children: React.ReactNode;
  t: CTheme;
  variant?: 'primary' | 'outline' | 'ghost';
  full?: boolean;
  size?: 'sm' | 'md' | 'lg';
  onPress?: () => void;
  style?: ViewStyle;
  disabled?: boolean;
}

export function CButton({
  children, t, variant = 'primary', full = false,
  size = 'md', onPress, style, disabled,
}: CButtonProps) {
  const h = size === 'lg' ? 56 : size === 'sm' ? 36 : 48;
  const fs = size === 'lg' ? 18 : size === 'sm' ? 14 : 16;
  const isPrimary = variant === 'primary';
  const isOutline = variant === 'outline';

  const containerStyle: ViewStyle = {
    height: h,
    paddingHorizontal: size === 'sm' ? 14 : 22,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    ...(full && { width: '100%' }),
    ...(isPrimary && {
      backgroundColor: t.primary,
      ...(t.isHardShadow && {
        shadowColor: t.ink,
        shadowOffset: { width: 3, height: 3 },
        shadowOpacity: 1,
        shadowRadius: 0,
      }),
    }),
    ...(isOutline && {
      backgroundColor: 'transparent',
      borderWidth: 1.5,
      borderColor: t.ink,
    }),
    ...(disabled && { opacity: 0.5 }),
    ...style,
  };

  const textStyle: TextStyle = {
    fontFamily: t.fontBodyBold,
    fontSize: fs,
    letterSpacing: t.letterSpacing,
    color: isPrimary ? t.primaryFg : t.ink,
  };

  return (
    <TouchableOpacity style={containerStyle} onPress={onPress} disabled={disabled} activeOpacity={0.8}>
      {typeof children === 'string' ? (
        <Text style={textStyle}>{children}</Text>
      ) : (
        children
      )}
    </TouchableOpacity>
  );
}

// ─── CCard ────────────────────────────────────────────────────

interface CCardProps {
  children: React.ReactNode;
  t: CTheme;
  padding?: number;
  style?: ViewStyle;
  color?: string;
  onPress?: () => void;
}

export function CCard({ children, t, padding = 18, style, color, onPress }: CCardProps) {
  const s: ViewStyle = {
    backgroundColor: color || t.paper,
    borderRadius: t.radius,
    ...(t.cardBorder && { borderWidth: t.cardBorderWidth, borderColor: t.cardBorderColor }),
    ...t.shadow,
    ...(padding > 0 && { padding }),
    ...style,
  };

  if (onPress) {
    return (
      <TouchableOpacity style={s} onPress={onPress} activeOpacity={0.85}>
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={s}>{children}</View>;
}

// ─── CInput ───────────────────────────────────────────────────

import { TextInput, TextInputProps } from 'react-native';

interface CInputProps extends Omit<TextInputProps, 'style'> {
  t: CTheme;
  style?: TextInputProps['style'];
}

export function CInput({ t, style, ...props }: CInputProps) {
  return (
    <TextInput
      style={[{
        backgroundColor: t.paper,
        borderRadius: t.radiusSm,
        borderWidth: t.cardBorder ? t.cardBorderWidth : 1,
        borderColor: t.cardBorder ? t.cardBorderColor : t.bgAlt,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontFamily: t.fontBody,
        fontSize: 16,
        color: t.ink,
        letterSpacing: t.letterSpacing,
      }, style]}
      placeholderTextColor={t.inkSoft}
      {...props}
    />
  );
}

// ─── CTabBar ──────────────────────────────────────────────────

interface CTabBarProps {
  t: CTheme;
  active: 'home' | 'discover' | 'profile';
}

const TAB_ITEMS = [
  { id: 'home', label: 'Home', icon: '◉', route: '/' },
  { id: 'discover', label: 'Decks', icon: '⌗', route: '/discover' },
  { id: 'play', label: 'Play', icon: '▶', route: '/create-room', primary: true },
  { id: 'profile', label: 'You', icon: '◐', route: '/profile' },
] as const;

export function CTabBar({ t, active }: CTabBarProps) {
  const router = useRouter();

  return (
    <View style={{
      position: 'absolute', bottom: 28, left: 16, right: 16,
      height: 64,
      backgroundColor: t.paper,
      borderRadius: 999,
      ...(t.cardBorder && { borderWidth: t.cardBorderWidth, borderColor: t.cardBorderColor }),
      ...t.shadow,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-around',
      paddingHorizontal: 8,
    }}>
      {TAB_ITEMS.map((tab) => {
        const isActive = active === tab.id;
        return (
          <TouchableOpacity
            key={tab.id}
            onPress={() => {
              if ((tab as any).primary) {
                router.push(tab.route as any);
              } else if (active !== tab.id) {
                router.replace(tab.route as any);
              }
            }}
            style={{ alignItems: 'center', gap: 2, paddingHorizontal: 8, paddingVertical: 6 }}
            activeOpacity={0.7}
          >
            {(tab as any).primary ? (
              <View style={{
                width: 44, height: 44, borderRadius: 22,
                backgroundColor: t.primary,
                alignItems: 'center', justifyContent: 'center',
                marginTop: -16,
                ...(t.isHardShadow && { borderWidth: t.cardBorderWidth, borderColor: t.cardBorderColor }),
              }}>
                <Text style={{ fontSize: 16, color: t.primaryFg }}>{tab.icon}</Text>
              </View>
            ) : (
              <Text style={{ fontSize: 18, color: isActive ? t.ink : t.inkSoft }}>{tab.icon}</Text>
            )}
            {!(tab as any).primary && (
              <Text style={{
                fontFamily: t.fontBody, fontSize: 10,
                color: isActive ? t.ink : t.inkSoft,
              }}>
                {tab.label}
              </Text>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// ─── CConcentricRings: decorative background ──────────────────

export function CConcentricRings({
  t, cx = 196, cy = 280, radii = [60, 120, 180, 240, 300, 360],
}: {
  t: CTheme;
  cx?: number;
  cy?: number;
  radii?: number[];
}) {
  const accentValues = Object.values(t.accents);
  return (
    <Svg
      style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
      viewBox="0 0 393 852"
      preserveAspectRatio="xMidYMid slice"
    >
      {radii.map((r, i) => (
        <SvgCircle
          key={i} cx={cx} cy={cy} r={r}
          fill="none"
          stroke={accentValues[i % 5]}
          strokeWidth={i === 0 ? 2.5 : 1.5}
          strokeDasharray={i % 2 ? '4 6' : undefined}
          opacity={0.85 - i * 0.1}
        />
      ))}
    </Svg>
  );
}
