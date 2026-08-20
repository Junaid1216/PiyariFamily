import { AxiosRequestConfig } from 'axios';
import { apiClient } from './apiClient';
import { ENDPOINTS } from './endpoints';
import { toPhotoUploadFormData, toProfileUpdateFormData, type FormValue, type UploadFile } from './formData';
import type { ProfileApiData } from './mappers/profileMapper';
import type {
  BestMatchResponse,
  HomeMatchesResponse,
  MatchFilterParams,
  MatchListResponse,
  MatchProfileResponse,
  MatchSearchParams,
} from './mappers/matchMapper';
import type { ReferralHistoryResponse, ReferralStatsResponse } from './mappers/referralMapper';
import type { CountriesResponse } from './mappers/countryMapper';
import type { SubscriptionsResponse } from './mappers/subscriptionMapper';
import type { ShortlistInterestResponse, ShortlistResponse, ShortlistTab } from './mappers/shortlistMapper';

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

type AccountStatusResponse = {
  success?: number | boolean;
  message?: string;
  status?: number | 'active' | 'inactive';
  account_status?: 'active' | 'inactive';
  is_deactivated?: boolean;
  can_activate?: boolean;
  can_deactivate?: boolean;
  user?: ProfileApiData;
};

const isAccountStatusValue = (
  value?: AccountStatusResponse['status'] | AccountStatusResponse['account_status'],
): value is 'active' | 'inactive' =>
  value === 'active' || value === 'inactive';

const resolveUpdatedAccountStatus = (
  data: AccountStatusResponse,
  action: 'deactivate' | 'activate',
): 'active' | 'inactive' => {
  if (isAccountStatusValue(data.account_status)) {
    return data.account_status;
  }

  if (isAccountStatusValue(data.status)) {
    return data.status;
  }

  if (data.is_deactivated === true) {
    return 'inactive';
  }

  if (data.is_deactivated === false) {
    return 'active';
  }

  return action === 'deactivate' ? 'inactive' : 'active';
};

const isAccountUpdateSuccess = (
  httpStatus: number,
  data: AccountStatusResponse,
) =>
  httpStatus === 200 ||
  httpStatus === 201 ||
  data.success === true ||
  data.success == 200;

type VerifyPhoneResponse = MessageResponse & {
  user?: ProfileApiData;
};

export type ProfileFaithPayload = {
  religion: string;
  community?: string;
  sect?: string;
  mother_tongue: string;
  other_languages?: string[];
};

export const Api = {
  getCountries: () => apiClient.get<CountriesResponse>(ENDPOINTS.COUNTRIES),

  getProfile: (config?: AxiosRequestConfig & { skipTokenClear?: boolean }) =>
    apiClient.get<ProfileResponse>(ENDPOINTS.PROFILE, config),

  updateProfileCountry: async (payload: Record<string, FormValue>) => {
    const { status, data } = await apiClient.postForm<UpdateProfileResponse>(
      ENDPOINTS.PROFILE_COUNTRY,
      payload,
    );

    return { status, ...data };
  },

  updateProfileBasicInfo: async (payload: Record<string, FormValue>) => {
    const { status, data } = await apiClient.postForm<UpdateProfileResponse>(
      ENDPOINTS.PROFILE_BASIC_INFO,
      payload,
    );

    return { status, ...data };
  },

  updateProfileEducation: async (payload: Record<string, FormValue>) => {
    const { status, data } = await apiClient.postForm<UpdateProfileResponse>(
      ENDPOINTS.PROFILE_EDUCATION,
      payload,
    );

    return { status, ...data };
  },

  updateProfileCareer: async (payload: Record<string, FormValue>) => {
    const { status, data } = await apiClient.postForm<UpdateProfileResponse>(
      ENDPOINTS.PROFILE_CAREER,
      payload,
    );

    return { status, ...data };
  },

  updateProfilePhysical: async (payload: Record<string, FormValue>) => {
    const { status, data } = await apiClient.postForm<UpdateProfileResponse>(
      ENDPOINTS.PROFILE_PHYSICAL,
      payload,
    );

    return { status, ...data };
  },

  updateProfileFaith: async (payload: ProfileFaithPayload) => {
    const { status, data } = await apiClient.postJson<UpdateProfileResponse>(
      ENDPOINTS.PROFILE_FAITH,
      payload,
    );

    return { status, ...data };
  },

  uploadProfilePhotos: async (photos: UploadFile[]) => {
    const formData = toPhotoUploadFormData(photos);

    const { status, data } = await apiClient.postFormData<UpdateProfileResponse>(
      ENDPOINTS.PROFILE_PHOTOS,
      formData,
    );

    return { status, ...data };
  },

  sendVerifyPhone: async (payload: Record<string, FormValue>) => {
    const { status, data } = await apiClient.postForm<VerifyPhoneResponse>(
      ENDPOINTS.VERIFY_PHONE_SEND,
      payload,
    );

    return { status, ...data };
  },

  verifyPhone: async (payload: Record<string, FormValue>) => {
    const { status, data } = await apiClient.postForm<VerifyPhoneResponse>(
      ENDPOINTS.VERIFY_PHONE_VERIFY,
      payload,
    );

    return { status, ...data };
  },

  updateProfile: async (
    payload: Record<string, FormValue>,
    photo?: UploadFile | null,
  ) => {
    const formData = toProfileUpdateFormData(payload, photo);

    const { status, data } = await apiClient.postFormData<UpdateProfileResponse>(
      ENDPOINTS.PROFILE_UPDATE,
      formData,
    );

    return { status, ...data };
  },

  getShortlist: (tab: ShortlistTab) =>
    apiClient.get<ShortlistResponse>(ENDPOINTS.SHORTLIST, {
      params: { tab },
    }),

  sendShortlistInterest: async (profileId: string) => {
    const { status, data } = await apiClient.postEmpty<ShortlistInterestResponse>(
      `${ENDPOINTS.SHORTLIST}/${profileId}/interest`,
    );

    return { status, ...data };
  },

  getReferralStats: () =>
    apiClient.get<ReferralStatsResponse>(ENDPOINTS.REFERRALS_STATS),

  getReferralHistory: () =>
    apiClient.get<ReferralHistoryResponse>(ENDPOINTS.REFERRALS_HISTORY),

  getHomeMatches: () =>
    apiClient.get<HomeMatchesResponse>(ENDPOINTS.MATCHES_HOME),

  getBestMatch: () =>
    apiClient.get<BestMatchResponse>(ENDPOINTS.MATCHES_BEST),

  getMatchSearch: (params?: MatchSearchParams) =>
    apiClient.get<MatchListResponse>(ENDPOINTS.MATCHES_SEARCH, { params }),

  getMatchFilter: (params?: MatchFilterParams) =>
    apiClient.get<MatchListResponse>(ENDPOINTS.MATCHES_FILTER, { params }),

  getMatchProfile: (profileId: string) =>
    apiClient.get<MatchProfileResponse>(`${ENDPOINTS.MATCHES}/${profileId}`),

  getSubscriptions: () =>
    apiClient.get<SubscriptionsResponse>(ENDPOINTS.SUBSCRIPTIONS),

  updateAccountStatus: async (action: 'deactivate' | 'activate') => {
    const { status, data } = await apiClient.postForm<AccountStatusResponse>(
      ENDPOINTS.ACCOUNT_DEACTIVATE,
      { action },
    );

    const accountStatus = resolveUpdatedAccountStatus(data, action);

    return {
      ...data,
      status,
      success: data.success,
      message: data.message,
      account_status: accountStatus,
      accountStatus,
      is_deactivated: accountStatus === 'inactive',
      isSuccess: isAccountUpdateSuccess(status, data),
    };
  },

  deleteAccount: async () => {
    const { status, data } = await apiClient.postEmpty<MessageResponse>(
      ENDPOINTS.ACCOUNT_DELETE,
    );

    return { status, ...data };
  },
};