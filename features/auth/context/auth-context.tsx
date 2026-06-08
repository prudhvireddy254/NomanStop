import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { requestJson } from '@/shared/lib/api-client';

// ─── Types ────────────────────────────────────────────────────────────────────

export type AuthUser = {
  username: string;
  token: string;
};

type LoginPayload = {
  username: string;
  password: string;
};

type SignupPayload = {
  username: string;
  password: string;
  email: string;
};

type OnboardingPayload = {
  interests: string[];
  following: string[];
};

export type AuthContextValue = {
  user: AuthUser | null;
  onboardingComplete: boolean;
  loading: boolean;
  /** true while the stored session is being restored from AsyncStorage on startup */
  restoring: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  signup: (payload: SignupPayload) => Promise<void>;
  completeOnboarding: (payload: OnboardingPayload) => Promise<void>;
  logout: () => Promise<void>;
};

const STORAGE_KEY = '@nomanstop_user';

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [loading, setLoading] = useState(false);
  const [restoring, setRestoring] = useState(true);

  // ── Restore session from storage on startup ──────────────────────────────

  useEffect(() => {
    async function restoreSession() {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored) as AuthUser;
          setUser(parsed);

          const profile = await requestJson<{ interests?: string[] }>(
            `/users/${encodeURIComponent(parsed.username)}`,
            { method: 'GET' },
          );
          setOnboardingComplete(
            Array.isArray(profile.interests) && profile.interests.length > 0,
          );
        }
      } catch (err) {
        console.error('[AuthContext] Failed to restore session:', err);
      } finally {
        setRestoring(false);
      }
    }
    void restoreSession();
  }, []);

  // ── Internal helpers ──────────────────────────────────────────────────────

  const persistUser = useCallback(async (authUser: AuthUser) => {
    setUser(authUser);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(authUser));
  }, []);

  const performLogin = useCallback(
    async ({ username, password }: LoginPayload) => {
      const res = await requestJson<{ access_token: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      });

      const authUser: AuthUser = { username, token: res.access_token };
      await persistUser(authUser);

      const profile = await requestJson<{ interests?: string[] }>(
        `/users/${encodeURIComponent(username)}`,
        { method: 'GET' },
      );
      setOnboardingComplete(
        Array.isArray(profile.interests) && profile.interests.length > 0,
      );
    },
    [persistUser],
  );

  // ── Public API ────────────────────────────────────────────────────────────

  const login = useCallback(
    async (payload: LoginPayload) => {
      setLoading(true);
      try {
        await performLogin(payload);
      } finally {
        setLoading(false);
      }
    },
    [performLogin],
  );

  const signup = useCallback(
    async ({ username, password, email }: SignupPayload) => {
      setLoading(true);
      try {
        await requestJson('/auth/register', {
          method: 'POST',
          body: JSON.stringify({ username, password, email }),
        });
        await performLogin({ username, password });
      } finally {
        setLoading(false);
      }
    },
    [performLogin],
  );

  const completeOnboarding = useCallback(
    async ({ interests, following }: OnboardingPayload) => {
      if (!user) throw new Error('Must be logged in to complete onboarding.');

      setLoading(true);
      try {
        await requestJson('/users/onboarding/complete', {
          method: 'POST',
          body: JSON.stringify({
            username: user.username,
            interests,
            following,
          }),
        });
        setOnboardingComplete(true);
      } finally {
        setLoading(false);
      }
    },
    [user],
  );

  const logout = useCallback(async () => {
    setUser(null);
    setOnboardingComplete(false);
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch (err) {
      console.error('[AuthContext] Failed to clear session:', err);
    }
  }, []);

  // ─────────────────────────────────────────────────────────────────────────

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      onboardingComplete,
      loading,
      restoring,
      login,
      signup,
      completeOnboarding,
      logout,
    }),
    [user, onboardingComplete, loading, restoring, login, signup, completeOnboarding, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
}
