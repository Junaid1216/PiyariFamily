import { ImageSourcePropType } from 'react-native';
import { Images } from '../../Assets';
import type { BasicDetail, QuickInfo } from '../../Constant/MatchProfiles';
import { pickImageUrl } from './profileMapper';
import { toRemoteImageSource } from '../mediaUrl';

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

export type BestMatchData = {
  id: string;
  name: string;
  age: number;
  location: string;
  matchScore: number;
  image: ImageSourcePropType;
};

export type BestMatchResponse = {
  success?: number | boolean;
  match_score?: number | string | null;
  profile?: MatchApiItem | null;
  message?: string;
  data?: BestMatchResponse;
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
  full_name?: string;
  fullName?: string;
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
  photo?: string | null;
  avatar?: string | null;
  photos?: Array<Record<string, unknown> | string> | null;
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
  description?: string | null;
  height?: string | null;
  marital_status?: string | null;
  mother_tongue?: string | null;
  other_languages?: string | string[] | null;
  residential_status?: string | null;
  residence_status?: string | null;
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
  featured_matches?: MatchApiItem[];
  featured?: MatchApiItem[];
  matches?: MatchApiItem[];
  suggested_matches?: MatchApiItem[];
  profiles?: MatchApiItem[];
  users?: MatchApiItem[];
  results?: MatchApiItem[];
  recommendations?: MatchApiItem[];
  total_matches?: number | string | null;
  message?: string;
  data?: HomeMatchesResponse | MatchApiItem[];
};

export type MatchSearchParams = {
  gender?: string;
  age_min?: number | string;
  age_max?: number | string;
  city?: string;
  country?: string;
  religion?: string;
  marital_status?: string;
  education?: string;
  profession?: string;
  name?: string;
  near_me?: boolean | string | number;
  verified?: boolean | string | number;
  new_profiles?: boolean | string | number;
  height_min?: number | string;
  height_max?: number | string;
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
  near_me?: string | number | boolean;
  verified?: string | number | boolean;
  new_profiles?: string | number | boolean;
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

const stripEmptyMedia = (item: MatchApiItem): MatchApiItem => {
  const next = { ...item };
  const mediaKeys = [
    'photos',
    'image',
    'photo',
    'profile_photo',
    'avatar',
  ] as const;

  for (const key of mediaKeys) {
    const value = next[key];
    if (
      value == null ||
      value === '' ||
      (Array.isArray(value) && value.length === 0)
    ) {
      delete next[key];
    }
  }

  return next;
};

const normalizeItem = (item: MatchApiItem): MatchApiItem => {
  const nested = item.user ?? item.profile;

  if (nested && typeof nested === 'object') {
    return { ...stripEmptyMedia(item), ...stripEmptyMedia(nested) };
  }

  return item;
};

const resolveProfileImage = (
  ...items: MatchApiItem[]
): ImageSourcePropType => {
  for (const item of items) {
    const photo = pickImageUrl(item);
    if (photo) {
      return toRemoteImageSource(photo);
    }
  }

  const gender = items
    .map(item => item.gender?.toLowerCase())
    .find(value => value === 'male' || value === 'female');

  if (gender === 'male') {
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
    image: resolveProfileImage(item, profile),
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
    image: resolveProfileImage(item, profile),
    tier: resolveTier(
      profile.tier ?? profile.plan ?? profile.subscription_plan,
    ),
    isVerified: Boolean(profile.is_verified),
  };
};

const extractMatchList = (response?: MatchListResponse | null) => {
  const normalized = normalizeMatchListResponse(response);

  if (!normalized) {
    return [];
  }

  if (Array.isArray(normalized.data)) {
    return normalized.data;
  }

  if (Array.isArray(normalized.profiles)) {
    return normalized.profiles;
  }

  if (Array.isArray(normalized.matches)) {
    return normalized.matches;
  }

  if (Array.isArray(normalized.results)) {
    return normalized.results;
  }

  return [];
};

export const normalizeMatchListResponse = (
  source?: MatchListResponse | null,
): MatchListResponse => {
  if (!source || typeof source !== 'object') {
    return {};
  }

  let merged: MatchListResponse = { ...source };
  const dataField = merged.data;

  if (dataField && typeof dataField === 'object' && !Array.isArray(dataField)) {
    merged = {
      ...merged,
      ...(dataField as MatchListResponse),
    };
  }

  return merged;
};

export const resolveOppositeGender = (gender?: string | null) => {
  const value = gender?.toLowerCase();

  if (value === 'male') {
    return 'female';
  }

  if (value === 'female') {
    return 'male';
  }

  return 'female';
};

export const parseSearchQuery = (searchQuery: string) => {
  const trimmed = searchQuery.trim();

  if (!trimmed) {
    return { name: undefined, profession: undefined, city: undefined };
  }

  const commaIndex = trimmed.indexOf(',');

  if (commaIndex !== -1) {
    const profession = trimmed.slice(0, commaIndex).trim();
    const city = trimmed.slice(commaIndex + 1).trim();

    return {
      name: undefined,
      profession: profession || undefined,
      city: city || undefined,
    };
  }

  return { name: trimmed, profession: undefined, city: undefined };
};

export type BuildSearchParamsInput = {
  searchQuery?: string;
  quickFilter?: 'nearMe' | 'verified' | 'newProfiles' | null;
  quickFilters?: {
    near_me?: boolean;
    verified?: boolean;
    new_profiles?: boolean;
  };
  profileGender?: string | null;
  ageMin?: number;
  ageMax?: number;
  city?: string;
  country?: string;
  religion?: string;
  maritalStatus?: string;
  education?: string;
  profession?: string;
  heightMin?: number;
  heightMax?: number;
};

export const buildMatchSearchParams = ({
  searchQuery = '',
  quickFilter = null,
  quickFilters,
  profileGender,
  ageMin,
  ageMax,
  city,
  country,
  religion,
  maritalStatus,
  education,
  profession,
  heightMin,
  heightMax,
}: BuildSearchParamsInput): MatchSearchParams => {
  const params: MatchSearchParams = {
    gender: resolveOppositeGender(profileGender),
  };

  if (ageMin !== undefined) {
    params.age_min = ageMin;
  }

  if (ageMax !== undefined) {
    params.age_max = ageMax;
  }

  if (city?.trim()) {
    params.city = city.trim();
  }

  if (country?.trim()) {
    params.country = country.trim();
  }

  if (religion?.trim()) {
    params.religion = religion.trim();
  }

  if (maritalStatus?.trim()) {
    params.marital_status = maritalStatus.trim().toLowerCase();
  }

  if (education?.trim()) {
    params.education = education.trim();
  }

  if (profession?.trim()) {
    params.profession = profession.trim();
  }

  if (heightMin !== undefined) {
    params.height_min = heightMin;
  }

  if (heightMax !== undefined) {
    params.height_max = heightMax;
  }

  const parsedSearch = parseSearchQuery(searchQuery);

  if (parsedSearch.name) {
    params.name = parsedSearch.name;
  }

  if (!profession?.trim() && parsedSearch.profession) {
    params.profession = parsedSearch.profession;
  }

  if (!city?.trim() && parsedSearch.city) {
    params.city = parsedSearch.city;
  }

  if (quickFilters) {
    if (quickFilters.near_me) {
      params.near_me = true;
    }
    if (quickFilters.verified) {
      params.verified = true;
    }
    if (quickFilters.new_profiles) {
      params.new_profiles = true;
    }
  } else if (quickFilter === 'nearMe') {
    params.near_me = true;
  } else if (quickFilter === 'verified') {
    params.verified = true;
  } else if (quickFilter === 'newProfiles') {
    params.new_profiles = true;
  }

  return params;
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

const pickMatchArray = (...lists: Array<MatchApiItem[] | null | undefined>) => {
  for (const list of lists) {
    if (Array.isArray(list) && list.length) {
      return list;
    }
  }

  return [];
};

const normalizeHomeResponse = (
  source?: HomeMatchesResponse | null,
  depth = 0,
): HomeMatchesResponse => {
  if (!source || typeof source !== 'object' || depth > 4) {
    return source && typeof source === 'object' ? source : {};
  }

  if (Array.isArray(source.data)) {
    return {
      ...source,
      suggested_matches: pickMatchArray(
        source.suggested_matches,
        source.data,
      ),
      matches: pickMatchArray(source.matches, source.data),
    };
  }

  if (source.data && typeof source.data === 'object') {
    const { data: _ignored, ...rest } = source;
    return normalizeHomeResponse(
      {
        ...rest,
        ...source.data,
      },
      depth + 1,
    );
  }

  return source;
};

const extractFeaturedMatches = (response: HomeMatchesResponse) => {
  const featured = pickMatchArray(
    response.featured_matches,
    response.featured,
  );

  if (featured.length) {
    return featured;
  }

  if (response.top_match) {
    return [response.top_match];
  }

  return [];
};

const extractSuggestedMatches = (response: HomeMatchesResponse) => {
  return pickMatchArray(
    response.suggested_matches,
    response.matches,
    response.profiles,
    response.results,
    response.users,
    response.recommendations,
  );
};

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
  const data = normalizeHomeResponse(response);
  let featuredItems = extractFeaturedMatches(data);
  let suggestedItems = extractSuggestedMatches(data);

  if (featuredItems.length && suggestedItems.length) {
    const featuredIds = new Set(
      featuredItems.map(item => String(item.id ?? item.user_id ?? '')),
    );
    suggestedItems = suggestedItems.filter(
      item => !featuredIds.has(String(item.id ?? item.user_id ?? '')),
    );
  }

  if (!featuredItems.length && suggestedItems.length) {
    featuredItems = [suggestedItems[0]];
    suggestedItems = suggestedItems.slice(1);
  }

  const mapped = {
    greeting: pickString(data.greeting),
    totalMatches:
      pickNumber(data.total_matches) ||
      featuredItems.length + suggestedItems.length,
    featuredMatches: featuredItems.map(mapFeaturedMatch),
    suggestedMatches: mapSuggestedMatches(suggestedItems),
  };

  logMappedPhotos(mapped);
  return mapped;
};

const logMappedPhotos = (mapped: HomeMatchesData) => {
  console.log(
    'Home mapped photos:',
    [...mapped.featuredMatches, ...mapped.suggestedMatches].map(item => ({
      id: item.id,
      name: item.name,
      image: item.image,
    })),
  );
};

const suggestedToFeatured = (item: SuggestedMatch): FeaturedMatch => ({
  id: item.id,
  name: item.name,
  age: item.age,
  location: item.location,
  image: item.image,
  tags:
    item.profession && item.profession !== '-'
      ? [{ icon: 'briefcase-outline', label: item.profession }]
      : [],
  isVerified: item.isVerified,
});

export const mapListToHomeMatches = (
  items: SuggestedMatch[],
  greeting = '',
): HomeMatchesData => {
  if (!items.length) {
    return {
      greeting,
      totalMatches: 0,
      featuredMatches: [],
      suggestedMatches: [],
    };
  }

  const mapped = {
    greeting,
    totalMatches: items.length,
    featuredMatches: [suggestedToFeatured(items[0])],
    suggestedMatches: items.length > 1 ? items.slice(1) : items,
  };
  logMappedPhotos(mapped);
  return mapped;
};

export const mapHomeGreeting = (greeting: string) => splitGreeting(greeting);

export const mapBestMatch = (
  response?: BestMatchResponse | null,
): BestMatchData | null => {
  if (!response || typeof response !== 'object') {
    return null;
  }

  const source =
    response.profile ??
    (response.data &&
    typeof response.data === 'object' &&
    !Array.isArray(response.data)
      ? response.data.profile
      : null) ??
    response;

  const matchScore =
    response.match_score ??
    (response.data &&
    typeof response.data === 'object' &&
    !Array.isArray(response.data)
      ? response.data.match_score
      : null);

  if (!source || typeof source !== 'object') {
    return null;
  }

  const profile = unwrapMatchRecord(source);
  const photo =
    pickImageUrl(profile) ||
    pickImageUrl(source) ||
    pickImageUrl(response.profile) ||
    pickImageUrl(response);

  if (!pickString(profile.name, profile.full_name, profile.fullName) && !profile.id) {
    return null;
  }

  return {
    id: resolveId(profile, 0),
    name:
      pickString(profile.name, profile.full_name, profile.fullName) ||
      'Profile',
    age: pickNumber(profile.age),
    location: resolveLocation(profile) || '-',
    matchScore: pickNumber(matchScore),
    image: photo
      ? toRemoteImageSource(photo)
      : resolveProfileImage(profile, source, response),
  };
};

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

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value);

const unwrapMatchRecord = (
  source?: unknown,
  depth = 0,
): MatchApiItem => {
  if (depth > 5) {
    return isPlainObject(source) ? normalizeItem(source as MatchApiItem) : {};
  }

  if (Array.isArray(source)) {
    return unwrapMatchRecord(source[0], depth + 1);
  }

  if (!isPlainObject(source)) {
    return {};
  }

  const record = source as MatchApiItem & {
    data?: unknown;
    match?: unknown;
  };
  const nested = [record.data, record.user, record.profile, record.match].find(
    value =>
      (Array.isArray(value) && value.length > 0) || isPlainObject(value),
  );

  if (nested && nested !== record) {
    const inner = unwrapMatchRecord(nested, depth + 1);
    return normalizeItem({ ...record, ...inner });
  }

  return normalizeItem(record);
};

export type MatchProfilePreview = {
  name?: string;
  age?: number;
  location?: string;
  image?: ImageSourcePropType;
  isVerified?: boolean;
};

export const mapMatchProfileDetail = (
  response: MatchProfileResponse | null | undefined,
  profileId: string,
  preview?: MatchProfilePreview | null,
) => {
  const profile = unwrapMatchRecord(response);
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
  const residentialStatus = pickString(
    profile.residential_status,
    profile.residence_status,
  );
  const age = pickNumber(profile.age) || preview?.age || 0;
  const city =
    pickString(profile.city) ||
    pickString(preview?.location?.split(',')[0]) ||
    '-';
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
    fullName:
      pickString(profile.name, profile.full_name, profile.fullName) ||
      preview?.name ||
      'Profile',
    age,
    location:
      resolveLocation(profile) ||
      (city !== '-' ? city : '') ||
      preview?.location ||
      '-',
    image: (() => {
      const photo = pickImageUrl(profile) || pickImageUrl(response);
      if (photo) {
        return { uri: photo };
      }
      if (preview?.image) {
        return preview.image;
      }
      return resolveProfileImage(profile, response ?? {});
    })(),
    tier: resolveTier(profile.tier ?? profile.plan ?? profile.subscription_plan),
    isVerified: Boolean(profile.is_verified || preview?.isVerified),
    about:
      pickString(
        profile.bio,
        profile.about,
        profile.about_me,
        profile.description,
      ) || 'No description available.',
    quickInfo,
    basicDetails,
    languages: parseLanguages(profile.other_languages),
    interests: Array.isArray(profile.interests)
      ? profile.interests.filter(Boolean).map(String)
      : [],
  };
};
