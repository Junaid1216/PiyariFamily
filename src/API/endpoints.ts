export const ENDPOINTS = {
  AUTH: {
    LOGIN: '/login',
    REGISTER: '/register',
    VERIFY_EMAIL_OTP: '/verify-email-otp',
    RESEND_EMAIL_OTP: '/resend-email-otp',
    FORGOT_PASSWORD: '/forgot-password',
    VERIFY_RESET_OTP: '/verify-reset-otp',
    SET_NEW_PASSWORD: '/set-new-password',
    CHANGE_PASSWORD: '/change-password',
    LOGOUT: '/logout',
  },
  COUNTRIES: '/countries',
  PROFILE: '/profile',
  PROFILE_UPDATE: '/profile/update',
} as const;
