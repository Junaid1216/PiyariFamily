import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import { API_CONFIG } from './config';
import { ENDPOINTS } from './endpoints';
import { toFormData, type FormValue } from './formData';
import { tokenStorage } from './tokenStorage';
import type { ApiErrorResponse, ApiResult } from './types';

const PUBLIC_AUTH_PATHS = [
  ENDPOINTS.AUTH.LOGIN,
  ENDPOINTS.AUTH.REGISTER,
  ENDPOINTS.AUTH.VERIFY_EMAIL_OTP,
  ENDPOINTS.AUTH.RESEND_EMAIL_OTP,
  ENDPOINTS.AUTH.FORGOT_PASSWORD,
  ENDPOINTS.AUTH.VERIFY_RESET_OTP,
  ENDPOINTS.AUTH.SET_NEW_PASSWORD,
];

const isPublicAuthRequest = (url?: string) => {
  if (!url) {
    return false;
  }

  const path = url.split('?')[0];
  return PUBLIC_AUTH_PATHS.some(
    endpoint => path === endpoint || path.endsWith(endpoint),
  );
};

const axiosInstance = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    Accept: 'application/json',
  },
});

axiosInstance.interceptors.request.use(config => {
  if (isPublicAuthRequest(config.url)) {
    if (config.headers) {
      delete config.headers.Authorization;
      delete config.headers.authorization;
    }
    return config;
  }

  const token = tokenStorage.getAccessToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

axiosInstance.interceptors.response.use(
  response => response,
  (error: AxiosError<ApiErrorResponse>) => {
    const skipTokenClear = Boolean((error.config as { skipTokenClear?: boolean } | undefined)?.skipTokenClear);

    if (error.response?.status === 401 && !skipTokenClear) {
      tokenStorage.clear();
    }

    return Promise.reject(error);
  },
);

export const apiClient = {
  postForm: <T>(
    url: string,
    data: Record<string, FormValue>,
    config?: AxiosRequestConfig,
  ): Promise<ApiResult<T>> =>
    axiosInstance
      .post<T>(url, toFormData(data), config)
      .then(response => ({
        status: response.status,
        data: response.data,
      })),

  postEmpty: <T>(
    url: string,
    config?: AxiosRequestConfig,
  ): Promise<ApiResult<T>> =>
    axiosInstance.post<T>(url, undefined, config).then(response => ({
      status: response.status,
      data: response.data,
    })),

  get: <T>(url: string, config?: AxiosRequestConfig): Promise<ApiResult<T>> =>
    axiosInstance.get<T>(url, config)      .then(response => ({
        status: response.status,
        data: response.data,
      })),

  postFormData: <T>(url: string, formData: FormData): Promise<ApiResult<T>> =>
    axiosInstance.post<T>(url, formData).then(response => ({
      status: response.status,
      data: response.data,
    })),

  postJson: <T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<ApiResult<T>> =>
    axiosInstance
      .post<T>(url, data, {
        ...config,
        headers: {
          'Content-Type': 'application/json',
          ...config?.headers,
        },
      })
      .then(response => ({
        status: response.status,
        data: response.data,
      })),

  post: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    axiosInstance.post<T>(url, data, config).then(response => response.data),
};

export { axiosInstance };
