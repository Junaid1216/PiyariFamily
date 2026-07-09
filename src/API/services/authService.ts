import { apiClient } from '../apiClient';
import { ENDPOINTS } from '../endpoints';
import { profileStorage } from '../profileStorage';
import { tokenStorage } from '../tokenStorage';
import { userStorage } from '../userStorage';
import type { AuthResponse, MessageResponse, OtpActionResponse } from '../types';

export type LoginPayload = {
  email: string;
  password: string;
};

export type SignUpPayload = {
  name: string;
  email: string;
  phone: string;
  password: string;
  password_confirmation: string;
};

export type VerifyEmailOtpPayload = {
  email: string;
  otp: string;
};

export type EmailPayload = {
  email: string;
};

export type VerifyResetOtpPayload = {
  email: string;
  otp: string;
};

export type SetNewPasswordPayload = {
  email: string;
  password: string;
};

export type ChangePasswordPayload = {
  current_password: string;
  password: string;
};

const postAuth = async <T>(
  endpoint: string,
  payload: Record<string, string | number>,
) => {
  const { status, data } = await apiClient.postForm<T>(endpoint, payload);
  return { status, ...data };
};

const saveAuthSession = (response: AuthResponse) => {
  if (response.user) {
    userStorage.setUser(response.user);
  }

  const token = response.token ?? response.access_token;

  if (token) {
    tokenStorage.setAccessToken(token);
  }
};

const shouldSaveAuthSession = (response: {
  status?: number;
  success?: boolean;
  token?: string;
  access_token?: string;
}) =>
  response.status == 200 ||
  response.success === true ||
  Boolean(response.token || response.access_token);

export const authService = {
  login: async (payload: LoginPayload) => {
    const response = await postAuth<AuthResponse>(
      ENDPOINTS.AUTH.LOGIN,
      payload,
    );

    if (shouldSaveAuthSession(response)) {
      saveAuthSession(response);
    }

    return response;
  },

  register: async (payload: SignUpPayload) => {
    const response = await postAuth<AuthResponse>(
      ENDPOINTS.AUTH.REGISTER,
      payload,
    );

    if (shouldSaveAuthSession(response)) {
      saveAuthSession(response);
    }

    return response;
  },

  verifyEmailOtp: async (payload: VerifyEmailOtpPayload) => {
    const response = await postAuth<AuthResponse>(
      ENDPOINTS.AUTH.VERIFY_EMAIL_OTP,
      payload,
    );

    if (shouldSaveAuthSession(response)) {
      saveAuthSession(response);
    }

    return response;
  },

  resendEmailOtp: (payload: EmailPayload) =>
    postAuth<OtpActionResponse>(ENDPOINTS.AUTH.RESEND_EMAIL_OTP, payload),

  forgotPassword: (payload: EmailPayload) =>
    postAuth<OtpActionResponse>(ENDPOINTS.AUTH.FORGOT_PASSWORD, payload),

  verifyResetOtp: (payload: VerifyResetOtpPayload) =>
    postAuth<MessageResponse>(ENDPOINTS.AUTH.VERIFY_RESET_OTP, payload),

  setNewPassword: (payload: SetNewPasswordPayload) =>
    postAuth<MessageResponse>(ENDPOINTS.AUTH.SET_NEW_PASSWORD, payload),

  changePassword: (payload: ChangePasswordPayload) =>
    postAuth<MessageResponse>(ENDPOINTS.AUTH.CHANGE_PASSWORD, payload),

  logout: async () => {
    try {
      const { status, data } = await apiClient.postForm<MessageResponse>(
        ENDPOINTS.AUTH.LOGOUT,
        {},
      );

      return { status, ...data };
    } finally {
      tokenStorage.clear();
      userStorage.clear();
      profileStorage.clear();
    }
  },
};
