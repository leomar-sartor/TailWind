// src/graphql/Auth/types.ts

import type { AuthUserFromApi } from '../../auth/authStore';

export interface AuthPayload {
  success: boolean;
  message: string;
  accessToken: string;
  user: AuthUserFromApi;
}

export interface LoginInput {
  email: string;
  password: string;
}

export type LoginData = {
  login: AuthPayload;
};

export type LoginVars = {
  input: LoginInput;
};

export type RefreshTokenData = {
  refreshToken: AuthPayload;
};

export type LogoutData = {
  logout: {
    success: boolean;
    message: string;
  };
};
