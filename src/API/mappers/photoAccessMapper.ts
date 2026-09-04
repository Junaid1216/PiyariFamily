import { ImageSourcePropType } from 'react-native';
import { Images } from '../../Assets';
import { resolveMediaUrl, toRemoteImageSource } from '../mediaUrl';
import { formatNotificationTime } from './notificationMapper';

export type ViewProfileRequestStatus = 'pending' | 'accepted' | 'declined';

export type ViewProfileRequest = {
  id: string;
  profileId: string;
  name?: string;
  age?: number;
  location?: string;
  image: ImageSourcePropType;
  photos: ImageSourcePropType[];
  requestedAt: string;
  status: ViewProfileRequestStatus;
  statusLabel: string;
  isVerified?: boolean;
};

export type PhotoAccessLocationValue =
  | string
  | number
  | Record<string, unknown>
  | null;

export type PhotoAccessProfileApi = {
  id?: number | string | null;
  user_id?: number | string | null;
  name?: string | null;
  full_name?: string | null;
  age?: number | string | null;
  city?: PhotoAccessLocationValue;
  country?: PhotoAccessLocationValue;
  location?: PhotoAccessLocationValue;
  current_location?: PhotoAccessLocationValue;
  current_city?: PhotoAccessLocationValue;
  hometown?: PhotoAccessLocationValue;
  state?: PhotoAccessLocationValue;
  address?: PhotoAccessLocationValue;
  city_name?: string | null;
  country_name?: string | null;
  present_city?: PhotoAccessLocationValue;
  living_in?: PhotoAccessLocationValue;
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
  city?: PhotoAccessLocationValue;
  country?: PhotoAccessLocationValue;
  location?: PhotoAccessLocationValue;
  current_location?: PhotoAccessLocationValue;
  profile?: PhotoAccessProfileApi | null;
  requester?: PhotoAccessProfileApi | null;
  user?: PhotoAccessProfileApi | null;
  photos?: Array<Record<string, unknown> | string> | null;
};

export type PhotoAccessRequestsResponse = {
  success?: boolean | number;
  type?: string | null;
  status?: string | number | null;
  request_id?: number | string | null;
  profile?: PhotoAccessProfileApi | null;
  requester?: PhotoAccessProfileApi | null;
  user?: PhotoAccessProfileApi | null;
  requests?: PhotoAccessRequestApiItem[] | PhotoAccessRequestsResponse;
  incoming?: PhotoAccessRequestApiItem[] | PhotoAccessRequestsResponse;
  outgoing?: PhotoAccessRequestApiItem[] | PhotoAccessRequestsResponse;
  data?: PhotoAccessRequestApiItem[] | PhotoAccessRequestsResponse;
  message?: string;
};

export type PhotoAccessRespondResponse = {
  success?: boolean | number;
  message?: string;
  request_id?: number | string | null;
  status?: string | null;
  profile?: PhotoAccessProfileApi | null;
  requester?: PhotoAccessProfileApi | null;
  user?: PhotoAccessProfileApi | null;
  data?: PhotoAccessRespondResponse;
};

export type PhotoAccessUserRequestResponse = PhotoAccessRespondResponse;

export type PhotoAccessAction = 'approve' | 'reject';

const pickString = (...values: Array<string | null | undefined>) => {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }

  return '';
};

const locationPart = (value: unknown): string => {
  if (typeof value === 'string' && value.trim()) {
    return value.trim();
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value);
  }

  if (!isPlainObject(value)) {
    return '';
  }

  return locationPart(
    value.name ??
      value.title ??
      value.label ??
      value.city_name ??
      value.city ??
      value.country_name ??
      value.country,
  );
};

const formatLocationFromSource = (source: unknown, depth = 0): string => {
  if (depth > 4 || !isPlainObject(source)) {
    return '';
  }

  const directLocation = source.location ?? source.current_location;
  if (typeof directLocation === 'string' && directLocation.trim()) {
    return directLocation.trim();
  }

  if (isPlainObject(directLocation)) {
    const nested = formatLocationFromSource(directLocation, depth + 1);
    if (nested) {
      return nested;
    }
  }

  const city = locationPart(
    source.city ??
      source.current_city ??
      source.city_name ??
      source.hometown ??
      source.present_city ??
      source.living_in,
  );
  const state = locationPart(source.state);
  const country = locationPart(source.country ?? source.country_name);
  const composed = [city, state, country].filter(Boolean).join(', ');

  if (composed) {
    return composed;
  }

  const address = locationPart(source.address);
  if (address) {
    return address;
  }

  return (
    formatLocationFromSource(source.profile, depth + 1) ||
    formatLocationFromSource(source.user, depth + 1) ||
    formatLocationFromSource(source.requester, depth + 1) ||
    formatLocationFromSource(source.data, depth + 1)
  );
};

export const resolvePhotoAccessLocation = (...sources: unknown[]) => {
  for (const source of sources) {
    const location = formatLocationFromSource(source);
    if (location) {
      return location;
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

const isRequestItem = (value: unknown): value is PhotoAccessRequestApiItem => {
  if (!isPlainObject(value)) {
    return false;
  }

  return (
    value.id != null ||
    value.request_id != null ||
    isPlainObject(value.profile) ||
    isPlainObject(value.user) ||
    isPlainObject(value.requester) ||
    typeof value.status === 'string'
  );
};

const hasRequestCollections = (value: Record<string, unknown>) =>
  value.requests != null ||
  value.incoming != null ||
  value.outgoing != null ||
  value.received != null ||
  value.sent != null ||
  value.items != null ||
  value.list != null ||
  value.records != null ||
  value.photo_access_requests != null ||
  value.view_profile_requests != null ||
  value.view_requests != null;

const collectItems = (value: unknown, depth = 0): PhotoAccessRequestApiItem[] => {
  if (depth > 4 || value == null) {
    return [];
  }

  if (Array.isArray(value)) {
    return value.flatMap(item => collectItems(item, depth + 1));
  }

  if (!isPlainObject(value)) {
    return [];
  }

  if (hasRequestCollections(value)) {
    return [
      ...collectItems(value.requests, depth + 1),
      ...collectItems(value.incoming, depth + 1),
      ...collectItems(value.outgoing, depth + 1),
      ...collectItems(value.received, depth + 1),
      ...collectItems(value.sent, depth + 1),
      ...collectItems(value.items, depth + 1),
      ...collectItems(value.list, depth + 1),
      ...collectItems(value.records, depth + 1),
      ...collectItems(value.photo_access_requests, depth + 1),
      ...collectItems(value.view_profile_requests, depth + 1),
      ...collectItems(value.view_requests, depth + 1),
      ...collectItems(value.data, depth + 1),
    ];
  }

  if (isRequestItem(value)) {
    return [value];
  }

  return collectItems(value.data, depth + 1);
};

const unwrapPayload = (
  response?: PhotoAccessRequestsResponse | null,
): PhotoAccessRequestsResponse | null => {
  if (!response || typeof response !== 'object') {
    return null;
  }

  let current: Record<string, unknown> = { ...response };

  for (let depth = 0; depth < 3; depth += 1) {
    const nested = current.data;
    if (!isPlainObject(nested) || Array.isArray(nested)) {
      break;
    }
    current = { ...current, ...nested };
  }

  return current as PhotoAccessRequestsResponse;
};

const mergeProfile = (
  ...sources: Array<PhotoAccessProfileApi | null | undefined>
): PhotoAccessProfileApi => {
  const merged: PhotoAccessProfileApi = {};

  sources.forEach(source => {
    if (!source) {
      return;
    }

    (Object.keys(source) as Array<keyof PhotoAccessProfileApi>).forEach(key => {
      const value = source[key];
      if (value == null || value === '') {
        return;
      }
      (merged as Record<string, unknown>)[key] = value;
    });
  });

  return merged;
};

export const extractPhotoAccessRequestItems = (
  response?: PhotoAccessRequestsResponse | null,
): PhotoAccessRequestApiItem[] => {
  const payload = unwrapPayload(response);
  const items = collectItems(payload);

  if (!payload) {
    return items;
  }

  const rootProfile = mergeProfile(
    payload.profile,
    payload.requester,
    payload.user,
  );

  if (!items.length) {
    return [];
  }

  if (!Object.keys(rootProfile).length) {
    return items;
  }

  return items.map(item => ({
    ...item,
    profile: mergeProfile(rootProfile, item.profile),
  }));
};

export const formatPhotoAccessStatusLabel = (status?: string | null) => {
  const key = pickString(status).toLowerCase();
  if (!key) {
    return 'Pending';
  }

  return `${key.charAt(0).toUpperCase()}${key.slice(1)}`;
};

export const mapPhotoAccessStatus = (
  status?: string | null,
): ViewProfileRequestStatus => {
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

const mapStatus = mapPhotoAccessStatus;

const unwrapRespondPayload = (
  response?: PhotoAccessRespondResponse | null,
): PhotoAccessRespondResponse | null => {
  if (!response || typeof response !== 'object') {
    return null;
  }

  let current: PhotoAccessRespondResponse = { ...response };

  for (let depth = 0; depth < 3; depth += 1) {
    const nested = current.data;
    if (!nested || typeof nested !== 'object' || Array.isArray(nested)) {
      break;
    }
    current = { ...current, ...nested };
  }

  return current;
};

export const resolvePhotoAccessRespond = (
  response?: PhotoAccessRespondResponse | null,
) => {
  const payload = unwrapRespondPayload(response);
  const rawStatus = pickString(payload?.status);
  const requestId =
    payload?.request_id != null && payload.request_id !== ''
      ? String(payload.request_id)
      : '';
  const hasProfile = Boolean(
    payload?.profile || payload?.requester || payload?.user,
  );

  return {
    requestId,
    status: rawStatus ? mapPhotoAccessStatus(rawStatus) : null,
    statusLabel: formatPhotoAccessStatusLabel(rawStatus || 'pending'),
    message: pickString(payload?.message),
    request: hasProfile
      ? mapPhotoAccessRequestItem(
          {
            id: requestId || payload?.request_id,
            request_id: payload?.request_id,
            status: payload?.status,
            profile: payload?.profile,
            requester: payload?.requester,
            user: payload?.user,
          },
          0,
        )
      : null,
  };
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
  const profile = mergeProfile(item.profile, item.requester, item.user);
  const photos = mapPhotoSources(
    profile.profile_photo,
    profile.photo,
    profile.avatar,
    profile.image,
    profile.photos,
    item.photos,
  );
  const age = pickNumber(profile.age);
  const location = resolvePhotoAccessLocation(profile, item);
  const id = item.request_id ?? item.id ?? index;
  const profileId = profile.id ?? profile.user_id ?? '';
  const verified = profile.is_verified;

  const name = pickString(profile.name, profile.full_name);

  return {
    id: String(id),
    profileId: profileId !== '' && profileId != null ? String(profileId) : '',
    ...(name ? { name } : {}),
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
    statusLabel: formatPhotoAccessStatusLabel(item.status),
    ...(verified === true || verified === 1 || verified === '1'
      ? { isVerified: true }
      : {}),
  };
};

export const mapPhotoAccessRequests = (
  response?: PhotoAccessRequestsResponse | null,
): ViewProfileRequest[] =>
  extractPhotoAccessRequestItems(response).map(mapPhotoAccessRequestItem);

export const mapPhotoAccessPayload = (
  response?: PhotoAccessRequestsResponse | PhotoAccessRespondResponse | null,
): ViewProfileRequest[] => {
  const listed = mapPhotoAccessRequests(
    response as PhotoAccessRequestsResponse,
  );
  if (listed.length) {
    return listed;
  }

  const resolved = resolvePhotoAccessRespond(
    response as PhotoAccessRespondResponse,
  );
  if (!resolved.request) {
    return [];
  }

  return [
    {
      ...resolved.request,
      id: resolved.requestId || resolved.request.id,
      ...(resolved.status
        ? { status: resolved.status, statusLabel: resolved.statusLabel }
        : {}),
    },
  ];
};

export const mergePhotoAccessResponses = (
  responses: Array<PhotoAccessRequestsResponse | null | undefined>,
): PhotoAccessRequestApiItem[] => {
  const byId = new Map<string, PhotoAccessRequestApiItem>();

  responses.forEach(response => {
    extractPhotoAccessRequestItems(response).forEach((item, index) => {
      const key = String(item.id ?? item.request_id ?? `idx-${index}`);
      const current = byId.get(key);
      if (!current) {
        byId.set(key, item);
        return;
      }

      byId.set(key, {
        ...current,
        ...item,
        profile: mergeProfile(current.profile, item.profile),
        requester: mergeProfile(current.requester, item.requester),
        user: mergeProfile(current.user, item.user),
        photos: item.photos?.length ? item.photos : current.photos,
      });
    });
  });

  return [...byId.values()];
};

export const pickPendingPhotoAccessCount = (
  requests: ViewProfileRequest[] = [],
) => requests.filter(request => request.status === 'pending').length;

export const applyPhotoAccessStatus = (
  requests: ViewProfileRequest[],
  requestId: string,
  status: ViewProfileRequestStatus,
  rawStatus?: string | null,
  request?: ViewProfileRequest | null,
) =>
  requests.map(item =>
    item.id === String(requestId)
      ? {
          ...item,
          ...(request
            ? {
                name: request.name || item.name,
                profileId: request.profileId || item.profileId,
                ...(request.age != null ? { age: request.age } : {}),
                ...(request.location ? { location: request.location } : {}),
                ...(request.isVerified ? { isVerified: true } : {}),
                photos: request.photos.length ? request.photos : item.photos,
                image: request.photos[0] || request.image || item.image,
              }
            : {}),
          status,
          statusLabel: formatPhotoAccessStatusLabel(
            rawStatus ||
              (status === 'accepted'
                ? 'approved'
                : status === 'declined'
                  ? 'rejected'
                  : 'pending'),
          ),
        }
      : item,
  );

export const overlayPhotoAccessDetails = (
  next: ViewProfileRequest[],
  previous: ViewProfileRequest[],
) => {
  const previousById = new Map(previous.map(item => [item.id, item]));

  return next.map(item => {
    const previousItem = previousById.get(item.id);
    if (!previousItem) {
      return item;
    }

    return {
      ...item,
      name: item.name || previousItem.name,
      location: item.location || previousItem.location,
      age: item.age ?? previousItem.age,
      photos: item.photos.length ? item.photos : previousItem.photos,
      image: item.photos[0] || previousItem.image,
      isVerified: item.isVerified ?? previousItem.isVerified,
    };
  });
};
