import { requestJson } from '@/shared/lib/api-client';

export type CompleteOnboardingPayload = {
  username: string;
  interests: string[];
  following: string[];
};

export async function completeOnboardingRequest(payload: CompleteOnboardingPayload) {
  return requestJson('/users/onboarding/complete', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
