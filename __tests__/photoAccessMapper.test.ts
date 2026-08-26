import {
  mapPhotoAccessRequestItem,
  mapPhotoAccessRequests,
} from '../src/API/mappers/photoAccessMapper';

const POSTMAN_LIST = {
  requests: [
    {
      id: 1,
      status: 'approved',
      profile: {
        id: 1056,
        name: 'Taha',
        profile_photo:
          'https://ranglerz.click/piyarifamily/uploads/store/profiles/1056/male-08.png',
      },
    },
  ],
};

describe('GET /photo-access-requests', () => {
  it('maps the live Postman list onto View Profile Requests cards', () => {
    const [item] = mapPhotoAccessRequests(POSTMAN_LIST);

    expect(item.id).toBe('1');
    expect(item.profileId).toBe('1056');
    expect(item.name).toBe('Taha');
    expect(item.status).toBe('accepted');
    expect(item.image).toEqual({
      uri: 'https://ranglerz.click/piyarifamily/uploads/store/profiles/1056/male-08.png',
      headers: {
        Accept: 'image/jpeg,image/png,image/webp,image/*',
      },
    });
    expect(item.photos).toHaveLength(1);
  });

  it('does not invent age, location, or verified when the API omits them', () => {
    const [item] = mapPhotoAccessRequests(POSTMAN_LIST);

    expect(item.age).toBeUndefined();
    expect(item.location).toBeUndefined();
    expect(item.isVerified).toBeUndefined();
    expect(item.requestedAt).toBe('');
  });

  it('maps pending and extra profile fields when the API sends them', () => {
    const [item] = mapPhotoAccessRequests({
      success: 200,
      requests: [
        {
          id: 2,
          status: 'pending',
          created_at: '2026-08-26 12:00:00',
          profile: {
            id: 9,
            name: 'Sara',
            age: 26,
            city: 'Lahore',
            is_verified: true,
          },
        },
      ],
    });

    expect(item.status).toBe('pending');
    expect(item.age).toBe(26);
    expect(item.location).toBe('Lahore');
    expect(item.isVerified).toBe(true);
    expect(item.requestedAt).toBeTruthy();
  });
});

describe('POST /photo-access-requests/{id}/respond', () => {
  it('treats approve as accepted on the request card', () => {
    const item = mapPhotoAccessRequestItem(
      { id: 1, status: 'approved', profile: { id: 1056, name: 'Taha' } },
      0,
    );

    expect(item.status).toBe('accepted');
  });
});
