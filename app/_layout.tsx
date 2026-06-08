import { ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { AuthProvider } from '@/features/auth/context/auth-context';
import { AppTheme } from '@/shared/constants/app-theme';

const NomanStopTheme = {
  dark: true,
  colors: {
    primary: AppTheme.primary,
    background: AppTheme.background,
    card: AppTheme.surface,
    text: AppTheme.text,
    border: AppTheme.surfaceBorder,
    notification: AppTheme.primary,
  },
  fonts: {
    regular: { fontFamily: 'System', fontWeight: '400' as const },
    medium: { fontFamily: 'System', fontWeight: '500' as const },
    bold: { fontFamily: 'System', fontWeight: '700' as const },
    heavy: { fontFamily: 'System', fontWeight: '800' as const },
  },
};

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  return (
    <AuthProvider>
      <ThemeProvider value={NomanStopTheme}>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: AppTheme.background },
          }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="auth" />
          <Stack.Screen name="onboarding" />
          <Stack.Screen name="(tabs)" />
        </Stack>
        <StatusBar style="light" />
      </ThemeProvider>
    </AuthProvider>
  );
}
