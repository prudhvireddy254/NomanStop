import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useAuth } from '@/features/auth/context/auth-context';
import { ScreenShell } from '@/shared/components/screen-shell';
import { AppTheme } from '@/shared/constants/app-theme';

export default function HomeScreen() {
  const { user, logout } = useAuth();

  return (
    <ScreenShell>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.greeting}>Welcome back</Text>
          <Text style={styles.username}>@{user?.username}</Text>
        </View>

        <View style={styles.feedCard}>
          <Text style={styles.feedTitle}>Your feed</Text>
          <Text style={styles.feedBody}>
            You are all set. Posts, followers, and notifications will show up here
            as we build out the social features.
          </Text>
        </View>

        <View style={styles.feedCard}>
          <Text style={styles.feedTitle}>What&apos;s next</Text>
          <Text style={styles.feedItem}>• Real posts and a home timeline</Text>
          <Text style={styles.feedItem}>• Profile pages with photos</Text>
          <Text style={styles.feedItem}>• Follow suggestions and search</Text>
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.logoutButton,
            pressed && styles.logoutButtonPressed,
          ]}
          onPress={() => void logout()}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </Pressable>
      </ScrollView>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 20,
    paddingBottom: 32,
    gap: 16,
  },
  header: {
    gap: 4,
    zIndex: 1,
  },
  greeting: {
    fontSize: 15,
    color: AppTheme.textMuted,
    fontWeight: '500',
  },
  username: {
    fontSize: 28,
    fontWeight: '800',
    color: AppTheme.text,
    letterSpacing: -0.5,
  },
  feedCard: {
    backgroundColor: AppTheme.surface,
    borderRadius: 20,
    padding: 20,
    gap: 10,
    borderWidth: 1,
    borderColor: AppTheme.surfaceBorder,
    zIndex: 1,
  },
  feedTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: AppTheme.text,
  },
  feedBody: {
    fontSize: 15,
    color: AppTheme.textMuted,
    lineHeight: 22,
  },
  feedItem: {
    fontSize: 14,
    color: AppTheme.textMuted,
    lineHeight: 22,
  },
  logoutButton: {
    marginTop: 8,
    backgroundColor: AppTheme.danger,
    borderRadius: 12,
    alignItems: 'center',
    paddingVertical: 14,
    zIndex: 1,
  },
  logoutButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  logoutButtonText: {
    color: AppTheme.text,
    fontSize: 16,
    fontWeight: '700',
  },
});
