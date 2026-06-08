import { PropsWithChildren } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppTheme } from '@/shared/constants/app-theme';

type ScreenShellProps = PropsWithChildren<{
  style?: ViewStyle;
  centered?: boolean;
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
}>;

export function ScreenShell({
  children,
  style,
  centered = false,
  edges,
}: ScreenShellProps) {
  return (
    <SafeAreaView style={[styles.safe, centered && styles.centered, style]} edges={edges}>
      <View style={styles.orb1} pointerEvents="none" />
      <View style={styles.orb2} pointerEvents="none" />
      {children}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: AppTheme.background,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  orb1: {
    position: 'absolute',
    top: -50,
    left: -50,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: AppTheme.primaryMuted,
    zIndex: 0,
  },
  orb2: {
    position: 'absolute',
    bottom: -80,
    right: -80,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: AppTheme.secondaryMuted,
    zIndex: 0,
  },
});
