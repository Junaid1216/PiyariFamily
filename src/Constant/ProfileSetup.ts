import { CountryCode } from 'react-native-country-picker-modal';

export type CountryOption = {
  code: CountryCode;
  name: string;
};

export const PROFILE_COUNTRIES: CountryOption[] = [
  { code: 'PK', name: 'Pakistan' },
  { code: 'IN', name: 'India' },
  { code: 'BD', name: 'Bangladesh' },
  { code: 'LK', name: 'Sri Lanka' },
  { code: 'NP', name: 'Nepal' },
  { code: 'US', name: 'United States' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'CA', name: 'Canada' },
  { code: 'AU', name: 'Australia' },
  { code: 'AE', name: 'United Arab Emirates' },
  { code: 'SG', name: 'Singapore' },
  { code: 'MY', name: 'Malaysia' },
];

export const PROFILE_SETUP_TOTAL_STEPS = 6;

export const MARITAL_STATUS_OPTIONS = [
  'Single',
  'Divorced',
  'Widowed',
] as const;

export type MaritalStatus = (typeof MARITAL_STATUS_OPTIONS)[number];

export const MARITAL_STATUS_TO_API: Record<MaritalStatus, string> = {
  Single: 'single',
  Divorced: 'divorced',
  Widowed: 'widowed',
};

export const MARITAL_STATUS_FROM_API: Record<string, MaritalStatus> = {
  single: 'Single',
  divorced: 'Divorced',
  widowed: 'Widowed',
};

export const QUALIFICATION_OPTIONS = [
  "Bachelor's Degree",
  "Master's Degree",
  'PhD',
  'Diploma',
  'High School',
] as const;

export type Qualification = (typeof QUALIFICATION_OPTIONS)[number];

export const INCOME_RANGE_OPTIONS = [
  'Dependent on Family',
  'Less than 50K',
  '50K to 100K',
  '100K to 200K',
  '200K to 300K',
] as const;

export type IncomeRange = (typeof INCOME_RANGE_OPTIONS)[number];

export const RESIDENCE_STATUS_OPTIONS = [
  'Owned',
  'Rented',
  'Family Owned',
] as const;

export type ResidenceStatus = (typeof RESIDENCE_STATUS_OPTIONS)[number];

export const EDIT_MARITAL_STATUS_OPTIONS = [
  'Never Married',
  'Divorced',
  'Widowed',
] as const;

export type EditMaritalStatus = (typeof EDIT_MARITAL_STATUS_OPTIONS)[number];

export const COMMUNITY_OPTIONS = [
  'Sunni',
  'Shia',
  'Brahmin',
  'Rajput',
  'Punjabi',
  'Other',
] as const;

export type Community = (typeof COMMUNITY_OPTIONS)[number];

export const HEIGHT_FEET_OPTIONS = ['4', '5', '6', '7'] as const;
export const HEIGHT_INCHES_OPTIONS = [
  '0',
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  '10',
  '11',
] as const;

export const BODY_TYPE_OPTIONS = [
  'Slim',
  'Athletic',
  'Average',
  'Heavy',
] as const;

export type BodyType = (typeof BODY_TYPE_OPTIONS)[number];

export const BODY_TYPE_TO_API: Record<BodyType, string> = {
  Slim: 'slim',
  Athletic: 'athletic',
  Average: 'average',
  Heavy: 'heavy',
};

export const BODY_TYPE_FROM_API: Record<string, BodyType> = {
  slim: 'Slim',
  athletic: 'Athletic',
  average: 'Average',
  heavy: 'Heavy',
};

export const COMPLEXION_OPTIONS = [
  'Fair',
  'Wheatish',
  'Dusky',
  'Dark',
] as const;

export type Complexion = (typeof COMPLEXION_OPTIONS)[number];

export const COMPLEXION_TO_API: Record<Complexion, string> = {
  Fair: 'fair',
  Wheatish: 'wheatish',
  Dusky: 'dusky',
  Dark: 'dark',
};

export const COMPLEXION_FROM_API: Record<string, Complexion> = {
  fair: 'Fair',
  wheatish: 'Wheatish',
  dusky: 'Dusky',
  dark: 'Dark',
};

export const EMPLOYMENT_TYPE_OPTIONS = [
  'Employed',
  'Self-Employed',
  'Business',
] as const;

export type EmploymentType = (typeof EMPLOYMENT_TYPE_OPTIONS)[number];

/** Backend career API values — confirm with backend if validation fails */
export const EMPLOYMENT_TYPE_TO_API: Record<EmploymentType, string> = {
  Employed: 'employed',
  'Self-Employed': 'self_employed',
  Business: 'business',
};

export const INCOME_RANGE_TO_API: Record<IncomeRange, string> = {
  'Dependent on Family': '0',
  'Less than 50K': '40000',
  '50K to 100K': '75000',
  '100K to 200K': '150000',
  '200K to 300K': '250000',
};

export const RELIGION_OPTIONS = [
  'Islam',
  'Hinduism',
  'Christianity',
  'Sikhism',
  'Buddhism',
  'Jainism',
  'Other',
] as const;

export type Religion = (typeof RELIGION_OPTIONS)[number];

export const RELIGION_TO_API: Record<Religion, string> = {
  Islam: 'Muslim',
  Hinduism: 'Hinduism',
  Christianity: 'Christianity',
  Sikhism: 'Sikhism',
  Buddhism: 'Buddhism',
  Jainism: 'Jainism',
  Other: 'Other',
};

export const MOTHER_TONGUE_OPTIONS = [
  'Urdu',
  'English',
  'Hindi',
  'Punjabi',
  'Sindhi',
  'Pashto',
  'Bengali',
  'Other',
] as const;

export type MotherTongue = (typeof MOTHER_TONGUE_OPTIONS)[number];

export const OTHER_LANGUAGE_OPTIONS = [
  'Urdu',
  'English',
  'Hindi',
  'Punjabi',
  'Sindhi',
  'Pashto',
  'Bengali',
  'Arabic',
  'Persian',
  'Turkish',
] as const;

export type OtherLanguage = (typeof OTHER_LANGUAGE_OPTIONS)[number];

export const MAX_OTHER_LANGUAGES = 5;

export const PROFILE_PHOTO_SLOTS = 6;
export const PROFILE_PHOTO_MAX_BYTES = 5120 * 1024;
export const PROFILE_PHOTO_PICKER_MAX_SIZE = 1280;
export const PROFILE_PHOTO_PICKER_QUALITY = 0.75 as const;
