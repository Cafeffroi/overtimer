// components/AdBanner.web.tsx
// Web version — no AdMob available, show dev placeholder or nothing
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../utils/theme';

export function AdBanner() {
  if (__DEV__) {
    return (
      <View style={styles.placeholder}>
        <Text style={styles.placeholderText}>Ad Banner (native only)</Text>
      </View>
    );
  }
  return null;
}

const styles = StyleSheet.create({
  placeholder: {
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bgCard,
    borderTopWidth: 1,
    borderTopColor: colors.surface,
  },
  placeholderText: {
    color: colors.textDim,
    fontSize: 11,
  },
});