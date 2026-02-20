// components/TimerForm.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
} from 'react-native';
import { colors, spacing, radii, shadows } from '../utils/theme';
import { toMs, durationLabel } from '../utils/formatTime';

interface Props {
  visible: boolean;
  onClose: () => void;
  onSave: (title: string, durationMs: number) => void;
  /** If provided, pre-fills the form for editing */
  initial?: { title: string; hours: number; minutes: number; seconds: number };
}

export function TimerForm({ visible, onClose, onSave, initial }: Props) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [hours, setHours] = useState(initial?.hours ?? 0);
  const [minutes, setMinutes] = useState(initial?.minutes ?? 1);
  const [seconds, setSeconds] = useState(initial?.seconds ?? 30);

  const durationMs = toMs(hours, minutes, seconds);
  const isValid = durationMs > 0;

  const handleSave = () => {
    if (!isValid) return;
    const finalTitle = title.trim() || durationLabel(durationMs);
    onSave(finalTitle, durationMs);
    // Reset
    setTitle('');
    setHours(0);
    setMinutes(1);
    setSeconds(30);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.handle} />

          <Text style={styles.heading}>New Timer</Text>

          {/* Title input */}
          <Text style={styles.label}>Title (optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Rest between sets"
            placeholderTextColor={colors.textDim}
            value={title}
            onChangeText={setTitle}
            maxLength={40}
          />

          {/* Duration pickers */}
          <Text style={styles.label}>Duration</Text>
          <View style={styles.pickerRow}>
            <NumberPicker
              value={hours}
              onChange={setHours}
              max={23}
              label="h"
            />
            <Text style={styles.pickerSeparator}>:</Text>
            <NumberPicker
              value={minutes}
              onChange={setMinutes}
              max={59}
              label="m"
            />
            <Text style={styles.pickerSeparator}>:</Text>
            <NumberPicker
              value={seconds}
              onChange={setSeconds}
              max={59}
              label="s"
            />
          </View>

          {isValid && (
            <Text style={styles.preview}>
              {durationLabel(durationMs)}
            </Text>
          )}

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity style={styles.btnCancel} onPress={onClose}>
              <Text style={styles.btnCancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.btnSave, !isValid && styles.btnDisabled]}
              onPress={handleSave}
              disabled={!isValid}
            >
              <Text style={styles.btnSaveText}>Save Timer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ── Simple number stepper ───────────────────────────────────────

function NumberPicker({
  value,
  onChange,
  max,
  label,
}: {
  value: number;
  onChange: (v: number) => void;
  max: number;
  label: string;
}) {
  const increment = () => onChange(value >= max ? 0 : value + 1);
  const decrement = () => onChange(value <= 0 ? max : value - 1);

  return (
    <View style={styles.picker}>
      <TouchableOpacity onPress={increment} style={styles.pickerBtn}>
        <Text style={styles.pickerArrow}>▲</Text>
      </TouchableOpacity>
      <View style={styles.pickerValue}>
        <Text style={styles.pickerNumber}>
          {value.toString().padStart(2, '0')}
        </Text>
        <Text style={styles.pickerLabel}>{label}</Text>
      </View>
      <TouchableOpacity onPress={decrement} style={styles.pickerBtn}>
        <Text style={styles.pickerArrow}>▼</Text>
      </TouchableOpacity>
    </View>
  );
}

// ── Styles ──────────────────────────────────────────────────────

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.bgCard,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
    ...shadows.card,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.textDim,
    alignSelf: 'center',
    marginBottom: spacing.lg,
  },
  heading: {
    color: colors.textPrimary,
    fontSize: 22,
    fontWeight: '700',
    marginBottom: spacing.lg,
  },
  label: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  input: {
    backgroundColor: colors.bgInput,
    borderRadius: radii.md,
    color: colors.textPrimary,
    fontSize: 16,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
  },
  pickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.sm,
  },
  picker: {
    alignItems: 'center',
    width: 72,
  },
  pickerBtn: {
    padding: spacing.sm,
  },
  pickerArrow: {
    color: colors.accent,
    fontSize: 18,
  },
  pickerValue: {
    alignItems: 'center',
    backgroundColor: colors.bgInput,
    borderRadius: radii.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    width: 64,
  },
  pickerNumber: {
    color: colors.textPrimary,
    fontSize: 28,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  pickerLabel: {
    color: colors.textDim,
    fontSize: 11,
    marginTop: 2,
  },
  pickerSeparator: {
    color: colors.textDim,
    fontSize: 28,
    marginHorizontal: spacing.xs,
  },
  preview: {
    color: colors.accent,
    fontSize: 14,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xl,
  },
  btnCancel: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    paddingVertical: spacing.sm + 4,
    alignItems: 'center',
  },
  btnCancelText: {
    color: colors.textSecondary,
    fontSize: 16,
    fontWeight: '600',
  },
  btnSave: {
    flex: 2,
    backgroundColor: colors.accent,
    borderRadius: radii.md,
    paddingVertical: spacing.sm + 4,
    alignItems: 'center',
  },
  btnSaveText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  btnDisabled: {
    opacity: 0.4,
  },
});
