import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

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

// ─── API Client ───────────────────────────────────────────────────────────────

const resolveApiBaseUrl = (): string => {
  const configuredUrl = process.env.EXPO_PUBLIC_API_BASE_URL?.trim();
  if (configuredUrl) return configuredUrl.replace(/\/$/, '');

  const hostUri =
    Constants.expoConfig?.hostUri ??
    (Constants.manifest2 as { extra?: { expoGo?: { debuggerHost?: string } } })
      ?.extra?.expoGo?.debuggerHost;

  if (typeof hostUri === 'string' && hostUri.length > 0) {
    const host = hostUri.split(':')[0];
    return `http://${host}:3000`;
  }

  return 'http://localhost:3000';
};

export const API_BASE_URL = resolveApiBaseUrl();

const STORAGE_KEY = '@nomanstop_user';

async function requestJson<T>(path: string, options: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
  });

  const body = (await response.json().catch(() => ({}))) as
    | Record<string, unknown>
    | undefined;

  if (!response.ok) {
    const message =
      (typeof body?.message === 'string' && body.message) ||
      (typeof body?.error === 'string' && body.error) ||
      `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return body as T;
}

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

          // Check whether onboarding was completed by fetching the profile
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
        // TODO: replace with a real Follow model once the social graph is built
        const bio =
          following.length > 0 ? `Following: ${following.join(', ')}` : undefined;

        await requestJson('/users/profile', {
          method: 'PUT',
          body: JSON.stringify({ username: user.username, interests, bio }),
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
