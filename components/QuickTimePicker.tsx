// components/QuickTimePicker.tsx
import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Platform,
} from 'react-native';
import { colors, spacing, radii, shadows } from '../utils/theme';
import { toMs } from '../utils/formatTime';

interface Props {
  onStart: (durationMs: number) => void;
}

const PRESETS = [
  { label: '30s', ms: 30_000 },
  { label: '1m', ms: 60_000 },
  { label: '1m30', ms: 90_000 },
  { label: '2m', ms: 120_000 },
  { label: '3m', ms: 180_000 },
  { label: '5m', ms: 300_000 },
];

export function QuickTimePicker({ onStart }: Props) {
  const [showCustom, setShowCustom] = useState(false);
  const [minutes, setMinutes] = useState('1');
  const [seconds, setSeconds] = useState('30');
  const secRef = useRef<TextInput>(null);

  const customMs = toMs(0, parseInt(minutes, 10) || 0, parseInt(seconds, 10) || 0);

  const handleCustomStart = () => {
    if (customMs > 0) {
      onStart(customMs);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Quick start</Text>

      {/* Preset buttons */}
      <View style={styles.presets}>
        {PRESETS.map((p) => (
          <TouchableOpacity
            key={p.label}
            style={styles.presetBtn}
            onPress={() => onStart(p.ms)}
            activeOpacity={0.7}
          >
            <Text style={styles.presetText}>{p.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Custom toggle */}
      {!showCustom ? (
        <TouchableOpacity onPress={() => setShowCustom(true)}>
          <Text style={styles.customToggle}>Custom time...</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.customRow}>
          <View style={styles.customInput}>
            <TextInput
              style={styles.input}
              value={minutes}
              onChangeText={(t) => setMinutes(t.replace(/[^0-9]/g, ''))}
              keyboardType="number-pad"
              maxLength={2}
              selectTextOnFocus
              returnKeyType="next"
              onSubmitEditing={() => secRef.current?.focus()}
            />
            <Text style={styles.inputLabel}>m</Text>
          </View>
          <Text style={styles.inputSep}>:</Text>
          <View style={styles.customInput}>
            <TextInput
              ref={secRef}
              style={styles.input}
              value={seconds}
              onChangeText={(t) => setSeconds(t.replace(/[^0-9]/g, ''))}
              keyboardType="number-pad"
              maxLength={2}
              selectTextOnFocus
              returnKeyType="go"
              onSubmitEditing={handleCustomStart}
            />
            <Text style={styles.inputLabel}>s</Text>
          </View>
          <TouchableOpacity
            style={[styles.goBtn, customMs <= 0 && styles.goBtnDisabled]}
            onPress={handleCustomStart}
            disabled={customMs <= 0}
          >
            <Text style={styles.goText}>Go</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: spacing.md,
  },
  label: {
    color: colors.textDim,
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  presets: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  presetBtn: {
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.surface,
    borderRadius: radii.full,
    paddingHorizontal: spacing.md + 2,
    paddingVertical: spacing.sm + 2,
  },
  presetText: {
    color: colors.accent,
    fontSize: 15,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  customToggle: {
    color: colors.textDim,
    fontSize: 13,
    textDecorationLine: 'underline',
  },
  customRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  customInput: {
    alignItems: 'center',
  },
  input: {
    backgroundColor: colors.bgInput,
    borderRadius: radii.md,
    color: colors.textPrimary,
    fontSize: 22,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
    textAlign: 'center',
    width: 52,
    paddingVertical: spacing.sm,
    ...Platform.select({
      android: { textDecorationLine: 'none' },
      web: { outlineStyle: 'none' } as any,
    }),
  },
  inputLabel: {
    color: colors.textDim,
    fontSize: 11,
    marginTop: 2,
  },
  inputSep: {
    color: colors.textDim,
    fontSize: 22,
    paddingBottom: 14,
  },
  goBtn: {
    backgroundColor: colors.accent,
    borderRadius: radii.full,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 2,
    marginLeft: spacing.xs,
    ...shadows.glow,
  },
  goBtnDisabled: {
    opacity: 0.4,
  },
  goText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});