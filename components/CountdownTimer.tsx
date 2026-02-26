// components/CountdownTimer.tsx
import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Switch,
  Platform,
} from 'react-native';
import { colors, spacing, radii, shadows } from '../utils/theme';
import { formatMs } from '../utils/formatTime';
import { useCountdown } from '../hooks/useCountdown';
import { useTimerStore, SavedTimer } from '../store/timerStore';
import { CircularProgress } from './CircularProgress';
import { TimerForm } from './TimerForm';
import { SavedTimersList } from './SavedTimersList';
import { FloatingWidget } from './FloatingWidget';
import { QuickTimePicker } from './QuickTimePicker';
// import * as Haptics from 'expo-haptics'; // Uncomment after install
// import { useKeepAwake } from 'expo-keep-awake'; // Uncomment after install

export function CountdownTimer() {
  const [formVisible, setFormVisible] = useState(false);
  const [activeTimerId, setActiveTimerId] = useState<string | null>(null);
  const [floatVisible, setFloatVisible] = useState(false);

  const seeThrough = useTimerStore((s) => s.seeThrough);
  const toggleSeeThrough = useTimerStore((s) => s.toggleSeeThrough);
  const showStartCount = useTimerStore((s) => s.showStartCount);
  const toggleShowStartCount = useTimerStore((s) => s.toggleShowStartCount);
  const addTimer = useTimerStore((s) => s.addTimer);
  const incrementStartCount = useTimerStore((s) => s.incrementStartCount);
  const resetStartCount = useTimerStore((s) => s.resetStartCount);

  const onFinish = useCallback(() => {
    // Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, []);

  const countdown = useCountdown({ onFinish });
  // useKeepAwake();

  const handleSelectTimer = (timer: SavedTimer) => {
    countdown.configure(timer.durationMs);
    setActiveTimerId(timer.id);
  };

  /** Fresh start — increments the counter */
  const handleStart = () => {
    countdown.start();
    setFloatVisible(true);
    if (activeTimerId) {
      incrementStartCount(activeTimerId);
    }
  };

  /** Resume from pause — does NOT increment the counter */
  const handleResume = () => {
    countdown.start();
  };

  /** Restart after finished — counts as a new start */
  const handleRestart = () => {
    countdown.restart();
    if (activeTimerId) {
      incrementStartCount(activeTimerId);
    }
  };

  const handleResetCounter = () => {
    if (activeTimerId) {
      resetStartCount(activeTimerId);
    }
  };

  const handleSaveNew = (title: string, durationMs: number) => {
    const id = addTimer(title, durationMs);
    countdown.configure(durationMs);
    setActiveTimerId(id);
  };

  /** Quick one-time start without saving */
  const handleQuickStart = (durationMs: number) => {
    setActiveTimerId(null);
    countdown.startWith(durationMs);
    setFloatVisible(true);
  };

  const isActive = countdown.status === 'running' || countdown.status === 'paused';
  const isFinished = countdown.status === 'finished';
  const ringColor = isFinished ? colors.ringComplete : colors.ringActive;
  const containerOpacity = seeThrough && isActive ? 0.6 : 1;

  // Get current start count for display
  const savedTimers = useTimerStore((s) => s.savedTimers);
  const activeTimer = savedTimers.find((t) => t.id === activeTimerId);
  const currentCount = activeTimer?.startCount ?? 0;

  return (
    <View style={[styles.container, { opacity: containerOpacity }]}>
      {/* ── Timer Display ───────────────────────────────────── */}
      <View style={styles.timerArea}>
        <CircularProgress
          size={260}
          strokeWidth={8}
          progress={isFinished ? 1 : countdown.progress}
          color={ringColor}
        >
          <Text style={styles.time}>
            {formatMs(countdown.remainingMs)}
          </Text>
          {isFinished && <Text style={styles.doneLabel}>Done!</Text>}
        </CircularProgress>

        {/* Start counter badge — fixed height container */}
        <View style={styles.counterContainer}>
          {showStartCount && activeTimerId && currentCount > 0 && (
            <View style={styles.counterBadge}>
              <Text style={styles.counterText}>×{currentCount}</Text>
              <TouchableOpacity
                onPress={handleResetCounter}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={styles.counterReset}>↺</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      {/* ── Controls ────────────────────────────────────────── */}
      <View style={styles.controls}>
        {countdown.status === 'idle' && countdown.totalMs > 0 && (
          <TouchableOpacity style={styles.btnPrimary} onPress={handleStart}>
            <Text style={styles.btnPrimaryText}>Start</Text>
          </TouchableOpacity>
        )}

        {countdown.status === 'running' && (
          <TouchableOpacity style={styles.btnSecondary} onPress={countdown.pause}>
            <Text style={styles.btnSecondaryText}>Pause</Text>
          </TouchableOpacity>
        )}

        {countdown.status === 'paused' && (
          <View style={styles.controlGroup}>
            <View style={styles.controlRow}>
              <TouchableOpacity style={styles.btnSecondary} onPress={countdown.reset}>
                <Text style={styles.btnSecondaryText}>Reset</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnPrimary} onPress={handleResume}>
                <Text style={styles.btnPrimaryText}>Resume</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={() => { countdown.clear(); setActiveTimerId(null); setFloatVisible(false); }}>
              <Text style={styles.newTimerLink}>New timer...</Text>
            </TouchableOpacity>
          </View>
        )}

        {isFinished && (
          <View style={styles.controlGroup}>
            <View style={styles.controlRow}>
              <TouchableOpacity style={styles.btnSecondary} onPress={countdown.reset}>
                <Text style={styles.btnSecondaryText}>Reset</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnPrimary} onPress={handleRestart}>
                <Text style={styles.btnPrimaryText}>Restart</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={() => { countdown.clear(); setActiveTimerId(null); setFloatVisible(false); }}>
              <Text style={styles.newTimerLink}>New timer...</Text>
            </TouchableOpacity>
          </View>
        )}

        {countdown.totalMs === 0 && (
          <QuickTimePicker onStart={handleQuickStart} />
        )}
      </View>

      {/* ── Options ─────────────────────────────────────────── */}
      <View style={styles.options}>
        <View style={styles.optionRow}>
          <Text style={styles.optionLabel}>See-through mode</Text>
          <Switch
            value={seeThrough}
            onValueChange={toggleSeeThrough}
            trackColor={{ false: colors.surface, true: colors.accentDim }}
            thumbColor={seeThrough ? colors.accent : colors.textDim}
          />
        </View>
        <View style={styles.optionRow}>
          <Text style={styles.optionLabel}>Show start counter</Text>
          <Switch
            value={showStartCount}
            onValueChange={toggleShowStartCount}
            trackColor={{ false: colors.surface, true: colors.secondaryDim }}
            thumbColor={showStartCount ? colors.secondary : colors.textDim}
          />
        </View>
      </View>

      {/* ── Saved Timers ────────────────────────────────────── */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Saved Timers</Text>
          <TouchableOpacity onPress={() => setFormVisible(true)}>
            <Text style={styles.addBtn}>+ New</Text>
          </TouchableOpacity>
        </View>
        <SavedTimersList onSelectTimer={handleSelectTimer} />
      </View>

      {/* ── Timer Form Modal ────────────────────────────────── */}
      <TimerForm
        visible={formVisible}
        onClose={() => setFormVisible(false)}
        onSave={handleSaveNew}
      />

      {/* ── Floating Widget ─────────────────────────────────── */}
      {floatVisible && (countdown.status === 'running' || countdown.status === 'paused' || countdown.status === 'finished') && (
        <FloatingWidget
          remainingMs={countdown.remainingMs}
          isRunning={countdown.status === 'running'}
          isFinished={countdown.status === 'finished'}
          seeThrough={seeThrough}
          onReset={() => countdown.reset()}
          onRestart={handleRestart}
          onResetCounter={handleResetCounter}
          onDismiss={() => setFloatVisible(false)}
        />
      )}
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  addBtn: {
    color: colors.accent,
    fontSize: 14,
    fontWeight: '700',
  },
  timerArea: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: spacing.xl,
    paddingBottom: spacing.xs,
  },
  time: {
    color: colors.textPrimary,
    fontSize: 48,
    fontWeight: '200',
    fontVariant: ['tabular-nums'],
    letterSpacing: 2,
  },
  doneLabel: {
    color: colors.success,
    fontSize: 16,
    fontWeight: '600',
    marginTop: spacing.xs,
  },
  counterContainer: {
    height: 36,
    marginTop: spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  counterBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.bgCard,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radii.full,
  },
  counterText: {
    color: colors.secondary,
    fontSize: 16,
    fontWeight: '700',
  },
  counterReset: {
    color: colors.textDim,
    fontSize: 18,
  },
  controls: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    minHeight: 120,
  },
  controlRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  controlGroup: {
    alignItems: 'center',
    gap: spacing.md,
  },
  newTimerLink: {
    color: colors.textDim,
    fontSize: 13,
    textDecorationLine: 'underline',
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
  options: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.bgCard,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
  },
  optionLabel: {
    color: colors.textSecondary,
    fontSize: 15,
  },
});