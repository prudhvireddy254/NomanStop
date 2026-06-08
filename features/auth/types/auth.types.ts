export type AuthUser = {
  username: string;
  token: string;
};

export type LoginPayload = {
  username: string;
  password: string;
};

export type SignupPayload = {
  username: string;
  password: string;
  email: string;
};

export type UserProfile = {
  interests?: string[];
};

export type AuthContextValue = {
  user: AuthUser | null;
  onboardingComplete: boolean;
  loading: boolean;
  restoring: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  signup: (payload: SignupPayload) => Promise<void>;
  logout: () => Promise<void>;
  markOnboardingComplete: () => void;
};
