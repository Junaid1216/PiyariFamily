export const REFERRAL_LINK = 'piyarifamily.com/ref/AYESHA2024';
export const REFERRAL_STATS = {
  registered: 10,
  pointsEarned: 500,
  redeemed: 1,
  totalPoints: 500,
};

export const REFERRAL_REWARDS_TABLE = [
  { id: '1', registrations: '1 Registration', points: '50 pts' },
];

export type RedeemOption = {
  id: string;
  icon: string;
  title: string;
  pointsRequired: string;
};

export const REDEEM_OPTIONS: RedeemOption[] = [
  {
    id: 'vip',
    icon: 'crown',
    title: '1 Month Free VIP Plan',
    pointsRequired: '100 pts required',
  },
  {
    id: 'vvip',
    icon: 'crown',
    title: '1 Month Free VVIP Plan',
    pointsRequired: '180 pts required',
  },
  {
    id: 'boost',
    icon: 'chart-line',
    title: 'Profile Boost — 7 Days',
    pointsRequired: '30 pts required',
  },
];

export type { ReferralHistoryItem } from '../API/mappers/referralMapper';
