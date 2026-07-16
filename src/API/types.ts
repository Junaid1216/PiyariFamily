export type User = {
  id: number;
  name: string;
  email: string;
  phone: string;
  is_verified?: boolean;
};

export type AuthResponse = {
  success?: boolean | number;
  message: string;
  user: User;
  token?: string;
  access_token?: string;
  account_status?: 'active' | 'inactive';
  is_deactivated?: boolean;
};

export type ApiResult<T> = {
  status: number;
  data: T;
};

export const isSuccessStatus = (status: number) =>
  status === 200 || status === 201;

export type MessageResponse = {
  success: boolean;
  message: string;
};

export type OtpActionResponse = MessageResponse & {
  resend_after_seconds?: number;
};

export type ApiErrorResponse = {
  success?: boolean;
  message?: string;
  errors?: Record<string, string[]>;
};
