import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  fetchUserProfile,
  isOnboardingComplete,
  loginRequest,
  registerRequest,
} from '@/features/auth/api/auth.api';
import type {
  AuthContextValue,
  AuthUser,
  LoginPayload,
  SignupPayload,
} from '@/features/auth/types/auth.types';

const STORAGE_KEY = '@nomanstop_user';

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [loading, setLoading] = useState(false);
  const [restoring, setRestoring] = useState(true);

  useEffect(() => {
    async function restoreSession() {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (!stored) return;

        const parsed = JSON.parse(stored) as AuthUser;
        setUser(parsed);

        const profile = await fetchUserProfile(parsed.username);
        setOnboardingComplete(isOnboardingComplete(profile));
      } catch (err) {
        console.error('[Auth] Failed to restore session:', err);
      } finally {
        setRestoring(false);
      }
    }

    void restoreSession();
  }, []);

  const persistUser = useCallback(async (authUser: AuthUser) => {
    setUser(authUser);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(authUser));
  }, []);

  const performLogin = useCallback(
    async ({ username, password }: LoginPayload) => {
      const res = await loginRequest({ username, password });
      const authUser: AuthUser = { username, token: res.access_token };
      await persistUser(authUser);

      const profile = await fetchUserProfile(username);
      setOnboardingComplete(isOnboardingComplete(profile));
    },
    [persistUser],
  );

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
    async (payload: SignupPayload) => {
      setLoading(true);
      try {
        await registerRequest(payload);
        await performLogin({ username: payload.username, password: payload.password });
      } finally {
        setLoading(false);
      }
    },
    [performLogin],
  );

  const logout = useCallback(async () => {
    setUser(null);
    setOnboardingComplete(false);
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch (err) {
      console.error('[Auth] Failed to clear session:', err);
    }
  }, []);

  const markOnboardingComplete = useCallback(() => {
    setOnboardingComplete(true);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      onboardingComplete,
      loading,
      restoring,
      login,
      signup,
      logout,
      markOnboardingComplete,
    }),
    [user, onboardingComplete, loading, restoring, login, signup, logout, markOnboardingComplete],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
}
