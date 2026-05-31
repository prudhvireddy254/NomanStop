import { Redirect } from 'expo-router';
import { useState } from 'react';
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '@/context/auth-context';

export default function AuthScreen() {
  const { user, onboardingComplete, login, signup, loading } = useAuth();
  const [isSignup, setIsSignup] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const [focusEmail, setFocusEmail] = useState(false);
  const [focusUsername, setFocusUsername] = useState(false);
  const [focusPassword, setFocusPassword] = useState(false);

  const [focusEmail, setFocusEmail] = useState(false);
  const [focusUsername, setFocusUsername] = useState(false);
  const [focusPassword, setFocusPassword] = useState(false);

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
      {/* Decorative Glow Orbs */}
      <View style={styles.orb1} pointerEvents="none" />
      <View style={styles.orb2} pointerEvents="none" />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>
              Noman<Text style={styles.logoHighlight}>Stop</Text>
            </Text>
            <Text style={styles.subtitle}>
              {isSignup ? 'Create your account to join' : 'Welcome back! Please login'}
            </Text>
          </View>

          <View style={styles.form}>
            {isSignup && (
              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>Email</Text>
                <TextInput
                  style={[styles.input, focusEmail && styles.inputFocused]}
                  placeholder="name@example.com"
                  value={email}
                  onChangeText={setEmail}
                  onFocus={() => setFocusEmail(true)}
                  onBlur={() => setFocusEmail(false)}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  placeholderTextColor="#64748B"
                  editable={!loading}
                />
              </View>
            )}
          <View style={styles.form}>
            {isSignup && (
              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>Email</Text>
                <TextInput
                  style={[styles.input, focusEmail && styles.inputFocused]}
                  placeholder="name@example.com"
                  value={email}
                  onChangeText={setEmail}
                  onFocus={() => setFocusEmail(true)}
                  onBlur={() => setFocusEmail(false)}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  placeholderTextColor="#64748B"
                  editable={!loading}
                />
              </View>
            )}

            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Username</Text>
              <TextInput
                style={[styles.input, focusUsername && styles.inputFocused]}
                placeholder="username"
                value={username}
                onChangeText={setUsername}
                onFocus={() => setFocusUsername(true)}
                onBlur={() => setFocusUsername(false)}
                autoCapitalize="none"
                placeholderTextColor="#64748B"
                editable={!loading}
              />
            </View>
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Username</Text>
              <TextInput
                style={[styles.input, focusUsername && styles.inputFocused]}
                placeholder="username"
                value={username}
                onChangeText={setUsername}
                onFocus={() => setFocusUsername(true)}
                onBlur={() => setFocusUsername(false)}
                autoCapitalize="none"
                placeholderTextColor="#64748B"
                editable={!loading}
              />
            </View>

            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Password</Text>
              <TextInput
                style={[styles.input, focusPassword && styles.inputFocused]}
                placeholder="••••••••"
                value={password}
                onChangeText={setPassword}
                onFocus={() => setFocusPassword(true)}
                onBlur={() => setFocusPassword(false)}
                secureTextEntry
                placeholderTextColor="#64748B"
                editable={!loading}
              />
            </View>

            {error ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Password</Text>
              <TextInput
                style={[styles.input, focusPassword && styles.inputFocused]}
                placeholder="••••••••"
                value={password}
                onChangeText={setPassword}
                onFocus={() => setFocusPassword(true)}
                onBlur={() => setFocusPassword(false)}
                secureTextEntry
                placeholderTextColor="#64748B"
                editable={!loading}
              />
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
              onPress={handleSubmit}
              disabled={loading}>
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.primaryButtonText}>
                  {isSignup ? 'Create account' : 'Login'}
                </Text>
              )}
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && styles.primaryButtonPressed,
                loading && styles.disabledButton,
              ]}
              onPress={handleSubmit}
              disabled={loading}>
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.primaryButtonText}>
                  {isSignup ? 'Create account' : 'Login'}
                </Text>
              )}
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.secondaryButton,
                pressed && styles.secondaryButtonPressed,
              ]}
              onPress={() => {
                setError('');
                setIsSignup((prev) => !prev);
              }}
              disabled={loading}>
              <Text style={styles.secondaryText}>
                {isSignup ? 'Already have an account? Login' : "Don't have an account? Sign Up"}
              </Text>
            </Pressable>
          </View>
        </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0F19',
    justifyContent: 'center',
  },
  keyboardView: {
    flex: 1,
    justifyContent: 'center',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
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
  card: {
    backgroundColor: '#161D30',
    borderRadius: 24,
    padding: 24,
    backgroundColor: '#161D30',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#232D45',
    zIndex: 1,
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 28,
  },
  logoText: {
    fontSize: 36,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -1,
  },
  logoHighlight: {
    color: '#3B82F6',
  logoContainer: {
    alignItems: 'center',
    marginBottom: 28,
  },
  logoText: {
    fontSize: 36,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -1,
  },
  logoHighlight: {
    color: '#3B82F6',
  },
  subtitle: {
    fontSize: 15,
    color: '#94A3B8',
    marginTop: 6,
    textAlign: 'center',
  },
  form: {
    gap: 16,
  },
  inputWrapper: {
    gap: 6,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#94A3B8',
    marginLeft: 4,
    color: '#94A3B8',
    marginTop: 6,
    textAlign: 'center',
  },
  form: {
    gap: 16,
  },
  inputWrapper: {
    gap: 6,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#94A3B8',
    marginLeft: 4,
  },
  input: {
    backgroundColor: '#1F2942',
    backgroundColor: '#1F2942',
    borderWidth: 1,
    borderColor: '#2E3D5E',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderColor: '#2E3D5E',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#FFFFFF',
  },
  inputFocused: {
    borderColor: '#3B82F6',
    backgroundColor: '#232F4D',
    color: '#FFFFFF',
  },
  inputFocused: {
    borderColor: '#3B82F6',
    backgroundColor: '#232F4D',
  },
  primaryButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    marginTop: 8,
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
    paddingVertical: 15,
    marginTop: 8,
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
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    paddingVertical: 8,
    alignItems: 'center',
  },
  secondaryButtonPressed: {
    opacity: 0.7,
  },
  secondaryText: {
    color: '#3B82F6',
    fontSize: 15,
    fontWeight: '700',
  },
  secondaryButton: {
    paddingVertical: 8,
    alignItems: 'center',
  },
  secondaryButtonPressed: {
    opacity: 0.7,
  },
  secondaryText: {
    color: '#3B82F6',
    fontSize: 15,
    fontWeight: '600',
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
    textAlign: 'center',
  },
});
