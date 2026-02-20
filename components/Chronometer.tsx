// components/Chronometer.tsx
import React, { useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, spacing, radii, shadows } from '../utils/theme';
import { formatMsDetailed } from '../utils/formatTime';
import { useChronometer } from '../hooks/useChronometer';
import { useTimerStore } from '../store/timerStore';
import { ChronometerHistory } from './ChronometerHistory';

export function ChronometerView() {
  const chrono = useChronometer();
  const addSession = useTimerStore((s) => s.addChronometerSession);

  const { main, cents } = formatMsDetailed(chrono.elapsedMs);

  const handleStop = useCallback(() => {
    const { durationMs, startedAt } = chrono.reset();
    if (durationMs > 500 && startedAt) {
      // Only save sessions longer than 0.5s
      addSession(durationMs, startedAt);
    }
  }, [chrono, addSession]);

  return (
    <View style={styles.container}>
      {/* ── Display ───────────────────────────────────────── */}
      <View style={styles.display}>
        <View style={styles.timeRow}>
          <Text style={styles.time}>{main}</Text>
          <Text style={styles.cents}>{cents}</Text>
        </View>

        {chrono.status === 'running' && (
          <View style={styles.liveIndicator}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>Running</Text>
          </View>
        )}
      </View>

      {/* ── Controls ──────────────────────────────────────── */}
      <View style={styles.controls}>
        {chrono.status === 'idle' && (
          <TouchableOpacity style={styles.btnPrimary} onPress={chrono.start}>
            <Text style={styles.btnPrimaryText}>Start</Text>
          </TouchableOpacity>
        )}

        {chrono.status === 'running' && (
          <TouchableOpacity style={styles.btnDanger} onPress={chrono.pause}>
            <Text style={styles.btnDangerText}>Pause</Text>
          </TouchableOpacity>
        )}

        {chrono.status === 'paused' && (
          <View style={styles.controlRow}>
            <TouchableOpacity style={styles.btnSecondary} onPress={handleStop}>
              <Text style={styles.btnSecondaryText}>Stop</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnPrimary} onPress={chrono.start}>
              <Text style={styles.btnPrimaryText}>Resume</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* ── History ───────────────────────────────────────── */}
      <ChronometerHistory />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  display: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl + spacing.xl,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  time: {
    color: colors.textPrimary,
    fontSize: 64,
    fontWeight: '200',
    fontVariant: ['tabular-nums'],
    letterSpacing: 2,
  },
  cents: {
    color: colors.textDim,
    fontSize: 32,
    fontWeight: '300',
    fontVariant: ['tabular-nums'],
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.success,
  },
  liveText: {
    color: colors.success,
    fontSize: 13,
    fontWeight: '600',
  },
  controls: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  controlRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  btnPrimary: {
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.xl + 8,
    paddingVertical: spacing.sm + 6,
    borderRadius: radii.full,
    ...shadows.glow,
  },
  btnPrimaryText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  btnSecondary: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm + 6,
    borderRadius: radii.full,
  },
  btnSecondaryText: {
    color: colors.textSecondary,
    fontSize: 18,
    fontWeight: '600',
  },
  btnDanger: {
    backgroundColor: colors.danger + '20',
    borderWidth: 1,
    borderColor: colors.danger + '40',
    paddingHorizontal: spacing.xl + 8,
    paddingVertical: spacing.sm + 6,
    borderRadius: radii.full,
  },
  btnDangerText: {
    color: colors.danger,
    fontSize: 18,
    fontWeight: '700',
  },
});
