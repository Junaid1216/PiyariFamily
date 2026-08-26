jest.mock('../src/API/mappers/profileMapper', () => ({
  parseVisibilityFlag: () => true,
  pickImageUrl: () => null,
}));

jest.mock('../src/Assets', () => ({
  Images: {
    maleProfile: 1,
    femaleProfile: 1,
  },
}));

import { isApiSuccess } from '../src/API/types';
import {
  buildMatchFilterParams,
  FILTER_ANY,
  mapFilterSetup,
} from '../src/API/mappers/filterMapper';
import { mapMatchList } from '../src/API/mappers/matchMapper';

const LIVE_FILTER_RESPONSE = {
  success: 200,
  fallback_used: true,
  message:
    'No exact match was found, so other opposite-gender profiles are shown.',
  filters_applied: {
    religion: 'islam',
  },
  quick_filters: {
    near_me: 'Near me',
  },
  matches: [
    {
      id: 1,
      name: 'Ayesha',
      religion: 'islam',
    },
  ],
};

describe('GET /matches/filter', () => {
  it('treats HTTP 200 and body success: 200 as success', () => {
    expect(isApiSuccess(200, 200)).toBe(true);
  });

  it('maps filters_applied, quick_filters, and fallback message from the live payload', () => {
    const setup = mapFilterSetup(LIVE_FILTER_RESPONSE);

    expect(setup.defaults.religion).toBe('islam');
    expect(setup.options.religions).toContain('islam');
    expect(setup.quickFilters).toEqual([{ id: 'near_me', label: 'Near me' }]);
    expect(LIVE_FILTER_RESPONSE.fallback_used).toBe(true);
    expect(LIVE_FILTER_RESPONSE.message).toContain('No exact match');
    expect(mapMatchList(LIVE_FILTER_RESPONSE)[0].name).toBe('Ayesha');
  });

  it('sends only selected query params, matching Postman religion=islam', () => {
    const params = buildMatchFilterParams({
      citySearch: '',
      location: '',
      education: FILTER_ANY,
      profession: FILTER_ANY,
      religion: 'islam',
      marital: '',
      ageMin: 18,
      ageMax: 60,
      incomeRange: FILTER_ANY,
      activeQuickFilters: {},
    });

    expect(params).toEqual({ religion: 'islam' });
  });
});
