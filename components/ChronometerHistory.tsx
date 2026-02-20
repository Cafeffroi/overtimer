// components/ChronometerHistory.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { colors, spacing, radii } from '../utils/theme';
import { formatMs, formatDateTime } from '../utils/formatTime';
import { useTimerStore } from '../store/timerStore';

export function ChronometerHistory() {
  const history = useTimerStore((s) => s.chronometerHistory);
  const clearHistory = useTimerStore((s) => s.clearChronometerHistory);

  if (history.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>No sessions recorded yet</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>History</Text>
        <TouchableOpacity onPress={clearHistory}>
          <Text style={styles.clearBtn}>Clear</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={history}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
        renderItem={({ item, index }) => (
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <Text style={styles.rowIndex}>#{history.length - index}</Text>
              <Text style={styles.rowDuration}>{formatMs(item.durationMs)}</Text>
            </View>
            <Text style={styles.rowDate}>
              {formatDateTime(new Date(item.endedAt))}
            </Text>
          </View>
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.bgCard,
    borderRadius: radii.lg,
    padding: spacing.md,
    marginHorizontal: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  clearBtn: {
    color: colors.danger,
    fontSize: 13,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  rowIndex: {
    color: colors.textDim,
    fontSize: 13,
    width: 28,
  },
  rowDuration: {
    color: colors.textPrimary,
    fontSize: 17,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  rowDate: {
    color: colors.textDim,
    fontSize: 13,
  },
  separator: {
    height: 1,
    backgroundColor: colors.surface,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
    marginHorizontal: spacing.lg,
  },
  emptyText: {
    color: colors.textDim,
    fontSize: 14,
  },
});
