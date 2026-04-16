import Constants from 'expo-constants';
import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

type AuthUser = {
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

type AuthContextValue = {
  user: AuthUser | null;
  onboardingComplete: boolean;
  loading: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  signup: (payload: SignupPayload) => Promise<void>;
  completeOnboarding: (payload: OnboardingPayload) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const resolveApiBaseUrl = () => {
  const configuredUrl = process.env.EXPO_PUBLIC_API_BASE_URL?.trim();
  if (configuredUrl) {
    return configuredUrl.replace(/\/$/, '');
  }

  const hostUri = Constants.expoConfig?.hostUri ?? Constants.manifest2?.extra?.expoGo?.debuggerHost;
  if (typeof hostUri === 'string' && hostUri.length > 0) {
    const host = hostUri.split(':')[0];
    return `http://${host}:3000`;
  }

  return 'http://localhost:3000';
};

const API_BASE_URL = resolveApiBaseUrl();

const requestJson = async <T,>(path: string, options: RequestInit): Promise<T> => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
  });

  const responseBody = (await response.json().catch(() => ({}))) as
    | Record<string, unknown>
    | undefined;

  if (!response.ok) {
    const message =
      (typeof responseBody?.message === 'string' && responseBody.message) ||
      (typeof responseBody?.error === 'string' && responseBody.error) ||
      `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return responseBody as T;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [loading, setLoading] = useState(false);

  const performLogin = useCallback(async ({ username, password }: LoginPayload) => {
    const loginResponse = await requestJson<{ access_token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });

    setUser({ username, token: loginResponse.access_token });

    const profile = await requestJson<{ interests?: string[]; error?: string }>(
      `/users/${encodeURIComponent(username)}`,
      { method: 'GET' },
    );
    const profileInterests = Array.isArray(profile.interests) ? profile.interests : [];
    setOnboardingComplete(profileInterests.length > 0);
  }, []);

  const login = useCallback(async ({ username, password }: LoginPayload) => {
    setLoading(true);
    try {
      await performLogin({ username, password });
    } finally {
      setLoading(false);
    }
  }, [performLogin]);

  const signup = useCallback(async ({ username, password, email }: SignupPayload) => {
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
  }, [performLogin]);

  const completeOnboarding = useCallback(async ({ interests, following }: OnboardingPayload) => {
    if (!user) {
      throw new Error('You must be logged in to complete onboarding.');
    }

    setLoading(true);
    try {
      const bio = following.length > 0 ? `Following: ${following.join(', ')}` : undefined;

      await requestJson('/users/profile', {
        method: 'PUT',
        body: JSON.stringify({
          username: user.username,
          interests,
          bio,
        }),
      });

      setOnboardingComplete(true);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const logout = useCallback(() => {
    setUser(null);
    setOnboardingComplete(false);
  }, []);

  const value = useMemo(
    () => ({ user, onboardingComplete, loading, login, signup, completeOnboarding, logout }),
    [user, onboardingComplete, loading, login, signup, completeOnboarding, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
