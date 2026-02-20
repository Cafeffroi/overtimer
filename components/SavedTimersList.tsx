// components/SavedTimersList.tsx
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from 'react-native';
import { colors, spacing, radii, shadows } from '../utils/theme';
import { durationLabel } from '../utils/formatTime';
import { SavedTimer, useTimerStore } from '../store/timerStore';

interface Props {
  onSelectTimer: (timer: SavedTimer) => void;
}

export function SavedTimersList({ onSelectTimer }: Props) {
  const savedTimers = useTimerStore((s) => s.savedTimers);
  const removeTimer = useTimerStore((s) => s.removeTimer);
  const resetStartCount = useTimerStore((s) => s.resetStartCount);
  const showStartCount = useTimerStore((s) => s.showStartCount);

  if (savedTimers.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyIcon}>📌</Text>
        <Text style={styles.emptyText}>No saved timers yet</Text>
        <Text style={styles.emptySubtext}>
          Create a timer and save it for quick access
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={savedTimers}
      keyExtractor={(item) => item.id}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.list}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.card}
          onPress={() => onSelectTimer(item)}
          onLongPress={() => removeTimer(item.id)}
          activeOpacity={0.7}
        >
          <Text style={styles.cardTitle} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.cardDuration}>
            {durationLabel(item.durationMs)}
          </Text>

          {showStartCount && item.startCount > 0 && (
            <View style={styles.countBadge}>
              <Text style={styles.countText}>×{item.startCount}</Text>
              <TouchableOpacity
                onPress={(e) => {
                  e.stopPropagation?.();
                  resetStartCount(item.id);
                }}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={styles.resetCount}>↺</Text>
              </TouchableOpacity>
            </View>
          )}
        </TouchableOpacity>
      )}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  card: {
    backgroundColor: colors.bgCard,
    borderRadius: radii.lg,
    padding: spacing.md,
    width: 130,
    borderWidth: 1,
    borderColor: colors.surface,
    ...shadows.card,
  },
  cardTitle: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  cardDuration: {
    color: colors.accent,
    fontSize: 18,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  countBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
    gap: spacing.xs,
  },
  countText: {
    color: colors.secondary,
    fontSize: 13,
    fontWeight: '600',
  },
  resetCount: {
    color: colors.textDim,
    fontSize: 16,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  emptyIcon: {
    fontSize: 32,
    marginBottom: spacing.sm,
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: 16,
    fontWeight: '600',
  },
  emptySubtext: {
    color: colors.textDim,
    fontSize: 13,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
});
