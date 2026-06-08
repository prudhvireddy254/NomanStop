export interface UpdateProfilePayload {
  username?: string;
  firstName?: string;
  lastName?: string;
  age?: number;
  phoneNumber?: string;
  interests?: string[];
  bio?: string;
  location?: string;
  gender?: string;
}

export interface CompleteOnboardingPayload {
  username?: string;
  interests?: string[];
  following?: string[];
}
