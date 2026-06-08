import { requestJson } from '@/shared/lib/api-client';

import type { LoginPayload, SignupPayload, UserProfile } from '../types/auth.types';

export async function loginRequest({ username, password }: LoginPayload) {
  return requestJson<{ access_token: string }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
}

export async function registerRequest(payload: SignupPayload) {
  return requestJson('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function fetchUserProfile(username: string) {
  return requestJson<UserProfile>(`/users/${encodeURIComponent(username)}`, {
    method: 'GET',
  });
}

export function isOnboardingComplete(profile: UserProfile): boolean {
  return Array.isArray(profile.interests) && profile.interests.length > 0;
}
