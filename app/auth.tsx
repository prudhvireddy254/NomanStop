import { Redirect } from 'expo-router';
import { useState } from 'react';
import { Pressable, SafeAreaView, StyleSheet, Text, TextInput, View } from 'react-native';

import { useAuth } from '@/context/auth-context';

export default function AuthScreen() {
  const { user, onboardingComplete, login, signup, loading } = useAuth();
  const [isSignup, setIsSignup] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  if (user && onboardingComplete) {
    return <Redirect href="/(tabs)" />;
  }
  if (user && !onboardingComplete) {
    return <Redirect href="/onboarding" />;
  }

  const handleSubmit = async () => {
    const trimmedUsername = username.trim();
    const trimmedPassword = password.trim();
    const trimmedEmail = email.trim();

    if (!trimmedUsername || !trimmedPassword) {
      setError('Username and password are required.');
      return;
    }
    if (isSignup && !trimmedEmail) {
      setError('Email is required for signup.');
      return;
    }

    setError('');
    try {
      if (isSignup) {
        await signup({
          username: trimmedUsername,
          password: trimmedPassword,
          email: trimmedEmail,
        });
      } else {
        await login({
          username: trimmedUsername,
          password: trimmedPassword,
        });
      }
    } catch (requestError) {
      const message =
        requestError instanceof Error ? requestError.message : 'Unable to continue right now.';
      setError(message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>NomanStop</Text>
        <Text style={styles.subtitle}>
          {isSignup ? 'Create your account' : 'Login to continue'}
        </Text>

        {isSignup ? (
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholderTextColor="#6B7280"
          />
        ) : null}

        <TextInput
          style={styles.input}
          placeholder="Username"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
          placeholderTextColor="#6B7280"
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholderTextColor="#6B7280"
        />

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <Pressable style={styles.primaryButton} onPress={handleSubmit} disabled={loading}>
          <Text style={styles.primaryButtonText}>
            {loading ? 'Please wait...' : isSignup ? 'Create account' : 'Login'}
          </Text>
        </Pressable>

        <Pressable onPress={() => setIsSignup((prev) => !prev)} disabled={loading}>
          <Text style={styles.secondaryText}>
            {isSignup ? 'Already have an account? Login' : 'New user? Create account'}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    gap: 12,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
  },
  subtitle: {
    fontSize: 15,
    color: '#4B5563',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
  },
  primaryButton: {
    backgroundColor: '#2563EB',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    marginTop: 6,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryText: {
    textAlign: 'center',
    color: '#2563EB',
    marginTop: 4,
    fontSize: 14,
    fontWeight: '500',
  },
  errorText: {
    color: '#DC2626',
    fontSize: 13,
  },
});
