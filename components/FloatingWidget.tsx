// components/FloatingWidget.tsx
// In-app draggable mini-timer widget.
// This demonstrates the UX; the real overlay requires native modules.
// See README.md for the Android/iOS native implementation strategy.

import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  PanResponder,
  Animated,
  Dimensions,
} from 'react-native';
import { colors, radii, shadows } from '../utils/theme';
import { formatMs } from '../utils/formatTime';
import { RadialMenu, RadialMenuItem } from './RadialMenu';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const WIDGET_SIZE = 80;

interface Props {
  remainingMs: number;
  isRunning: boolean;
  seeThrough: boolean;
  onReset: () => void;
  onDismiss: () => void;
}

const RADIAL_ITEMS: RadialMenuItem[] = [
  { id: 'reset', label: 'Reset', icon: '↺', color: colors.secondary + '30' },
  { id: 'dismiss', label: 'Close', icon: '✕', color: colors.danger + '30' },
];

export function FloatingWidget({
  remainingMs,
  isRunning,
  seeThrough,
  onReset,
  onDismiss,
}: Props) {
  const pan = useRef(new Animated.ValueXY({ x: SCREEN_W - WIDGET_SIZE - 16, y: 120 })).current;
  const [menuVisible, setMenuVisible] = useState(false);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,

      onPanResponderGrant: () => {
        // Start long-press detection
        longPressTimer.current = setTimeout(() => {
          setMenuVisible(true);
        }, 600);

        pan.setOffset({
          x: (pan.x as any)._value,
          y: (pan.y as any)._value,
        });
        pan.setValue({ x: 0, y: 0 });
      },

      onPanResponderMove: (_, gesture) => {
        // If moved, cancel long press
        if (Math.abs(gesture.dx) > 5 || Math.abs(gesture.dy) > 5) {
          if (longPressTimer.current) {
            clearTimeout(longPressTimer.current);
            longPressTimer.current = null;
          }
        }
        Animated.event([null, { dx: pan.x, dy: pan.y }], {
          useNativeDriver: false,
        })(_, gesture);
      },

      onPanResponderRelease: () => {
        if (longPressTimer.current) {
          clearTimeout(longPressTimer.current);
        }
        pan.flattenOffset();
      },
    })
  ).current;

  const handleRadialSelect = (id: string) => {
    if (id === 'reset') onReset();
    if (id === 'dismiss') onDismiss();
  };

  return (
    <>
      <Animated.View
        style={[
          styles.widget,
          {
            transform: pan.getTranslateTransform(),
            opacity: seeThrough ? 0.5 : 0.95,
          },
        ]}
        {...panResponder.panHandlers}
      >
        <Text style={styles.time}>{formatMs(remainingMs)}</Text>
        {isRunning && <View style={styles.runningDot} />}
      </Animated.View>

      <RadialMenu
        visible={menuVisible}
        items={RADIAL_ITEMS}
        onSelect={handleRadialSelect}
        onClose={() => setMenuVisible(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  widget: {
    position: 'absolute',
    width: WIDGET_SIZE,
    height: WIDGET_SIZE,
    borderRadius: WIDGET_SIZE / 2,
    backgroundColor: colors.bg + 'EE',
    borderWidth: 2,
    borderColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
    ...shadows.glow,
  },
  time: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  runningDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.success,
    marginTop: 2,
  },
});
