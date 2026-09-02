import { AxiosError } from 'axios';

export const OTP_RESEND_COOLDOWN_SECONDS = 120;

type OtpPayload = {
  message?: string;
  otp_active?: boolean;
  can_request_new_otp_at?: string;
  expires_in_seconds?: number | string;
  expires_in_minutes?: number | string;
  resend_after_seconds?: number | string;
};

const toPositiveSeconds = (value: unknown) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return 0;
  }

  return Math.ceil(parsed);
};

export const getOtpPayload = (source: unknown): OtpPayload | null => {
  if (!source || typeof source !== 'object') {
    return null;
  }

  if (source instanceof AxiosError) {
    return (source.response?.data as OtpPayload | undefined) ?? null;
  }

  const responseData = (source as { response?: { data?: OtpPayload } }).response
    ?.data;
  if (responseData) {
    return responseData;
  }

  return source as OtpPayload;
};

export const pickOtpCooldownSeconds = (
  source: unknown,
  fallback = OTP_RESEND_COOLDOWN_SECONDS,
) => {
  const data = getOtpPayload(source);
  const cap = (seconds: number) => Math.min(seconds, OTP_RESEND_COOLDOWN_SECONDS);

  const fromExpires = toPositiveSeconds(data?.expires_in_seconds);
  if (fromExpires) {
    return cap(fromExpires);
  }

  const fromResendAfter = toPositiveSeconds(data?.resend_after_seconds);
  if (fromResendAfter) {
    return cap(fromResendAfter);
  }

  if (data?.can_request_new_otp_at) {
    const remaining = Math.ceil(
      (new Date(data.can_request_new_otp_at).getTime() - Date.now()) / 1000,
    );
    if (remaining > 0) {
      return cap(remaining);
    }
  }

  const fromMinutes = toPositiveSeconds(data?.expires_in_minutes);
  if (fromMinutes) {
    return cap(fromMinutes * 60);
  }

  const message = String(data?.message ?? '');
  const minutes = Number(message.match(/(\d+)\s*minute/i)?.[1] ?? 0);
  const seconds = Number(message.match(/(\d+)\s*second/i)?.[1] ?? 0);
  const fromMessage = minutes * 60 + seconds;
  if (fromMessage > 0) {
    return cap(fromMessage);
  }

  return fallback;
};

export const isOtpCooldownError = (error: unknown) => {
  const status =
    error instanceof AxiosError
      ? error.response?.status
      : (error as { response?: { status?: number }; status?: number })?.response
          ?.status ?? (error as { status?: number }).status;
  const data = getOtpPayload(error);
  const message = String(data?.message ?? '').toLowerCase();

  return (
    status === 429 ||
    data?.otp_active === true ||
    message.includes('already been sent') ||
    message.includes('already sent') ||
    message.includes('request a new otp') ||
    message.includes('try again after')
  );
};

export const getOtpCooldownMessage = (source: unknown) => {
  const seconds = pickOtpCooldownSeconds(source);
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;

  if (minutes > 0 && remainder > 0) {
    return `Please wait ${minutes} min ${remainder} sec before requesting a new code.`;
  }

  if (minutes > 0) {
    return `Please wait ${minutes} min before requesting a new code.`;
  }

  return `Please wait ${seconds} sec before requesting a new code.`;
};
