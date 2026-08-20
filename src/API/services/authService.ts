import { apiClient } from '../apiClient';
import { ENDPOINTS } from '../endpoints';
import { clearSession } from '../../Redux/clearSession';
import { store, setAuthSession } from '../../Redux';
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

const normalizeEmail = (email: string) => email.trim();

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

const pickAuthToken = (response: AuthResponse) =>
  response.token ||
  response.access_token ||
  response.data?.token ||
  response.data?.access_token ||
  null;

const saveAuthSession = (response: AuthResponse) => {
  const token = pickAuthToken(response);

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
};

const shouldSaveAuthSession = (response: AuthResponse) =>
  Boolean(pickAuthToken(response));

export const authService = {
  login: async (payload: LoginPayload) => {
    const response = await postAuth<AuthResponse>(ENDPOINTS.AUTH.LOGIN, {
      ...payload,
      email: normalizeEmail(payload.email),
    });

    if (shouldSaveAuthSession(response)) {
      saveAuthSession(response);
    }

    return response;
  },

  register: async (payload: SignUpPayload) => {
    const response = await postAuth<AuthResponse>(ENDPOINTS.AUTH.REGISTER, {
      ...payload,
      email: normalizeEmail(payload.email),
    });

    if (shouldSaveAuthSession(response)) {
      saveAuthSession(response);
    }

    return response;
  },

  verifyEmailOtp: async (payload: VerifyEmailOtpPayload) => {
    const otp = String(payload.otp).replace(/\D/g, '');
    const response = await postAuth<AuthResponse>(
      ENDPOINTS.AUTH.VERIFY_EMAIL_OTP,
      {
        email: normalizeEmail(payload.email),
        otp,
      },
    );

    if (shouldSaveAuthSession(response)) {
      saveAuthSession(response);
    }

    return response;
  },

  resendEmailOtp: (payload: EmailPayload) =>
    postAuth<OtpActionResponse>(ENDPOINTS.AUTH.RESEND_EMAIL_OTP, {
      email: normalizeEmail(payload.email),
    }),

  forgotPassword: (payload: EmailPayload) =>
    postAuth<OtpActionResponse>(ENDPOINTS.AUTH.FORGOT_PASSWORD, {
      email: normalizeEmail(payload.email),
    }),

  verifyResetOtp: (payload: VerifyResetOtpPayload) =>
    postAuth<MessageResponse>(ENDPOINTS.AUTH.VERIFY_RESET_OTP, {
      ...payload,
      email: normalizeEmail(payload.email),
    }),

  setNewPassword: (payload: SetNewPasswordPayload) =>
    postAuth<MessageResponse>(ENDPOINTS.AUTH.SET_NEW_PASSWORD, {
      ...payload,
      email: normalizeEmail(payload.email),
    }),

  changePassword: (payload: ChangePasswordPayload) =>
    postAuth<MessageResponse>(ENDPOINTS.AUTH.CHANGE_PASSWORD, payload),

  logout: async () => {
    try {
      const { status, data } = await apiClient.postEmpty<MessageResponse>(
        ENDPOINTS.AUTH.LOGOUT,
      );

      return { status, ...data };
    } catch (error) {
      console.log('Logout API Error:', error);
      return {
        status: 200,
        message: 'Logged out successfully',
        success: true,
      };
    } finally {
      clearSession();
    }
  },
};
