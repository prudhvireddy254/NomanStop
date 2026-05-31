import { Redirect, router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '@/context/auth-context';

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
  const { user, onboardingComplete, completeOnboarding, loading } = useAuth();
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [selectedFollowing, setSelectedFollowing] = useState<string[]>([]);
  const [error, setError] = useState('');

  if (!user) {
    return <Redirect href="/auth" />;
  }

  if (onboardingComplete) {
    return <Redirect href="/(tabs)" />;
  }

  const toggleSelection = (
    current: string[],
    value: string,
    setter: (next: string[]) => void,
  ) => {
    if (current.includes(value)) {
      setter(current.filter((item) => item !== value));
      return;
    }
    setter([...current, value]);
  };

  const saveOnboarding = async () => {
    if (selectedInterests.length === 0) {
      setError('Please select at least one interest.');
      return;
    }

    setError('');
    try {
      await completeOnboarding({
        interests: selectedInterests,
        following: selectedFollowing,
      });
      router.replace('/(tabs)');
    } catch (requestError) {
      const message =
        requestError instanceof Error ? requestError.message : 'Could not save onboarding data.';
      setError(message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Setup your profile</Text>
        <Text style={styles.subtitle}>Pick interests and people you want to follow.</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Interests</Text>
          <View style={styles.chips}>
            {INTEREST_OPTIONS.map((interest) => {
              const selected = selectedInterests.includes(interest);
              return (
                <Pressable
                  key={interest}
                  onPress={() => toggleSelection(selectedInterests, interest, setSelectedInterests)}
                  style={[styles.chip, selected && styles.chipSelected]}>
                  <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{interest}</Text>
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
                  onPress={() => toggleSelection(selectedFollowing, account, setSelectedFollowing)}
                  style={[styles.chip, selected && styles.chipSelected]}>
                  <Text style={[styles.chipText, selected && styles.chipTextSelected]}>@{account}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <Pressable style={styles.primaryButton} onPress={saveOnboarding} disabled={loading}>
          <Text style={styles.primaryButtonText}>{loading ? 'Saving...' : 'Finish setup'}</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    padding: 20,
    gap: 16,
  },
  title: {
    marginTop: 8,
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
  },
  subtitle: {
    fontSize: 15,
    color: '#4B5563',
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    gap: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
  },
  chipSelected: {
    borderColor: '#2563EB',
    backgroundColor: '#DBEAFE',
  },
  chipText: {
    color: '#334155',
    fontWeight: '500',
  },
  chipTextSelected: {
    color: '#1D4ED8',
  },
  primaryButton: {
    backgroundColor: '#2563EB',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    marginTop: 6,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 13,
  },
});
