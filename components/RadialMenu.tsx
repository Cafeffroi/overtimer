// components/RadialMenu.tsx
// Radial menu that appears on long-press of the floating widget.
// In-app version — the native overlay version will mirror this API.

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Modal,
} from 'react-native';
import { colors, spacing, radii } from '../utils/theme';

export interface RadialMenuItem {
  id: string;
  label: string;
  icon: string; // emoji for now, replace with icon lib
  color?: string;
}

interface Props {
  visible: boolean;
  items: RadialMenuItem[];
  onSelect: (id: string) => void;
  onClose: () => void;
  centerX?: number;
  centerY?: number;
}

const RADIUS = 90; // distance from center

export function RadialMenu({
  visible,
  items,
  onSelect,
  onClose,
  centerX = 0,
  centerY = 0,
}: Props) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(fadeAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }),
      ]).start();
    } else {
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.5);
    }
  }, [visible]);

  if (!visible) return null;

  const angleStep = (2 * Math.PI) / items.length;
  const startAngle = -Math.PI / 2; // Start from top

  return (
    <Modal transparent visible={visible} onRequestClose={onClose}>
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <Animated.View
          style={[
            styles.menuContainer,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {/* Center dot */}
          <View style={styles.centerDot} />

          {/* Menu items arranged in circle */}
          {items.map((item, index) => {
            const angle = startAngle + index * angleStep;
            const x = Math.cos(angle) * RADIUS;
            const y = Math.sin(angle) * RADIUS;

            return (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.menuItem,
                  {
                    transform: [{ translateX: x }, { translateY: y }],
                    backgroundColor: item.color ?? colors.surface,
                  },
                ]}
                onPress={() => {
                  onSelect(item.id);
                  onClose();
                }}
              >
                <Text style={styles.menuIcon}>{item.icon}</Text>
                <Text style={styles.menuLabel}>{item.label}</Text>
              </TouchableOpacity>
            );
          })}
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuContainer: {
    width: RADIUS * 2 + 80,
    height: RADIUS * 2 + 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.accent,
    position: 'absolute',
  },
  menuItem: {
    position: 'absolute',
    width: 72,
    height: 72,
    borderRadius: radii.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.textDim + '30',
  },
  menuIcon: {
    fontSize: 22,
  },
  menuLabel: {
    color: colors.textPrimary,
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
});
