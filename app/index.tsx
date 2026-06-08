import { Redirect } from 'expo-router';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { useAuth } from '@/features/auth/context/auth-context';
import { AppTheme } from '@/shared/constants/app-theme';

export default function IndexScreen() {
  const { user, onboardingComplete, restoring } = useAuth();

  if (restoring) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={AppTheme.primary} />
        <Text style={styles.loaderText}>Loading NomanStop...</Text>
      </View>
    );
  }

  if (!user) return <Redirect href="/auth" />;
  if (!onboardingComplete) return <Redirect href="/onboarding" />;
  return <Redirect href="/(tabs)" />;
}

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: AppTheme.background,
    gap: 16,
  },
  loaderText: {
    color: AppTheme.textMuted,
    fontSize: 15,
    fontWeight: '500',
  },
});
