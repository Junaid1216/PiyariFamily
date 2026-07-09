import { apiClient } from './apiClient';
import { ENDPOINTS } from './endpoints';
import type { FormValue } from './formData';
import type { ProfileApiData } from './mappers/profileMapper';
import type {
  HomeMatchesResponse,
  MatchFilterParams,
  MatchListResponse,
  MatchProfileResponse,
  MatchSearchParams,
} from './mappers/matchMapper';
import type { ReferralHistoryResponse, ReferralStatsResponse } from './mappers/referralMapper';
import type { SubscriptionsResponse } from './mappers/subscriptionMapper';
import type { ShortlistResponse, ShortlistTab } from './mappers/shortlistMapper';

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

type VerifyPhoneResponse = MessageResponse & {
  user?: ProfileApiData;
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
    const { status, data } = await apiClient.postForm<MessageResponse>(
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

  updateProfile: async (payload: Record<string, FormValue>) => {
    const { status, data } = await apiClient.postForm<UpdateProfileResponse>(
      ENDPOINTS.PROFILE_UPDATE,
      payload,
    );

    return { status, ...data };
  },

  getShortlist: (tab: ShortlistTab) =>
    apiClient.get<ShortlistResponse>(ENDPOINTS.SHORTLIST, {
      params: { tab },
    }),

  getReferralStats: () =>
    apiClient.get<ReferralStatsResponse>(ENDPOINTS.REFERRALS_STATS),

  getReferralHistory: () =>
    apiClient.get<ReferralHistoryResponse>(ENDPOINTS.REFERRALS_HISTORY),

  getHomeMatches: () =>
    apiClient.get<HomeMatchesResponse>(ENDPOINTS.MATCHES_HOME),

  getMatchSearch: (params?: MatchSearchParams) =>
    apiClient.get<MatchListResponse>(ENDPOINTS.MATCHES_SEARCH, { params }),

  getMatchFilter: (params?: MatchFilterParams) =>
    apiClient.get<MatchListResponse>(ENDPOINTS.MATCHES_FILTER, { params }),

  getMatchProfile: (profileId: string) =>
    apiClient.get<MatchProfileResponse>(`${ENDPOINTS.MATCHES}/${profileId}`),

  getSubscriptions: () =>
    apiClient.get<SubscriptionsResponse>(ENDPOINTS.SUBSCRIPTIONS),
};