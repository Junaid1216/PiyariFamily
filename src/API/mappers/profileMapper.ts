import type { OtherLanguage } from '../../Constant/ProfileSetup';
import type { FormValue } from '../formData';
import { profileStorage } from '../profileStorage';
import { userStorage } from '../userStorage';

export type ProfileApiData = {
  name?: string;
  email?: string;
  phone?: string;
  birthday?: string | null;
  gender?: string;
  bio?: string | null;
  about?: string;
  about_me?: string;
  city?: string | null;
  country?: string | null;
  state?: string | null;
  height?: string | null;
  weight?: string | null;
  body_type?: string | null;
  complexion?: string | null;
  physical_disability?: boolean | number | string | null;
  mother_tongue?: string | null;
  other_languages?: string | string[] | null;
  marital_status?: string | null;
  community?: string | null;
  residential_status?: string | null;
  residence_status?: string | null;
  age?: number | null;
  is_verified?: boolean;
  phone_verified?: boolean;
  location?: string | null;
  profile_photo?: string | null;
  image?: string | null;
  language?: string | null;
  profile_photo_visible?: boolean;
  additional_photos_visible?: boolean;
};

export type EditProfileFormData = {
  fullName: string;
  birthday: string;
  dateOfBirth: string;
  gender: 'male' | 'female';
  aboutMe: string;
  email: string;
  phone: string;
  city: string;
  country: string;
  heightFeet: string;
  heightInches: string;
  motherTongue: string;
  otherLanguages: OtherLanguage[];
  maritalStatus: string;
  community: string;
  residenceStatus: string;
  age: number | null;
  profilePhoto: string | null;
};

export type SettingsProfileData = {
  name: string;
  meta: string;
  isVerified: boolean;
  profilePhoto: string | null;
  profilePictureVisible: boolean;
  additionalPhotosVisible: boolean;
};

const MARITAL_STATUS_MAP: Record<string, string> = {
  single: 'Never Married',
  'never married': 'Never Married',
  divorced: 'Divorced',
  widowed: 'Widowed',
};

const MARITAL_TO_API: Record<string, string> = {
  'Never Married': 'never married',
  Divorced: 'divorced',
  Widowed: 'widowed',
};

export const normalizeProfileData = (source: unknown): ProfileApiData => {
  if (!source || typeof source !== 'object') {
    return {};
  }

  const obj = source as Record<string, unknown>;

  if (obj.user && typeof obj.user === 'object') {
    return mapGetProfileFields(obj.user as Record<string, unknown>);
  }

  if (obj.data && typeof obj.data === 'object') {
    const data = obj.data as Record<string, unknown>;

    if (data.user && typeof data.user === 'object') {
      return mapGetProfileFields(data.user as Record<string, unknown>);
    }

    return mapGetProfileFields(data);
  }

  return mapGetProfileFields(obj);
};

const mapGetProfileFields = (
  obj: Record<string, unknown>,
): ProfileApiData => {
  const profile = { ...obj } as ProfileApiData;

  if (profile.image && !profile.profile_photo) {
    profile.profile_photo = profile.image;
  }

  if (profile.language && !profile.mother_tongue) {
    profile.mother_tongue = profile.language;
  }

  return profile;
};

const pickProfileField = <T>(
  ...values: Array<T | null | undefined>
): T | undefined => {
  for (const value of values) {
    if (value !== undefined && value !== null && value !== '') {
      return value;
    }
  }

  return undefined;
};

export const resolveProfileData = (source: unknown): ProfileApiData => {
  const fromApi = normalizeProfileData(source);
  const cached = profileStorage.get();
  const storedUser = userStorage.getUser();

  const resolved: ProfileApiData = {
    ...cached,
    ...fromApi,
    name: pickProfileField(fromApi.name, cached?.name, storedUser?.name),
    email: pickProfileField(fromApi.email, cached?.email, storedUser?.email),
    phone: pickProfileField(fromApi.phone, cached?.phone, storedUser?.phone),
    gender: pickProfileField(fromApi.gender, cached?.gender),
    birthday: pickProfileField(fromApi.birthday, cached?.birthday),
    bio: pickProfileField(fromApi.bio, cached?.bio),
    city: pickProfileField(fromApi.city, cached?.city),
    country: pickProfileField(fromApi.country, cached?.country),
    height: pickProfileField(fromApi.height, cached?.height),
    mother_tongue: pickProfileField(
      fromApi.mother_tongue,
      cached?.mother_tongue,
    ),
    other_languages: pickProfileField(
      fromApi.other_languages,
      cached?.other_languages,
    ),
    marital_status: pickProfileField(
      fromApi.marital_status,
      cached?.marital_status,
    ),
    community: pickProfileField(fromApi.community, cached?.community),
    residential_status: pickProfileField(
      fromApi.residential_status,
      cached?.residential_status,
      cached?.residence_status,
    ),
    age: pickProfileField(fromApi.age, cached?.age),
    is_verified: pickProfileField(
      fromApi.is_verified,
      cached?.is_verified,
      storedUser?.is_verified,
    ),
    profile_photo: pickProfileField(
      fromApi.profile_photo,
      fromApi.image,
      cached?.profile_photo,
    ),
    profile_photo_visible: pickProfileField(
      fromApi.profile_photo_visible,
      cached?.profile_photo_visible,
    ),
    additional_photos_visible: pickProfileField(
      fromApi.additional_photos_visible,
      cached?.additional_photos_visible,
    ),
    location: pickProfileField(fromApi.location, cached?.location),
  };

  profileStorage.set(resolved);
  return resolved;
};

export const saveProfileCache = (source: unknown): ProfileApiData => {
  const resolved = resolveProfileData(source);
  const storedUser = userStorage.getUser();

  if (storedUser) {
    userStorage.setUser({
      ...storedUser,
      name: resolved.name ?? storedUser.name,
      email: resolved.email ?? storedUser.email,
      phone: resolved.phone ?? storedUser.phone,
      is_verified: resolved.is_verified ?? storedUser.is_verified,
    });
  }

  return resolved;
};

const formatBirthday = (value?: string | null) => {
  if (!value) {
    return '';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

const calculateAge = (value?: string | null) => {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  const today = new Date();
  let age = today.getFullYear() - date.getFullYear();
  const monthDiff = today.getMonth() - date.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < date.getDate())) {
    age -= 1;
  }

  return age;
};

const parseHeight = (height?: string | null) => {
  if (!height) {
    return { feet: '', inches: '' };
  }

  const match = height.match(/(\d)\s*['']?\s*(\d{1,2})/);
  if (match) {
    return { feet: match[1], inches: match[2] };
  }

  const parts = height.split('.');
  if (parts.length === 2) {
    return { feet: parts[0], inches: parts[1] };
  }

  return { feet: '', inches: '' };
};

const toTitleCase = (value: string) =>
  value
    .split(' ')
    .filter(Boolean)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');

const parseLanguages = (value?: string | string[] | null): OtherLanguage[] => {
  if (!value) {
    return [];
  }

  const list = Array.isArray(value)
    ? value
    : value.split(',').map(item => item.trim());

  return list.filter(Boolean) as OtherLanguage[];
};

const buildLocation = (profile: ProfileApiData) => {
  const parts = [profile.city, profile.state, profile.country].filter(Boolean);
  return parts.join(', ');
};

const mapMaritalStatus = (value?: string | null) => {
  if (!value) {
    return '';
  }

  const key = value.toLowerCase();
  return MARITAL_STATUS_MAP[key] ?? toTitleCase(value);
};

export const mapProfileToForm = (
  profile?: ProfileApiData | null,
): EditProfileFormData => {
  const safeProfile = profile ?? {};
  const height = parseHeight(safeProfile.height);
  const gender = safeProfile.gender?.toLowerCase();

  return {
    fullName: safeProfile.name ?? '',
    birthday: safeProfile.birthday ?? '',
    dateOfBirth: formatBirthday(safeProfile.birthday),
    gender: gender === 'male' ? 'male' : 'female',
    aboutMe:
      safeProfile.bio ??
      safeProfile.about_me ??
      safeProfile.about ??
      '',
    email: safeProfile.email ?? '',
    phone: safeProfile.phone ?? '',
    city:
      safeProfile.location ??
      (buildLocation(safeProfile) || safeProfile.city || ''),
    country: safeProfile.country ?? '',
    heightFeet: height.feet,
    heightInches: height.inches,
    motherTongue: safeProfile.mother_tongue
      ? toTitleCase(safeProfile.mother_tongue)
      : '',
    otherLanguages: parseLanguages(safeProfile.other_languages),
    maritalStatus: mapMaritalStatus(safeProfile.marital_status),
    community: safeProfile.community ? toTitleCase(safeProfile.community) : '',
    residenceStatus:
      safeProfile.residential_status ?? safeProfile.residence_status
        ? toTitleCase(
            safeProfile.residential_status ?? safeProfile.residence_status ?? '',
          )
        : '',
    age: safeProfile.age ?? calculateAge(safeProfile.birthday),
    profilePhoto: safeProfile.profile_photo ?? null,
  };
};

export const mapProfileToSettings = (
  profile?: ProfileApiData | null,
): SettingsProfileData => {
  const form = mapProfileToForm(profile);
  const meta = [form.age ? String(form.age) : '', form.city]
    .filter(Boolean)
    .join(' · ');

  return {
    name: form.fullName,
    meta,
    isVerified: Boolean(profile?.is_verified),
    profilePhoto: form.profilePhoto,
    profilePictureVisible: profile?.profile_photo_visible ?? true,
    additionalPhotosVisible: profile?.additional_photos_visible ?? true,
  };
};

export const mapFormToProfilePayload = (
  form: EditProfileFormData,
): Record<string, FormValue> => {
  const payload: Record<string, FormValue> = {
    name: form.fullName.trim(),
    gender: form.gender,
  };

  const email = form.email.trim();
  if (email) {
    payload.email = email;
  }

  const phone = form.phone.trim();
  if (phone) {
    payload.phone = phone;
  }

  const bio = form.aboutMe.trim();
  if (bio) {
    payload.bio = bio;
  }

  const city = form.city.trim();
  if (city) {
    payload.city = city;
  }

  const country = form.country.trim();
  if (country) {
    payload.country = country;
  }

  if (form.motherTongue) {
    payload.mother_tongue = form.motherTongue;
  }

  if (form.otherLanguages.length > 0) {
    payload.other_languages = JSON.stringify(form.otherLanguages);
  }

  if (form.maritalStatus) {
    payload.marital_status =
      MARITAL_TO_API[form.maritalStatus] ?? form.maritalStatus.toLowerCase();
  }

  if (form.community) {
    payload.community = form.community;
  }

  if (form.residenceStatus) {
    payload.residential_status = form.residenceStatus.toLowerCase();
  }

  if (form.birthday) {
    payload.birthday = form.birthday;
  }

  if (form.heightFeet && form.heightInches) {
    payload.height = `${form.heightFeet}.${form.heightInches}`;
  }

  return payload;
};
