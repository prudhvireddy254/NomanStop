import { Redirect, router } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { useAuth } from '@/features/auth/context/auth-context';
import { completeOnboardingRequest } from '@/features/onboarding/api/onboarding.api';
import { ScreenShell } from '@/shared/components/screen-shell';
import { AppTheme } from '@/shared/constants/app-theme';

const INTEREST_OPTIONS = [
  'Technology',
  'Music',
  'Sports',
  'Travel',
  'Movies',
  'Startups',
  'Gaming',
  'Fitness',
];

const FOLLOW_OPTIONS = ['noman', 'alex', 'sara', 'mike', 'jenny', 'john'];

export default function OnboardingScreen() {
  const { user, onboardingComplete, markOnboardingComplete } = useAuth();
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [selectedFollowing, setSelectedFollowing] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!user) return <Redirect href="/auth" />;
  if (onboardingComplete) return <Redirect href="/(tabs)" />;

  const toggleItem = (
    current: string[],
    value: string,
    setter: (next: string[]) => void,
  ) => {
    setter(
      current.includes(value)
        ? current.filter((i) => i !== value)
        : [...current, value],
    );
  };

  const handleFinish = async () => {
    if (selectedInterests.length === 0) {
      setError('Please select at least one interest.');
      return;
    }

    setError('');
    setLoading(true);
    try {
      await completeOnboardingRequest({
        username: user.username,
        interests: selectedInterests,
        following: selectedFollowing,
      });
      markOnboardingComplete();
      router.replace('/(tabs)');
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Could not save onboarding data.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenShell>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Setup your profile</Text>
          <Text style={styles.subtitle}>
            Pick interests and people you want to follow.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Interests</Text>
          <View style={styles.chips}>
            {INTEREST_OPTIONS.map((interest) => {
              const selected = selectedInterests.includes(interest);
              return (
                <Pressable
                  key={interest}
                  onPress={() =>
                    toggleItem(selectedInterests, interest, setSelectedInterests)
                  }
                  style={[styles.chip, selected && styles.chipSelected]}>
                  <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
                    {interest}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Who to follow</Text>
          <View style={styles.chips}>
            {FOLLOW_OPTIONS.map((account) => {
              const selected = selectedFollowing.includes(account);
              return (
                <Pressable
                  key={account}
                  onPress={() =>
                    toggleItem(selectedFollowing, account, setSelectedFollowing)
                  }
                  style={[styles.chip, selected && styles.chipSelected]}>
                  <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
                    @{account}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <Pressable
          style={({ pressed }) => [
            styles.primaryButton,
            pressed && styles.primaryButtonPressed,
            loading && styles.disabledButton,
          ]}
          onPress={handleFinish}
          disabled={loading}>
          {loading ? (
            <ActivityIndicator color={AppTheme.text} size="small" />
          ) : (
            <Text style={styles.primaryButtonText}>Finish setup</Text>
          )}
        </Pressable>
      </ScrollView>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 24,
    gap: 20,
    flexGrow: 1,
    justifyContent: 'center',
    zIndex: 1,
  },
  header: {
    marginBottom: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: AppTheme.text,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: AppTheme.textMuted,
    marginTop: 6,
  },
  section: {
    backgroundColor: AppTheme.surface,
    borderRadius: 20,
    padding: 20,
    gap: 14,
    borderWidth: 1,
    borderColor: AppTheme.surfaceBorder,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: AppTheme.text,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chip: {
    borderWidth: 1,
    borderColor: AppTheme.inputBorder,
    borderRadius: 99,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: AppTheme.input,
  },
  chipSelected: {
    borderColor: AppTheme.primary,
    backgroundColor: AppTheme.primary,
  },
  chipText: {
    color: AppTheme.textMuted,
    fontWeight: '600',
    fontSize: 14,
  },
  chipTextSelected: {
    color: AppTheme.text,
  },
  primaryButton: {
    backgroundColor: AppTheme.primary,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    marginTop: 10,
  },
  primaryButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  disabledButton: {
    backgroundColor: '#1E293B',
  },
  primaryButtonText: {
    color: AppTheme.text,
    fontWeight: '700',
    fontSize: 16,
  },
  errorContainer: {
    backgroundColor: AppTheme.errorBg,
    borderWidth: 1,
    borderColor: AppTheme.errorBorder,
    borderRadius: 12,
    padding: 12,
  },
  errorText: {
    color: AppTheme.error,
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
});
