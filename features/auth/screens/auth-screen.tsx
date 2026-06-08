import { Redirect, router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { useAuth } from '@/features/auth/context/auth-context';
import { ScreenShell } from '@/shared/components/screen-shell';
import { AppTheme } from '@/shared/constants/app-theme';

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

  useEffect(() => {
    if (!user) return;
    if (onboardingComplete) {
      router.replace('/(tabs)');
    } else {
      router.replace('/onboarding');
    }
  }, [user, onboardingComplete]);

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
        await signup({ username: trimmedUsername, password: trimmedPassword, email: trimmedEmail });
      } else {
        await login({ username: trimmedUsername, password: trimmedPassword });
      }
    } catch (requestError) {
      const message =
        requestError instanceof Error ? requestError.message : 'Unable to connect. Is the backend running?';
      setError(message);
    }
  };

  return (
    <ScreenShell>
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
                    placeholderTextColor={AppTheme.textPlaceholder}
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
                  placeholderTextColor={AppTheme.textPlaceholder}
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
                  placeholderTextColor={AppTheme.textPlaceholder}
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
                  <ActivityIndicator color={AppTheme.text} size="small" />
                ) : (
                  <Text style={styles.primaryButtonText}>
                    {isSignup ? 'Create account' : 'Login'}
                  </Text>
                )}
              </Pressable>

              <Pressable
                style={({ pressed }) => [styles.secondaryButton, pressed && styles.secondaryButtonPressed]}
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
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
    zIndex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  card: {
    backgroundColor: AppTheme.surface,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: AppTheme.surfaceBorder,
    width: '100%',
    maxWidth: 420,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 28,
  },
  logoText: {
    fontSize: 36,
    fontWeight: '800',
    color: AppTheme.text,
    letterSpacing: -1,
  },
  logoHighlight: {
    color: AppTheme.primary,
  },
  subtitle: {
    fontSize: 15,
    color: AppTheme.textMuted,
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
    color: AppTheme.textMuted,
    marginLeft: 4,
  },
  input: {
    backgroundColor: AppTheme.input,
    borderWidth: 1,
    borderColor: AppTheme.inputBorder,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: AppTheme.text,
  },
  inputFocused: {
    borderColor: AppTheme.primary,
    backgroundColor: AppTheme.inputFocused,
  },
  primaryButton: {
    backgroundColor: AppTheme.primary,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    marginTop: 8,
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
    color: AppTheme.primary,
    fontSize: 15,
    fontWeight: '600',
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
