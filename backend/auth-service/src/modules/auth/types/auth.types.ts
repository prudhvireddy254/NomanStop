export interface RegisterPayload {
  username?: string;
  password?: string;
  email?: string;
}

export interface LoginPayload {
  username?: string;
  password?: string;
}

export interface ResetPasswordPayload {
  username?: string;
  newPassword?: string;
}
