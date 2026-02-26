// app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';
import { Text, StyleSheet, View } from 'react-native';
import { colors, spacing, radii } from '../../utils/theme';
import { AdBanner } from '../../components/AdBanner';

export default function TabsLayout() {
  return (
    <View style={styles.wrapper}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: styles.tabBar,
          tabBarActiveTintColor: colors.accent,
          tabBarInactiveTintColor: colors.textDim,
          tabBarLabelStyle: styles.tabLabel,
        }}
      >
        <Tabs.Screen
          name="countdown"
          options={{
            title: 'Countdown',
            tabBarIcon: ({ focused }) => (
              <Text style={[styles.tabIcon, focused && styles.tabIconActive]}>
                ⏱
              </Text>
            ),
          }}
        />
        <Tabs.Screen
          name="chronometer"
          options={{
            title: 'Chrono',
            tabBarIcon: ({ focused }) => (
              <Text style={[styles.tabIcon, focused && styles.tabIconActive]}>
                ⏲
              </Text>
            ),
          }}
        />
      </Tabs>
      <AdBanner />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  tabBar: {
    backgroundColor: colors.bgCard,
    borderTopWidth: 1,
    borderTopColor: colors.surface,
    height: 64,
    paddingBottom: 8,
    paddingTop: 8,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  tabIcon: {
    fontSize: 22,
  },
  tabIconActive: {
    // Could add glow or scale effect here
  },
});