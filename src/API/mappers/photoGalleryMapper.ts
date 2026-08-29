import { ImageSourcePropType } from 'react-native';
import { resolveMediaUrl } from '../mediaUrl';

export type PhotoGalleryPhotoApi = {
  index?: number | string | null;
  url?: string | null;
  path?: string | null;
  photo?: string | null;
  image?: string | null;
  image_url?: string | null;
  photo_url?: string | null;
  is_main?: boolean | number | string | null;
};

export type PhotoGalleryResponse = {
  success?: boolean | number;
  message?: string;
  access_granted?: boolean | number | string | null;
  total_photos?: number | string | null;
  user?: {
    id?: number | string | null;
    name?: string | null;
    full_name?: string | null;
    profile_photo?: string | null;
    photo?: string | null;
    image?: string | null;
    photos?: PhotoGalleryPhotoApi[] | string[] | null;
  } | null;
  visibility?: {
    profile_photo_visible?: boolean | number | string | null;
    additional_photos_visible?: boolean | number | string | null;
    access_granted?: boolean | number | string | null;
  } | null;
  photos?: PhotoGalleryPhotoApi[] | null;
  data?: PhotoGalleryResponse | PhotoGalleryPhotoApi[] | null;
};

export type PhotoGalleryData = {
  userId: string;
  name: string;
  accessGranted: boolean;
  photos: ImageSourcePropType[];
};

const pickString = (...values: Array<string | null | undefined>) => {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }

  return '';
};

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value);

const unwrapPayload = (
  response?: PhotoGalleryResponse | null,
): PhotoGalleryResponse | null => {
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

  return current as PhotoGalleryResponse;
};

const extractPhotos = (
  response?: PhotoGalleryResponse | null,
): PhotoGalleryPhotoApi[] => {
  const data = unwrapPayload(response);

  if (!data) {
    return [];
  }

  const fromList = Array.isArray(data.photos)
    ? data.photos
    : Array.isArray(data.data)
      ? data.data
      : [];
  const userPhotos = Array.isArray(data.user?.photos) ? data.user.photos : [];
  const extras: PhotoGalleryPhotoApi[] = [
    data.user?.profile_photo
      ? { url: data.user.profile_photo, is_main: true, index: -1 }
      : null,
    data.user?.photo ? { url: data.user.photo, index: -1 } : null,
    data.user?.image ? { url: data.user.image, index: -1 } : null,
  ].filter(Boolean) as PhotoGalleryPhotoApi[];

  return [
    ...fromList,
    ...userPhotos.map(item =>
      typeof item === 'string' ? { url: item } : item,
    ),
    ...extras,
  ];
};

export const mapPhotoGallery = (
  response?: PhotoGalleryResponse | null,
  fallbackUserId = '',
  fallbackName = '',
): PhotoGalleryData => {
  const data = unwrapPayload(response);
  const rawPhotos = extractPhotos(response)
    .slice()
    .sort((left, right) => Number(left.index ?? 0) - Number(right.index ?? 0));
  const photos = rawPhotos
    .map(item =>
      resolveMediaUrl(
        pickString(
          item.url,
          item.path,
          item.photo,
          item.image,
          item.image_url,
          item.photo_url,
        ),
      ),
    )
    .filter(Boolean)
    .map(uri => ({ uri }));
  const accessGranted = photos.length > 0;

  return {
    userId: pickString(
      data?.user?.id != null ? String(data.user.id) : '',
      fallbackUserId,
    ),
    name: pickString(data?.user?.name, data?.user?.full_name, fallbackName),
    accessGranted,
    photos,
  };
};
