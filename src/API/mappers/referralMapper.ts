import { ImageSourcePropType } from 'react-native';
import { Images } from '../../Assets';
import { REFERRAL_LINK } from '../../Constant/Referrals';

export type ReferralRewardRow = {
  id: string;
  registrations: string;
  points: string;
};

export type ReferralStats = {
  referralCode: string;
  referralLink: string;
  registered: number;
  pointsEarned: number;
  conversionRate: string;
  rewardsTable: ReferralRewardRow[];
};

export type ReferralStatsResponse = {
  success?: boolean | number;
  referral_code?: string | null;
  referral_link?: string | null;
  reward_per_registration?: string | number | null;
  reward_points?: number | string | null;
  total_registered?: number | string | null;
  conversion_rate?: string | null;
  message?: string;
  data?: ReferralStatsResponse;
};

const pickNumber = (...values: Array<number | string | null | undefined>) => {
  for (const value of values) {
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }

    if (typeof value === 'string' && value.trim()) {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }
  }

  return 0;
};

const pickString = (...values: Array<string | null | undefined>) => {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }

  return '';
};

const formatPoints = (value?: string | number | null) => {
  if (value === undefined || value === null || value === '') {
    return '0 pts';
  }

  const text = String(value).trim();

  if (/pt/i.test(text)) {
    return text;
  }

  return `${text} pts`;
};

const buildRewardsTable = (
  rewardPerRegistration?: string | number | null,
  conversionRate?: string | null,
): ReferralRewardRow[] => {
  if (conversionRate?.trim()) {
    const [registrations = '1 Registration', points = ''] = conversionRate
      .split('=')
      .map(part => part.trim());

    return [
      {
        id: '1',
        registrations,
        points: points || formatPoints(rewardPerRegistration ?? 0),
      },
    ];
  }

  return [
    {
      id: '1',
      registrations: '1 Registration',
      points: formatPoints(rewardPerRegistration ?? 0),
    },
  ];
};

const normalizeReferralStatsResponse = (
  response?: ReferralStatsResponse | null,
): ReferralStatsResponse | null => {
  if (!response || typeof response !== 'object') {
    return null;
  }

  if (response.data && typeof response.data === 'object') {
    return {
      ...response,
      ...response.data,
    };
  }

  return response;
};

export const mapReferralStats = (
  response?: ReferralStatsResponse | null,
): ReferralStats => {
  const data = normalizeReferralStatsResponse(response);

  return {
    referralCode: pickString(data?.referral_code),
    referralLink: pickString(data?.referral_link) || REFERRAL_LINK,
    registered: pickNumber(data?.total_registered),
    pointsEarned: pickNumber(data?.reward_points),
    conversionRate: pickString(data?.conversion_rate),
    rewardsTable: buildRewardsTable(
      data?.reward_per_registration,
      data?.conversion_rate,
    ),
  };
};

export type ReferralHistoryItem = {
  id: string;
  name: string;
  image: ImageSourcePropType;
  points: string;
  isRegistered: boolean;
};

export type ReferralHistoryApiItem = {
  id?: number | string;
  name?: string | null;
  referred_name?: string | null;
  points?: number | string | null;
  reward_points?: number | string | null;
  points_earned?: number | string | null;
  profile_photo?: string | null;
  image?: string | null;
  gender?: string | null;
  status?: string | null;
  is_registered?: boolean | number | null;
  user?: ReferralHistoryApiItem;
  referred_user?: ReferralHistoryApiItem;
};

export type ReferralHistoryResponse = {
  success?: boolean | number;
  history?: ReferralHistoryApiItem[];
  referrals?: ReferralHistoryApiItem[];
  data?: ReferralHistoryApiItem[] | ReferralHistoryResponse;
  total?: number | string | null;
  message?: string;
};

const normalizeHistoryItem = (
  item: ReferralHistoryApiItem,
): ReferralHistoryApiItem => {
  const nested = item.referred_user ?? item.user;

  if (nested && typeof nested === 'object') {
    return { ...item, ...nested };
  }

  return item;
};

const resolveHistoryImage = (
  item: ReferralHistoryApiItem,
): ImageSourcePropType => {
  const photo = pickString(item.profile_photo, item.image);

  if (photo) {
    return { uri: photo };
  }

  if (item.gender?.toLowerCase() === 'male') {
    return Images.maleProfile;
  }

  return Images.femaleProfile;
};

const formatHistoryPoints = (value?: number | string | null) => {
  const points = pickNumber(value);

  if (!points) {
    return '+0 pts';
  }

  return `+${points} pts`;
};

const resolveHistoryId = (item: ReferralHistoryApiItem, index: number) => {
  const id = item.id;

  if (id !== undefined && id !== null && String(id).trim()) {
    return String(id);
  }

  return `referral-history-${index}`;
};

export const mapReferralHistoryItem = (
  item: ReferralHistoryApiItem,
  index: number,
): ReferralHistoryItem => {
  const profile = normalizeHistoryItem(item);
  const status = pickString(profile.status).toLowerCase();

  return {
    id: resolveHistoryId(profile, index),
    name: pickString(profile.name, profile.referred_name) || 'User',
    image: resolveHistoryImage(profile),
    points: formatHistoryPoints(
      profile.points ?? profile.reward_points ?? profile.points_earned,
    ),
    isRegistered:
      profile.is_registered === true ||
      profile.is_registered === 1 ||
      status === 'registered' ||
      status === 'completed' ||
      !status,
  };
};

const normalizeReferralHistoryResponse = (
  response?: ReferralHistoryResponse | null,
): ReferralHistoryResponse | null => {
  if (!response || typeof response !== 'object') {
    return null;
  }

  if (Array.isArray(response.data)) {
    return { ...response, history: response.history ?? response.data };
  }

  if (response.data && typeof response.data === 'object' && !Array.isArray(response.data)) {
    return {
      ...response,
      ...response.data,
    };
  }

  return response;
};

const extractHistory = (response?: ReferralHistoryResponse | null) => {
  const normalized = normalizeReferralHistoryResponse(response);

  if (!normalized) {
    return [];
  }

  if (Array.isArray(normalized.history)) {
    return normalized.history;
  }

  if (Array.isArray(normalized.referrals)) {
    return normalized.referrals;
  }

  if (Array.isArray(normalized.data)) {
    return normalized.data;
  }

  return [];
};

export const mapReferralHistory = (
  response?: ReferralHistoryResponse | null,
): ReferralHistoryItem[] => extractHistory(response).map(mapReferralHistoryItem);
