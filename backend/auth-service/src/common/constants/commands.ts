/**
 * TCP command names — must match api-gateway/src/common/constants/commands.ts
 */
export const Commands = {
  REGISTER: 'register',
  LOGIN: 'login',
  RESET_PASSWORD: 'reset-password',
  GET_PROFILE: 'get-profile',
  UPDATE_PROFILE: 'update-profile',
  COMPLETE_ONBOARDING: 'complete-onboarding',
} as const;
