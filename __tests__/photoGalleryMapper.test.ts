import { mapPhotoGallery } from '../src/API/mappers/photoGalleryMapper';

describe('GET /profile/{id}/photo-gallery', () => {
  it('maps Postman access_granted + photo urls', () => {
    const gallery = mapPhotoGallery({
      access_granted: true,
      photos: [
        {
          index: 0,
          url: 'https://ranglerz.click/piyarifamily/uploads/store/profiles/1080/a.jpg',
          path: 'profiles/1080/a.jpg',
          is_main: true,
        },
        {
          index: 1,
          url: 'https://ranglerz.click/piyarifamily/uploads/store/profiles/1080/b.jpg',
          path: 'profiles/1080/b.jpg',
          is_main: true,
        },
      ],
    });

    expect(gallery.accessGranted).toBe(true);
    expect(gallery.photos).toHaveLength(2);
    expect(gallery.photos[0]).toEqual({
      uri: 'https://ranglerz.click/piyarifamily/uploads/store/profiles/1080/a.jpg',
    });
  });

  it('shows photos from the live 1056 payload even if access_granted is false', () => {
    const gallery = mapPhotoGallery({
      success: 200,
      message: 'Photo gallery retrieved successfully.',
      user: { id: 1056, name: 'Taha' },
      total_photos: 2,
      visibility: {
        access_granted: false,
        additional_photos_visible: true,
        profile_photo_visible: true,
      },
      photos: [
        {
          index: 0,
          url: 'https://ranglerz.click/piyarifamily/uploads/store/profiles/1056/male-08.png',
          path: 'profiles/1056/male-08.png',
          is_main: true,
        },
        {
          index: 1,
          url: 'https://ranglerz.click/piyarifamily/uploads/store/profiles/1056/male-08.png',
          path: 'profiles/1056/male-08.png',
          is_main: true,
        },
      ],
    });

    expect(gallery.accessGranted).toBe(true);
    expect(gallery.photos).toHaveLength(2);
    expect(gallery.photos[0]).toEqual({
      uri: 'https://ranglerz.click/piyarifamily/uploads/store/profiles/1056/male-08.png',
    });
  });

  it('locks the gallery when visibility.access_granted is false and photos are empty', () => {
    const gallery = mapPhotoGallery({
      success: 200,
      message: 'Photo gallery retrieved successfully.',
      user: { id: 1056, name: 'Taha' },
      photos: [],
      total_photos: 0,
      visibility: {
        access_granted: false,
        additional_photos_visible: true,
        profile_photo_visible: false,
      },
    });

    expect(gallery.accessGranted).toBe(false);
    expect(gallery.photos).toHaveLength(0);
    expect(gallery.name).toBe('Taha');
    expect(gallery.userId).toBe('1056');
  });
});
