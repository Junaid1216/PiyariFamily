import { ImageSourcePropType } from 'react-native';
import { Images } from '../../Assets';

export type ShortlistTab = 'i_liked' | 'liked_me';

export type ShortlistedProfile = {
  id: string;
  name: string;
  age: number;
  location: string;
  education: string;
  profession: string;
  image: ImageSourcePropType;
  isVerified?: boolean;
};

export type ShortlistApiItem = {
  id?: number | string;
  user_id?: number | string;
  name?: string;
  age?: number | string | null;
  city?: string | null;
  country?: string | null;
  state?: string | null;
  location?: string | null;
  highest_education?: string | null;
  qualification?: string | null;
  field_of_study?: string | null;
  education?: string | null;
  occupation?: string | null;
  profession?: string | null;
  employment_type?: string | null;
  profile_photo?: string | null;
  image?: string | null;
  gender?: string | null;
  is_verified?: boolean | number | null;
  user?: ShortlistApiItem;
  profile?: ShortlistApiItem;
  liked_user?: ShortlistApiItem;
};

export type ShortlistResponse = {
  success?: boolean | number;
  tab?: ShortlistTab;
  tab_label?: string;
  total?: number;
  profiles?: ShortlistApiItem[];
  message?: string;
};

export type ShortlistInterestResponse = {
  success?: boolean | number;
  message?: string;
  shortlisted?: boolean;
  mutual_match?: boolean;
  shortlist_tab?: ShortlistTab;
};

const pickString = (...values: Array<string | null | undefined>) => {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }

  return '';
};

const normalizeItem = (item: ShortlistApiItem): ShortlistApiItem => {
  const nested = item.user ?? item.profile ?? item.liked_user;

  if (nested && typeof nested === 'object') {
    return { ...item, ...nested };
  }

  return item;
};

const resolveProfileImage = (item: ShortlistApiItem): ImageSourcePropType => {
  const photo = pickString(item.profile_photo, item.image);

  if (photo) {
    return { uri: photo };
  }

  if (item.gender?.toLowerCase() === 'male') {
    return Images.maleProfile;
  }

  return Images.femaleProfile;
};

const resolveLocation = (item: ShortlistApiItem) => {
  const directLocation = pickString(item.location);

  if (directLocation) {
    return directLocation;
  }

  const city = pickString(item.city);
  const state = pickString(item.state);
  const country = pickString(item.country);

  return [city, state, country].filter(Boolean).join(', ');
};

const resolveAge = (value?: number | string | null) => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
};

const resolveId = (item: ShortlistApiItem, index: number) => {
  const id = item.id ?? item.user_id;

  if (id !== undefined && id !== null && String(id).trim()) {
    return String(id);
  }

  return `shortlist-${index}`;
};

export const mapShortlistItem = (
  item: ShortlistApiItem,
  index: number,
): ShortlistedProfile => {
  const profile = normalizeItem(item);

  return {
    id: resolveId(profile, index),
    name: pickString(profile.name) || 'Profile',
    age: resolveAge(profile.age),
    location: resolveLocation(profile) || '-',
    education:
      pickString(
        profile.highest_education,
        profile.qualification,
        profile.field_of_study,
        profile.education,
      ) || '-',
    profession:
      pickString(profile.occupation, profile.profession, profile.employment_type) ||
      '-',
    image: resolveProfileImage(profile),
    isVerified: Boolean(profile.is_verified),
  };
};

export const mapShortlistProfiles = (profiles?: ShortlistApiItem[] | null) =>
  (profiles ?? []).map(mapShortlistItem);
