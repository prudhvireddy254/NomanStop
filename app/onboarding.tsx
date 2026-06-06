import { Redirect, router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
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
      <View style={styles.orb1} pointerEvents="none" />
      <View style={styles.orb2} pointerEvents="none" />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Setup your profile</Text>
          <Text style={styles.subtitle}>Pick interests and people you want to follow.</Text>
        </View>

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
          onPress={saveOnboarding}
          disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.primaryButtonText}>Finish setup</Text>
          )}
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0F19',
  },
  orb1: {
    position: 'absolute',
    top: -50,
    left: -50,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    zIndex: 0,
  },
  orb2: {
    position: 'absolute',
    bottom: -80,
    right: -80,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(99, 102, 241, 0.12)',
    zIndex: 0,
  },
  content: {
    padding: 24,
    gap: 20,
    flexGrow: 1,
    justifyContent: 'center',
  },
  header: {
    marginBottom: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#94A3B8',
    marginTop: 6,
  },
  section: {
    backgroundColor: '#161D30',
    borderRadius: 20,
    padding: 20,
    gap: 14,
    borderWidth: 1,
    borderColor: '#232D45',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chip: {
    borderWidth: 1,
    borderColor: '#2E3D5E',
    borderRadius: 99,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#1F2942',
  },
  chipSelected: {
    borderColor: '#3B82F6',
    backgroundColor: '#3B82F6',
    shadowColor: '#3B82F6',
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 2,
  },
  chipText: {
    color: '#94A3B8',
    fontWeight: '600',
    fontSize: 14,
  },
  chipTextSelected: {
    color: '#FFFFFF',
  },
  primaryButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    marginTop: 10,
    shadowColor: '#3B82F6',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  disabledButton: {
    backgroundColor: '#1E293B',
    shadowOpacity: 0,
    elevation: 0,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
  errorContainer: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
    borderRadius: 12,
    padding: 12,
  },
  errorText: {
    color: '#F87171',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
});
