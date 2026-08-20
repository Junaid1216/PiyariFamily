import { ImageSourcePropType } from 'react-native';
import { Api } from './Api';
import { pickImageUrl } from './mappers/profileMapper';
import { toRemoteImageSource } from './mediaUrl';

type MatchWithImage = {
  id: string;
  image: ImageSourcePropType;
};

export const isRemoteImage = (image: ImageSourcePropType) =>
  typeof image === 'object' &&
  image !== null &&
  !Array.isArray(image) &&
  'uri' in image &&
  typeof image.uri === 'string' &&
  Boolean(image.uri);

export const getImageCacheKey = (
  image: ImageSourcePropType,
  fallback: string,
) => {
  if (isRemoteImage(image) && typeof image === 'object' && 'uri' in image) {
    return String(image.uri);
  }

  return fallback;
};

const fetchMatchPhoto = async (profileId: string) => {
  try {
    const res = await Api.getMatchProfile(profileId);

    if (res?.status == 200) {
      return pickImageUrl(res.data);
    }
  } catch {
    return '';
  }

  return '';
};

const withHydratedImage = async <T extends MatchWithImage>(item: T): Promise<T> => {
  if (isRemoteImage(item.image)) {
    return item;
  }

  const photo = await fetchMatchPhoto(item.id);

  if (photo) {
    return { ...item, image: toRemoteImageSource(photo) };
  }

  return item;
};

export const hydrateMatchImages = async <T extends MatchWithImage>(
  items: T[],
) => Promise.all(items.map(withHydratedImage));
