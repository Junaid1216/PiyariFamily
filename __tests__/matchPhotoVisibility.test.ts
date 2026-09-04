import {
  mapFeaturedMatch,
  mapMatchProfileDetail,
  profileNeedsPhotoAccess,
} from '../src/API/mappers/matchMapper';

describe('hidden match photos', () => {
  it('hides home card photos when profile picture visibility is off', () => {
    const match = mapFeaturedMatch(
      {
        id: 22,
        name: 'Hina',
        gender: 'female',
        profile_photo: 'https://example.com/hina.png',
        profile_photo_visible: 0,
        additional_photos_visible: 0,
      },
      0,
    );

    expect(match.image).not.toEqual(
      expect.objectContaining({ uri: 'https://example.com/hina.png' }),
    );
  });

  it('reads nested visibility flags and requires a photo access request', () => {
    const profile = {
      id: 22,
      name: 'Hina',
      profile_photo: 'https://example.com/hina.png',
      visibility: {
        profile_photo_visible: false,
        additional_photos_visible: false,
      },
    };

    expect(profileNeedsPhotoAccess(profile)).toBe(true);
    expect(mapMatchProfileDetail({ profile }, '22').photosNeedAccess).toBe(
      true,
    );
  });

  it('does not request photo access when the profile picture is already visible', () => {
    const mapped = mapMatchProfileDetail(
      {
        id: 22,
        name: 'Jannat',
        profile_photo: 'https://example.com/jannat.png',
        profile_photo_visible: 1,
        additional_photos_visible: 0,
      },
      '22',
    );

    expect(mapped.image).toEqual(
      expect.objectContaining({ uri: 'https://example.com/jannat.png' }),
    );
    expect(mapped.photosNeedAccess).toBe(false);
  });

  it('does not request photo access when a remote photo is already on screen', () => {
    expect(
      profileNeedsPhotoAccess(
        {
          visibility: {
            profile_photo_visible: false,
            additional_photos_visible: false,
          },
        },
        { uri: 'https://example.com/jannat.png' },
      ),
    ).toBe(false);
  });
});
