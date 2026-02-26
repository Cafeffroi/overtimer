// components/FloatingWidget.tsx
import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  PanResponder,
  Animated,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { colors, radii, shadows } from '../utils/theme';
import { formatMs } from '../utils/formatTime';
import { RadialMenu, RadialMenuItem } from './RadialMenu';

const { width: SCREEN_W } = Dimensions.get('window');
const WIDGET_SIZE = 80;

interface Props {
  remainingMs: number;
  isRunning: boolean;
  isFinished: boolean;
  seeThrough: boolean;
  onReset: () => void;
  onRestart: () => void;
  onResetCounter: () => void;
  onDismiss: () => void;
}

const RADIAL_ITEMS: RadialMenuItem[] = [
  { id: 'reset', label: 'Reset', icon: '↺', color: colors.secondary + '30' },
  { id: 'resetCounter', label: 'Reset ×', icon: '0', color: colors.warning + '30' },
  { id: 'dismiss', label: 'Close', icon: '✕', color: colors.danger + '30' },
];

export function FloatingWidget({
  remainingMs,
  isRunning,
  isFinished,
  seeThrough,
  onReset,
  onRestart,
  onResetCounter,
  onDismiss,
}: Props) {
  const pan = useRef(new Animated.ValueXY({ x: SCREEN_W - WIDGET_SIZE - 16, y: 120 })).current;
  const [menuVisible, setMenuVisible] = useState(false);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const blinkAnim = useRef(new Animated.Value(1)).current;
  const [blinkDone, setBlinkDone] = useState(false);
  const prevFinished = useRef(false);

  // Blink 3 times when timer finishes
  useEffect(() => {
    if (isFinished && !prevFinished.current) {
      setBlinkDone(false);
      Animated.sequence([
        Animated.timing(blinkAnim, { toValue: 0.15, duration: 150, useNativeDriver: true }),
        Animated.timing(blinkAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
        Animated.timing(blinkAnim, { toValue: 0.15, duration: 150, useNativeDriver: true }),
        Animated.timing(blinkAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
        Animated.timing(blinkAnim, { toValue: 0.15, duration: 150, useNativeDriver: true }),
        Animated.timing(blinkAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
      ]).start(() => {
        setBlinkDone(true);
      });
    }
    if (!isFinished) {
      setBlinkDone(false);
      blinkAnim.setValue(1);
    }
    prevFinished.current = isFinished;
  }, [isFinished, blinkAnim]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,

      onPanResponderGrant: () => {
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
    if (id === 'resetCounter') onResetCounter();
    if (id === 'dismiss') onDismiss();
  };

  const showRestart = isFinished && blinkDone;
  const borderColor = isFinished ? colors.success : colors.accent;

  return (
    <>
      <Animated.View
        style={[
          styles.widget,
          {
            transform: pan.getTranslateTransform(),
            opacity: seeThrough && !isFinished ? 0.5 : blinkAnim,
            borderColor,
          },
        ]}
        {...panResponder.panHandlers}
      >
        {showRestart ? (
          <TouchableOpacity
            style={styles.restartTouchable}
            onPress={onRestart}
            activeOpacity={0.7}
          >
            <Text style={styles.restartIcon}>▶</Text>
            <Text style={styles.restartLabel}>Restart</Text>
          </TouchableOpacity>
        ) : (
          <>
            <Text style={[styles.time, isFinished && styles.timeFinished]}>
              {formatMs(remainingMs)}
            </Text>
            {isRunning && <View style={styles.runningDot} />}
          </>
        )}
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
  timeFinished: {
    color: colors.success,
  },
  runningDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.success,
    marginTop: 2,
  },
  restartTouchable: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
    borderRadius: WIDGET_SIZE / 2,
  },
  restartIcon: {
    color: colors.success,
    fontSize: 20,
  },
  restartLabel: {
    color: colors.success,
    fontSize: 9,
    fontWeight: '700',
    marginTop: 1,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});