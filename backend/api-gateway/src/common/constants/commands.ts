/**
 * TCP command names — the contract between api-gateway and auth-service.
 * Gateway sends { cmd: COMMAND }, auth-service listens with @MessagePattern({ cmd: COMMAND }).
 */
export const Commands = {
  REGISTER: 'register',
  LOGIN: 'login',
  RESET_PASSWORD: 'reset-password',
  GET_PROFILE: 'get-profile',
  UPDATE_PROFILE: 'update-profile',
  COMPLETE_ONBOARDING: 'complete-onboarding',
} as const;

export type Command = (typeof Commands)[keyof typeof Commands];
