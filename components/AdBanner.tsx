// components/AdBanner.tsx
// Native version (iOS/Android) — uses react-native-google-mobile-ads
import React, { useRef, useState } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { colors } from '../utils/theme';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';

// Replace with your real ad unit IDs for production
const AD_UNIT_ID = Platform.select({
  ios: __DEV__ ? TestIds.ADAPTIVE_BANNER : 'ca-app-pub-XXXXX/YYYYY',
  android: __DEV__ ? TestIds.ADAPTIVE_BANNER : 'ca-app-pub-XXXXX/ZZZZZ',
}) as string;

export function AdBanner() {
  const [adFailed, setAdFailed] = useState(false);
  const bannerRef = useRef<BannerAd>(null);

  if (adFailed) return null;

  return (
    <View style={styles.container}>
      <BannerAd
        ref={bannerRef}
        unitId={AD_UNIT_ID}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{
          requestNonPersonalizedAdsOnly: true,
        }}
        onAdLoaded={() => {
          console.log('Ad loaded');
        }}
        onAdFailedToLoad={(error) => {
          console.warn('Ad failed to load:', error);
          setAdFailed(true);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: colors.bg,
  },
});