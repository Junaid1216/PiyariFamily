import { ImageSourcePropType } from 'react-native';
import { Images } from '../../Assets';
import type { BasicDetail, QuickInfo } from '../../Constant/MatchProfiles';

export type MatchTag = {
  icon: string;
  label: string;
};

export type FeaturedMatch = {
  id: string;
  name: string;
  age: number;
  location: string;
  image: ImageSourcePropType;
  tags: MatchTag[];
  isNew?: boolean;
  isVerified?: boolean;
};

export type SuggestedMatch = {
  id: string;
  name: string;
  age: number;
  location: string;
  profession: string;
  image: ImageSourcePropType;
  tier: 'VIP' | 'VVIP';
  isVerified: boolean;
};

export type HomeMatchesData = {
  greeting: string;
  totalMatches: number;
  featuredMatches: FeaturedMatch[];
  suggestedMatches: SuggestedMatch[];
};

export type MatchApiItem = {
  id?: number | string;
  user_id?: number | string;
  name?: string;
  age?: number | string | null;
  city?: string | null;
  country?: string | null;
  state?: string | null;
  location?: string | null;
  qualification?: string | null;
  highest_education?: string | null;
  field_of_study?: string | null;
  education?: string | null;
  job_title?: string | null;
  occupation?: string | null;
  profession?: string | null;
  employment_type?: string | null;
  community?: string | null;
  religion?: string | null;
  profile_photo?: string | null;
  image?: string | null;
  gender?: string | null;
  is_verified?: boolean | number | null;
  is_new?: boolean | number | null;
  is_new_profile?: boolean | number | null;
  tier?: string | null;
  plan?: string | null;
  subscription_plan?: string | null;
  bio?: string | null;
  about?: string | null;
  about_me?: string | null;
  height?: string | null;
  marital_status?: string | null;
  mother_tongue?: string | null;
  other_languages?: string | string[] | null;
  residential_status?: string | null;
  interests?: string[] | null;
  user?: MatchApiItem;
  profile?: MatchApiItem;
};

export type MatchProfileResponse = MatchApiItem & {
  success?: boolean;
  message?: string;
};

export type HomeMatchesResponse = {
  success?: boolean;
  greeting?: string | null;
  top_match?: MatchApiItem | null;
  suggested_matches?: MatchApiItem[];
  total_matches?: number | string | null;
  message?: string;
};

export type MatchSearchParams = {
  gender?: string;
  age_min?: number | string;
  age_max?: number | string;
  q?: string;
  search?: string;
  verified?: string | number;
  is_new?: string | number;
};

export type MatchFilterParams = {
  marital_status?: string;
  qualification?: string;
  city?: string;
  profession?: string;
  religion?: string;
  age_min?: number | string;
  age_max?: number | string;
  monthly_income_min?: number | string;
  monthly_income_max?: number | string;
  monthly_income?: string;
  near_me?: string | number;
  verified?: string | number;
  new_profiles?: string | number;
};

export type MatchListPagination = {
  current_page?: number | string | null;
  per_page?: number | string | null;
  total?: number | string | null;
  last_page?: number | string | null;
};

export type MatchFilterOptions = {
  cities?: string[];
  qualifications?: string[];
  professions?: string[];
  religions?: string[];
  marital_statuses?: string[];
  income_ranges?: string[];
  age_min?: number | string | null;
  age_max?: number | string | null;
};

export type MatchListResponse = {
  success?: boolean;
  data?: MatchApiItem[];
  profiles?: MatchApiItem[];
  matches?: MatchApiItem[];
  results?: MatchApiItem[];
  pagination?: MatchListPagination | null;
  filters_applied?: Record<string, string | number | null>;
  quick_filters?: Record<string, string | number | null>;
  filter_options?: MatchFilterOptions | null;
  total?: number | string | null;
  message?: string;
};

const pickString = (...values: Array<string | null | undefined>) => {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }

  return '';
};

const pickNumber = (value?: number | string | null) => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
};

const normalizeItem = (item: MatchApiItem): MatchApiItem => {
  const nested = item.user ?? item.profile;

  if (nested && typeof nested === 'object') {
    return { ...item, ...nested };
  }

  return item;
};

const resolveProfileImage = (item: MatchApiItem): ImageSourcePropType => {
  const photo = pickString(item.profile_photo, item.image);

  if (photo) {
    return { uri: photo };
  }

  if (item.gender?.toLowerCase() === 'male') {
    return Images.maleProfile;
  }

  return Images.femaleProfile;
};

const resolveLocation = (item: MatchApiItem) => {
  const directLocation = pickString(item.location);

  if (directLocation) {
    return directLocation;
  }

  const city = pickString(item.city);
  const country = pickString(item.country);

  return [city, country].filter(Boolean).join(', ');
};

const resolveId = (item: MatchApiItem, index: number) => {
  const id = item.id ?? item.user_id;

  if (id !== undefined && id !== null && String(id).trim()) {
    return String(id);
  }

  return `match-${index}`;
};

const resolveTier = (value?: string | null): 'VIP' | 'VVIP' => {
  if (value?.toUpperCase().includes('VVIP')) {
    return 'VVIP';
  }

  return 'VIP';
};

const buildTags = (item: MatchApiItem): MatchTag[] => {
  const tags: MatchTag[] = [];
  const education = pickString(
    item.qualification,
    item.highest_education,
    item.field_of_study,
    item.education,
  );
  const profession = pickString(
    item.job_title,
    item.occupation,
    item.profession,
    item.employment_type,
  );
  const community = pickString(item.community, item.religion);

  if (education) {
    tags.push({ icon: 'school-outline', label: education });
  }

  if (profession) {
    tags.push({ icon: 'briefcase-outline', label: profession });
  }

  if (community) {
    tags.push({ icon: 'heart-outline', label: community });
  }

  return tags;
};

export const mapFeaturedMatch = (
  item: MatchApiItem,
  index: number,
): FeaturedMatch => {
  const profile = normalizeItem(item);

  return {
    id: resolveId(profile, index),
    name: pickString(profile.name) || 'Profile',
    age: pickNumber(profile.age),
    location: resolveLocation(profile) || '-',
    image: resolveProfileImage(profile),
    tags: buildTags(profile),
    isNew: Boolean(profile.is_new ?? profile.is_new_profile),
    isVerified: Boolean(profile.is_verified),
  };
};

export const mapSuggestedMatch = (
  item: MatchApiItem,
  index: number,
): SuggestedMatch => {
  const profile = normalizeItem(item);

  return {
    id: resolveId(profile, index),
    name: pickString(profile.name) || 'Profile',
    age: pickNumber(profile.age),
    location: resolveLocation(profile) || '-',
    profession:
      pickString(
        profile.job_title,
        profile.occupation,
        profile.profession,
        profile.employment_type,
      ) || '-',
    image: resolveProfileImage(profile),
    tier: resolveTier(
      profile.tier ?? profile.plan ?? profile.subscription_plan,
    ),
    isVerified: Boolean(profile.is_verified),
  };
};

const extractMatchList = (response?: MatchListResponse | null) => {
  if (!response) {
    return [];
  }

  if (Array.isArray(response.data)) {
    return response.data;
  }

  if (Array.isArray(response.profiles)) {
    return response.profiles;
  }

  if (Array.isArray(response.matches)) {
    return response.matches;
  }

  if (Array.isArray(response.results)) {
    return response.results;
  }

  return [];
};

export const mapMatchList = (
  response?: MatchListResponse | null,
): SuggestedMatch[] => extractMatchList(response).map(mapSuggestedMatch);

export const pickMatchListTotal = (
  response?: MatchListResponse | null,
  fallback = 0,
) => {
  const paginationTotal = pickNumber(response?.pagination?.total);
  const total = pickNumber(response?.total);

  if (paginationTotal) {
    return paginationTotal;
  }

  if (total) {
    return total;
  }

  return fallback || extractMatchList(response).length;
};

const mapSuggestedMatches = (items?: MatchApiItem[] | null) =>
  (items ?? []).map(mapSuggestedMatch);

const splitGreeting = (greeting: string) => {
  const dotIndex = greeting.indexOf('. ');

  if (dotIndex === -1) {
    return { title: greeting, subtitle: '' };
  }

  return {
    title: greeting.slice(0, dotIndex + 1),
    subtitle: greeting.slice(dotIndex + 2),
  };
};

export const mapHomeMatches = (
  response?: HomeMatchesResponse | null,
): HomeMatchesData => {
  if (!response) {
    return {
      greeting: '',
      totalMatches: 0,
      featuredMatches: [],
      suggestedMatches: [],
    };
  }

  const featuredMatches = response.top_match
    ? [mapFeaturedMatch(response.top_match, 0)]
    : [];

  return {
    greeting: pickString(response.greeting),
    totalMatches: pickNumber(response.total_matches),
    featuredMatches,
    suggestedMatches: mapSuggestedMatches(response.suggested_matches),
  };
};

export const mapHomeGreeting = (greeting: string) => splitGreeting(greeting);

const parseLanguages = (value?: string | string[] | null) => {
  if (Array.isArray(value)) {
    return value.filter(Boolean).map(String);
  }

  if (typeof value === 'string' && value.trim()) {
    return value
      .split(',')
      .map(item => item.trim())
      .filter(Boolean);
  }

  return [];
};

const formatDetailValue = (label: string, value: string) => {
  if (!value || value === '-') {
    return '-';
  }

  if (label === 'Age' && !value.includes('year')) {
    return `${value} years`;
  }

  return value;
};

export const mapMatchProfileDetail = (
  response: MatchProfileResponse | null | undefined,
  profileId: string,
) => {
  const profile = normalizeItem(response ?? {});
  const education = pickString(
    profile.qualification,
    profile.highest_education,
    profile.field_of_study,
    profile.education,
  );
  const profession = pickString(
    profile.job_title,
    profile.occupation,
    profile.profession,
    profile.employment_type,
  );
  const community = pickString(profile.community, profile.religion);
  const residentialStatus = pickString(profile.residential_status);
  const age = pickNumber(profile.age);
  const city = pickString(profile.city) || '-';
  const height = pickString(profile.height) || '-';
  const maritalStatus = pickString(profile.marital_status) || '-';
  const motherTongue = pickString(profile.mother_tongue) || '-';

  const quickInfo = [
    education
      ? { icon: 'school-outline', title: education, subtitle: 'Education' }
      : null,
    profession
      ? {
          icon: 'briefcase-outline',
          title: profession,
          subtitle: 'Profession',
        }
      : null,
    community
      ? {
          iconSource: Images.religionIcon,
          title: community,
          subtitle: 'Religion',
        }
      : null,
    residentialStatus
      ? {
          icon: 'home-outline',
          title: residentialStatus,
          subtitle: 'Residential Status',
        }
      : null,
  ].filter(Boolean) as QuickInfo[];

  const basicDetails = [
    {
      icon: 'account-outline',
      label: 'Age',
      value: formatDetailValue('Age', String(age || '-')),
    },
    { icon: 'map-marker-outline', label: 'City', value: city },
    { icon: 'human-male-height', label: 'Height', value: height },
    { icon: 'heart-outline', label: 'Marital Status', value: maritalStatus },
    community
      ? {
          iconSource: Images.religionIcon,
          label: 'Religion',
          value: community,
        }
      : null,
    {
      icon: 'account-group-outline',
      label: 'Community',
      value: community || '-',
    },
    { icon: 'earth', label: 'Mother Tongue', value: motherTongue },
  ].filter(Boolean) as BasicDetail[];

  return {
    id: profileId,
    fullName: pickString(profile.name) || 'Profile',
    age,
    location: resolveLocation(profile) || city,
    image: resolveProfileImage(profile),
    tier: resolveTier(profile.tier ?? profile.plan ?? profile.subscription_plan),
    isVerified: Boolean(profile.is_verified),
    about:
      pickString(profile.bio, profile.about, profile.about_me) ||
      'No description available.',
    quickInfo,
    basicDetails,
    languages: parseLanguages(profile.other_languages),
    interests: Array.isArray(profile.interests)
      ? profile.interests.filter(Boolean).map(String)
      : [],
  };
};
