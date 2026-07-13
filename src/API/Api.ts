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
  status?: 'active' | 'inactive';
  can_activate?: boolean;
  can_deactivate?: boolean;
  user?: ProfileApiData;
};

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
  getProfile: () => apiClient.get<ProfileResponse>(ENDPOINTS.PROFILE),

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
    const { status, data } = await apiClient.postForm<MessageResponse>(
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

    return {
      ...data,
      status,
      accountStatus: data.status,
    };
  },

  deleteAccount: async () => {
    const { status, data } = await apiClient.postEmpty<MessageResponse>(
      ENDPOINTS.ACCOUNT_DELETE,
    );

    return { status, ...data };
  },
};