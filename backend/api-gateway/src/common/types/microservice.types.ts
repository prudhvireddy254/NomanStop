export interface MicroserviceError {
  error: string;
}

export interface RegisterBody {
  username: string;
  password: string;
  email: string;
}

export interface LoginBody {
  username: string;
  password: string;
}

export interface ResetPasswordBody {
  username: string;
  newPassword: string;
}

export interface UpdateProfileBody {
  username: string;
  firstName?: string;
  lastName?: string;
  age?: number;
  phoneNumber?: string;
  interests?: string[];
  bio?: string;
  location?: string;
  gender?: string;
}

export interface CompleteOnboardingBody {
  username: string;
  interests: string[];
  following?: string[];
}
