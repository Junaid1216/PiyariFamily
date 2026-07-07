import { apiClient } from './apiClient';
import { ENDPOINTS } from './endpoints';
import type { FormValue } from './formData';
import type { CountryApiItem } from './mappers/countryMapper';
import type { ProfileApiData } from './mappers/profileMapper';

type CountriesResponse = {
  success?: boolean;
  data?: CountryApiItem[];
  message?: string;
};

type ProfileResponse = {
  success?: boolean;
  data?: ProfileApiData;
  message?: string;
};

type MessageResponse = {
  success?: boolean;
  message?: string;
};

type UpdateProfileResponse = MessageResponse & {
  user?: ProfileApiData;
};

export const Api = {
  getCountries: () =>
    apiClient.get<CountriesResponse>(ENDPOINTS.COUNTRIES),

  getProfile: () => apiClient.get<ProfileResponse>(ENDPOINTS.PROFILE),

  updateProfile: async (payload: Record<string, FormValue>) => {
    const { status, data } = await apiClient.postForm<UpdateProfileResponse>(
      ENDPOINTS.PROFILE_UPDATE,
      payload,
    );

    return { status, ...data };
  },
};