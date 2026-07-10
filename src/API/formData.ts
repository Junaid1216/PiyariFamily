export type FormValue = string | number | string[];

export type UploadFile = {
  uri: string;
  type?: string;
  name?: string;
};

const ALLOWED_IMAGE_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
]);

const extensionFromMime = (mimeType: string) => {
  switch (mimeType) {
    case 'image/png':
      return 'png';
    case 'image/webp':
      return 'webp';
    case 'image/jpg':
    case 'image/jpeg':
    default:
      return 'jpg';
  }
};

export const normalizeUploadFile = (
  uri: string,
  fileName?: string | null,
  mimeType?: string | null,
): UploadFile => {
  const safeName = fileName?.trim() || `photo-${Date.now()}.jpg`;
  const extension = safeName.split('.').pop()?.toLowerCase();
  const typeFromName =
    extension === 'png'
      ? 'image/png'
      : extension === 'webp'
        ? 'image/webp'
        : extension === 'jpg' || extension === 'jpeg'
          ? 'image/jpeg'
          : '';

  const type = mimeType?.toLowerCase() || typeFromName || 'image/jpeg';
  const normalizedType = ALLOWED_IMAGE_TYPES.has(type) ? type : 'image/jpeg';
  const normalizedName = safeName.includes('.')
    ? safeName
    : `${safeName}.${extensionFromMime(normalizedType)}`;

  return {
    uri,
    type: normalizedType,
    name: normalizedName,
  };
};

export const toFormData = (data: Record<string, FormValue>) => {
  const formData = new FormData();

  Object.entries(data).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach(item => {
        formData.append(`${key}[]`, item);
      });
      return;
    }

    formData.append(key, String(value));
  });

  return formData;
};

export const toProfileUpdateFormData = (
  data: Record<string, FormValue>,
  photo?: UploadFile | null,
) => {
  const formData = new FormData();

  Object.entries(data).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      return;
    }

    formData.append(key, String(value));
  });

  if (photo?.uri) {
    const file = normalizeUploadFile(photo.uri, photo.name, photo.type);

    formData.append('photo', {
      uri: file.uri,
      type: file.type,
      name: file.name,
    } as unknown as Blob);
  }

  return formData;
};

export const toPhotoUploadFormData = (photos: UploadFile[]) => {
  const formData = new FormData();

  photos.forEach(photo => {
    const file = normalizeUploadFile(photo.uri, photo.name, photo.type);

    formData.append('photos[]', {
      uri: file.uri,
      type: file.type,
      name: file.name,
    } as unknown as Blob);
  });

  return formData;
};
