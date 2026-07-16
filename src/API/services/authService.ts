import { apiClient } from '../apiClient';
import { ENDPOINTS } from '../endpoints';
import { clearAuth, clearProfile, clearHomeMatches, clearShortlist, clearReferral, store, setAuthSession } from '../../Redux';
import { accountStorage } from '../accountStorage';
import { saveProfileCache } from '../mappers/profileMapper';
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

const resolveAccountStatus = (
  response: Pick<AuthResponse, 'account_status' | 'is_deactivated'>,
) => {
  if (response.account_status === 'inactive' || response.is_deactivated) {
    return 'inactive' as const;
  }

  if (response.account_status === 'active') {
    return 'active' as const;
  }

  return 'active' as const;
};

const saveAuthSession = (response: AuthResponse) => {
  const token = response.token ?? response.access_token ?? null;

  store.dispatch(
    setAuthSession({
      user: response.user ?? null,
      accessToken: token,
    }),
  );

  if (response.user) {
    saveProfileCache(response.user);
  }

  accountStorage.setStatus(resolveAccountStatus(response));

  console.log('Redux after login:', store.getState());
};

const shouldSaveAuthSession = (response: {
  status?: number;
  success?: boolean | number;
  token?: string;
  access_token?: string;
}) =>
  response.status == 200 ||
  response.success === true ||
  response.success == 200 ||
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
      store.dispatch(clearAuth());
      store.dispatch(clearProfile());
      store.dispatch(clearHomeMatches());
      store.dispatch(clearShortlist());
      store.dispatch(clearReferral());
    }
  },
};
