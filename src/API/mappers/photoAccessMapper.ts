import { ImageSourcePropType } from 'react-native';
import { Images } from '../../Assets';
import { resolveMediaUrl, toRemoteImageSource } from '../mediaUrl';
import { formatNotificationTime } from './notificationMapper';

export type ViewProfileRequestStatus = 'pending' | 'accepted' | 'declined';

export type ViewProfileRequest = {
  id: string;
  profileId: string;
  name: string;
  age?: number;
  location?: string;
  image: ImageSourcePropType;
  photos: ImageSourcePropType[];
  requestedAt: string;
  status: ViewProfileRequestStatus;
  isVerified?: boolean;
};

export type PhotoAccessProfileApi = {
  id?: number | string | null;
  user_id?: number | string | null;
  name?: string | null;
  full_name?: string | null;
  age?: number | string | null;
  city?: string | null;
  country?: string | null;
  location?: string | null;
  profile_photo?: string | null;
  photo?: string | null;
  avatar?: string | null;
  image?: string | null;
  photos?: Array<Record<string, unknown> | string> | null;
  is_verified?: boolean | number | string | null;
  gender?: string | null;
  created_at?: string | null;
};

export type PhotoAccessRequestApiItem = {
  id?: number | string | null;
  request_id?: number | string | null;
  status?: string | null;
  created_at?: string | null;
  requested_at?: string | null;
  time?: string | null;
  updated_at?: string | null;
  profile?: PhotoAccessProfileApi | null;
  requester?: PhotoAccessProfileApi | null;
  user?: PhotoAccessProfileApi | null;
  photos?: Array<Record<string, unknown> | string> | null;
};

export type PhotoAccessRequestsResponse = {
  success?: boolean | number;
  requests?: PhotoAccessRequestApiItem[] | PhotoAccessRequestsResponse;
  data?: PhotoAccessRequestApiItem[] | PhotoAccessRequestsResponse;
  message?: string;
};

export type PhotoAccessRespondResponse = {
  success?: boolean | number;
  message?: string;
  request_id?: number | string | null;
  status?: string | null;
  data?: PhotoAccessRespondResponse;
};

export type PhotoAccessAction = 'approve' | 'reject';

const pickString = (...values: Array<string | null | undefined>) => {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }

  return '';
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

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value);

const unwrapPayload = (
  response?: PhotoAccessRequestsResponse | null,
): PhotoAccessRequestsResponse | null => {
  if (!response || typeof response !== 'object') {
    return null;
  }

  let current: Record<string, unknown> = { ...response };

  for (let depth = 0; depth < 3; depth += 1) {
    const nested = current.data;
    if (!isPlainObject(nested)) {
      break;
    }
    current = { ...current, ...nested };
  }

  return current as PhotoAccessRequestsResponse;
};

const extractList = (
  response?: PhotoAccessRequestsResponse | null,
): PhotoAccessRequestApiItem[] => {
  const data = unwrapPayload(response);

  if (!data) {
    return [];
  }

  if (Array.isArray(data.requests)) {
    return data.requests;
  }

  if (isPlainObject(data.requests) && Array.isArray(data.requests.requests)) {
    return data.requests.requests;
  }

  if (Array.isArray(data.data)) {
    return data.data;
  }

  return [];
};

const mapStatus = (status?: string | null): ViewProfileRequestStatus => {
  const key = pickString(status).toLowerCase();

  if (key === 'approved' || key === 'accepted' || key === 'accept') {
    return 'accepted';
  }

  if (
    key === 'rejected' ||
    key === 'declined' ||
    key === 'denied' ||
    key === 'reject'
  ) {
    return 'declined';
  }

  return 'pending';
};

const photoUrlFromUnknown = (value: unknown) => {
  if (typeof value === 'string') {
    return pickString(value);
  }

  if (!isPlainObject(value)) {
    return '';
  }

  return pickString(
    typeof value.url === 'string' ? value.url : '',
    typeof value.path === 'string' ? value.path : '',
    typeof value.photo === 'string' ? value.photo : '',
    typeof value.image === 'string' ? value.image : '',
    typeof value.profile_photo === 'string' ? value.profile_photo : '',
    typeof value.src === 'string' ? value.src : '',
  );
};

const mapPhotoSources = (
  ...values: Array<string | Array<Record<string, unknown> | string> | null | undefined>
): ImageSourcePropType[] => {
  const urls: string[] = [];

  values.forEach(value => {
    if (typeof value === 'string') {
      const url = resolveMediaUrl(value);
      if (url) {
        urls.push(url);
      }
      return;
    }

    if (!Array.isArray(value)) {
      return;
    }

    value.forEach(item => {
      const url = resolveMediaUrl(photoUrlFromUnknown(item));
      if (url) {
        urls.push(url);
      }
    });
  });

  return [...new Set(urls)].map(toRemoteImageSource);
};

const resolveAvatar = (
  profile: PhotoAccessProfileApi | null,
  photos: ImageSourcePropType[],
): ImageSourcePropType => {
  if (photos[0]) {
    return photos[0];
  }

  if (profile?.gender?.toLowerCase() === 'male') {
    return Images.maleProfile;
  }

  return Images.femaleProfile;
};

export const mapPhotoAccessRequestItem = (
  item: PhotoAccessRequestApiItem,
  index: number,
): ViewProfileRequest => {
  const profile = item.profile ?? item.requester ?? item.user ?? {};
  const photos = mapPhotoSources(
    profile.profile_photo,
    profile.photo,
    profile.avatar,
    profile.image,
    profile.photos,
    item.photos,
  );
  const age = pickNumber(profile.age);
  const location = pickString(profile.location, profile.city, profile.country);
  const id = item.id ?? item.request_id ?? index;
  const profileId = profile.id ?? profile.user_id ?? '';
  const verified = profile.is_verified;

  return {
    id: String(id),
    profileId: profileId !== '' && profileId != null ? String(profileId) : '',
    name: pickString(profile.name, profile.full_name) || '-',
    ...(age ? { age } : {}),
    ...(location ? { location } : {}),
    image: resolveAvatar(profile, photos),
    photos,
    requestedAt: formatNotificationTime(
      pickString(
        item.created_at,
        item.requested_at,
        item.time,
        item.updated_at,
        profile.created_at,
      ),
    ),
    status: mapStatus(item.status),
    ...(verified === true || verified === 1 || verified === '1'
      ? { isVerified: true }
      : {}),
  };
};

export const mapPhotoAccessRequests = (
  response?: PhotoAccessRequestsResponse | null,
): ViewProfileRequest[] =>
  extractList(response).map(mapPhotoAccessRequestItem);

export const pickPendingPhotoAccessCount = (
  requests: ViewProfileRequest[] = [],
) => requests.filter(request => request.status === 'pending').length;

export const applyPhotoAccessStatus = (
  requests: ViewProfileRequest[],
  requestId: string,
  status: ViewProfileRequestStatus,
) =>
  requests.map(item =>
    item.id === String(requestId) ? { ...item, status } : item,
  );
