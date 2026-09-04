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

import {
  buildMatchSearchParams,
  mapFilterMatchGroups,
  mapMatchList,
  parseSearchQuery,
  profileMatchesSearchQuery,
} from '../src/API/mappers/matchMapper';

const CATALOGS = {
  cities: ['Lahore', 'Karachi', 'Islamabad'],
  professions: ['Doctor', 'Software Engineer', 'Teacher'],
};

describe('GET /matches/search params', () => {
  it('does not send a search term for an empty query', () => {
    expect(
      buildMatchSearchParams({
        searchQuery: '   ',
        profileGender: 'male',
      }),
    ).toEqual({ gender: 'female' });
  });

  it('sends city when the submitted value matches API city options', () => {
    expect(
      buildMatchSearchParams({
        searchQuery: 'Lahore',
        searchCatalogs: CATALOGS,
      }),
    ).toEqual({ city: 'Lahore' });
  });

  it('sends profession when the submitted value matches API profession options', () => {
    expect(
      buildMatchSearchParams({
        searchQuery: 'doctor',
        searchCatalogs: CATALOGS,
      }),
    ).toEqual({ profession: 'Doctor' });
  });

  it('sends name and search for a free-text name query', () => {
    expect(
      buildMatchSearchParams({
        searchQuery: 'Ayesha',
        searchCatalogs: CATALOGS,
      }),
    ).toEqual({
      name: 'Ayesha',
      search: 'Ayesha',
    });
  });

  it('parses profession, city from the comma format', () => {
    expect(parseSearchQuery('Software Engineer, Multan')).toEqual({
      name: undefined,
      profession: 'Software Engineer',
      city: 'Multan',
      search: undefined,
    });
  });

  it('honors explicit field prefixes without hardcoded lists', () => {
    expect(parseSearchQuery('profession: Pharmacist')).toEqual({
      name: undefined,
      profession: 'Pharmacist',
      city: undefined,
      search: undefined,
    });
    expect(parseSearchQuery('city: Faisalabad')).toEqual({
      name: undefined,
      profession: undefined,
      city: 'Faisalabad',
      search: undefined,
    });
    expect(parseSearchQuery('name: Hina')).toEqual({
      name: 'Hina',
      profession: undefined,
      city: undefined,
      search: undefined,
    });
  });

  it('maps search API results dynamically with no dummy profiles', () => {
    const matches = mapMatchList({
      success: 200,
      matches: [
        {
          id: 44,
          name: 'Sara',
          city: 'Lahore',
          profession: 'Doctor',
        },
      ],
    });

    expect(matches).toHaveLength(1);
    expect(matches[0].name).toBe('Sara');
    expect(matches[0].profession).toBe('Doctor');
  });

  it('returns an empty list when the search API has no matches', () => {
    expect(mapMatchList({ success: 200, matches: [] })).toEqual([]);
    expect(mapMatchList({ success: 200, data: [] })).toEqual([]);
  });

  it('treats fallback search results as not exact matches', () => {
    const groups = mapFilterMatchGroups({
      success: 200,
      fallback_used: true,
      matches: [{ id: 8, name: 'Random Profile', profession: 'Teacher' }],
    });

    expect(groups.exact).toEqual([]);
    expect(groups.fallbackUsed).toBe(true);
  });

  it('keeps only profiles that actually match the search query', () => {
    const hrManager = {
      name: 'Ayesha',
      profession: 'HR Manager',
      location: 'Lahore',
    };
    const unrelated = {
      name: 'Sara',
      profession: 'Doctor',
      location: 'Karachi',
    };

    expect(
      profileMatchesSearchQuery(hrManager, 'Hr manager', CATALOGS),
    ).toBe(true);
    expect(
      profileMatchesSearchQuery(unrelated, 'Hr manager', CATALOGS),
    ).toBe(false);
    expect(
      profileMatchesSearchQuery(hrManager, 'dfnsksksnfk', CATALOGS),
    ).toBe(false);
  });
});
