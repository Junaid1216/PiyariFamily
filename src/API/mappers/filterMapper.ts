import type {
  MatchApiItem,
  MatchFilterParams,
  MatchListResponse,
} from './matchMapper';
import {
  INCOME_RANGE_OPTIONS,
  QUALIFICATION_OPTIONS,
  RELIGION_OPTIONS,
} from '../../Constant/ProfileSetup';

export type FilterQuickOption = {
  id: string;
  label: string;
};

export type FilterOptionLists = {
  cities: string[];
  qualifications: string[];
  professions: string[];
  religions: string[];
  maritalStatuses: string[];
  incomeRanges: string[];
};

export type FilterFormDefaults = {
  ageMin: number;
  ageMax: number;
  city: string;
  qualification: string;
  profession: string;
  religion: string;
  maritalStatus: string;
  incomeRange: string;
};

export type FilterSetupData = {
  quickFilters: FilterQuickOption[];
  options: FilterOptionLists;
  defaults: FilterFormDefaults;
};

export const FILTER_ANY = 'Any';

const FILTER_MARITAL_STATUSES = [
  'never married',
  'divorced',
  'widowed',
  'single',
] as const;

const DEFAULT_FILTER_OPTIONS: FilterOptionLists = {
  cities: [],
  qualifications: [...QUALIFICATION_OPTIONS],
  professions: [],
  religions: [...RELIGION_OPTIONS],
  maritalStatuses: [...FILTER_MARITAL_STATUSES],
  incomeRanges: [...INCOME_RANGE_OPTIONS],
};

const pickNumber = (value?: number | string | null, fallback = 0) => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  return fallback;
};

const pickString = (value?: string | number | null) => {
  if (value === undefined || value === null) {
    return '';
  }

  return String(value).trim();
};

const normalizeList = (values?: Array<string | null | undefined>) =>
  [
    ...new Set(
      (values ?? [])
        .map(value => value?.trim())
        .filter((value): value is string => Boolean(value)),
    ),
  ].sort((left, right) => left.localeCompare(right));

const extractProfileList = (response?: MatchListResponse | null) => {
  if (!response) {
    return [];
  }

  if (Array.isArray(response.data)) {
    return response.data;
  }

  if (Array.isArray(response.profiles)) {
    return response.profiles;
  }

  if (Array.isArray(response.matches)) {
    return response.matches;
  }

  if (Array.isArray(response.results)) {
    return response.results;
  }

  return [];
};

const extractOptionsFromProfiles = (
  profiles: MatchApiItem[],
): FilterOptionLists => ({
  cities: normalizeList(profiles.map(profile => profile.city)),
  qualifications: normalizeList(
    profiles.map(
      profile =>
        profile.qualification ??
        profile.highest_education ??
        profile.education,
    ),
  ),
  professions: normalizeList(
    profiles.map(
      profile =>
        profile.profession ?? profile.job_title ?? profile.occupation,
    ),
  ),
  religions: normalizeList(
    profiles.map(profile => profile.religion ?? profile.community),
  ),
  maritalStatuses: normalizeList(
    profiles.map(profile => profile.marital_status),
  ),
  incomeRanges: [],
});

const mapQuickFilters = (
  quickFilters?: Record<string, string | number | null>,
): FilterQuickOption[] =>
  Object.entries(quickFilters ?? {}).map(([id, label]) => ({
    id,
    label: pickString(label) || id,
  }));

const mergeWithDefaults = (options: FilterOptionLists): FilterOptionLists => ({
  cities: options.cities.length ? options.cities : DEFAULT_FILTER_OPTIONS.cities,
  qualifications: options.qualifications.length
    ? options.qualifications
    : DEFAULT_FILTER_OPTIONS.qualifications,
  professions: options.professions.length
    ? options.professions
    : DEFAULT_FILTER_OPTIONS.professions,
  religions: options.religions.length
    ? options.religions
    : DEFAULT_FILTER_OPTIONS.religions,
  maritalStatuses: options.maritalStatuses.length
    ? options.maritalStatuses
    : DEFAULT_FILTER_OPTIONS.maritalStatuses,
  incomeRanges: options.incomeRanges.length
    ? options.incomeRanges
    : DEFAULT_FILTER_OPTIONS.incomeRanges,
});

const appendFromApplied = (
  options: FilterOptionLists,
  applied?: Record<string, string | number | null>,
): FilterOptionLists => {
  if (!applied) {
    return options;
  }

  const add = (list: string[], value?: string | number | null) =>
    value !== undefined && value !== null && String(value).trim()
      ? normalizeList([...list, String(value)])
      : list;

  return {
    cities: add(options.cities, applied.city),
    qualifications: add(options.qualifications, applied.qualification),
    professions: add(options.professions, applied.profession),
    religions: add(options.religions, applied.religion),
    maritalStatuses: add(options.maritalStatuses, applied.marital_status),
    incomeRanges: options.incomeRanges,
  };
};

const mapFilterOptionLists = (
  response?: MatchListResponse | null,
): FilterOptionLists => {
  const fromApi = response?.filter_options;
  const fromProfiles = extractOptionsFromProfiles(extractProfileList(response));
  const applied = response?.filters_applied;

  if (fromApi && typeof fromApi === 'object') {
    return mergeWithDefaults(
      appendFromApplied(
        {
          cities: normalizeList(fromApi.cities).length
            ? normalizeList(fromApi.cities)
            : fromProfiles.cities,
          qualifications: normalizeList(fromApi.qualifications).length
            ? normalizeList(fromApi.qualifications)
            : fromProfiles.qualifications,
          professions: normalizeList(fromApi.professions).length
            ? normalizeList(fromApi.professions)
            : fromProfiles.professions,
          religions: normalizeList(fromApi.religions).length
            ? normalizeList(fromApi.religions)
            : fromProfiles.religions,
          maritalStatuses: normalizeList(fromApi.marital_statuses).length
            ? normalizeList(fromApi.marital_statuses)
            : fromProfiles.maritalStatuses,
          incomeRanges: normalizeList(fromApi.income_ranges).length
            ? normalizeList(fromApi.income_ranges)
            : fromProfiles.incomeRanges,
        },
        applied,
      ),
    );
  }

  return mergeWithDefaults(appendFromApplied(fromProfiles, applied));
};

const mapDefaults = (
  response: MatchListResponse | null | undefined,
  options: FilterOptionLists,
): FilterFormDefaults => {
  const applied = response?.filters_applied ?? {};
  const apiOptions = response?.filter_options;

  return {
    ageMin: pickNumber(applied.age_min ?? apiOptions?.age_min, 24),
    ageMax: pickNumber(applied.age_max ?? apiOptions?.age_max, 32),
    city: pickString(applied.city) || options.cities[0] || '',
    qualification:
      pickString(applied.qualification) || options.qualifications[0] || FILTER_ANY,
    profession: pickString(applied.profession) || options.professions[0] || FILTER_ANY,
    religion: pickString(applied.religion) || options.religions[0] || FILTER_ANY,
    maritalStatus:
      pickString(applied.marital_status) || options.maritalStatuses[0] || '',
    incomeRange: options.incomeRanges[0] || FILTER_ANY,
  };
};

export const mapFilterSetup = (
  response?: MatchListResponse | null,
): FilterSetupData => {
  const options = mapFilterOptionLists(response);

  return {
    quickFilters: mapQuickFilters(response?.quick_filters),
    options,
    defaults: mapDefaults(response, options),
  };
};

const INCOME_RANGE_MAP: Record<
  string,
  Pick<MatchFilterParams, 'monthly_income_min' | 'monthly_income_max'>
> = {
  'Less than 50K': { monthly_income_max: 50000 },
  '50K to 100K': { monthly_income_min: 50000, monthly_income_max: 100000 },
  '100K to 200K': { monthly_income_min: 100000, monthly_income_max: 200000 },
  '200K to 300K': { monthly_income_min: 200000, monthly_income_max: 300000 },
};

export const mapIncomeToParams = (
  value: string,
): Partial<MatchFilterParams> => {
  if (!value || value === FILTER_ANY) {
    return {};
  }

  if (INCOME_RANGE_MAP[value]) {
    return INCOME_RANGE_MAP[value];
  }

  return { monthly_income: value };
};

export type BuildFilterParamsInput = {
  citySearch: string;
  location: string;
  education: string;
  profession: string;
  religion: string;
  marital: string;
  ageMin: number;
  ageMax: number;
  incomeRange: string;
  activeQuickFilters: Record<string, boolean>;
};

export const buildMatchFilterParams = ({
  citySearch,
  location,
  education,
  profession,
  religion,
  marital,
  ageMin,
  ageMax,
  incomeRange,
  activeQuickFilters,
}: BuildFilterParamsInput): MatchFilterParams => {
  const params: MatchFilterParams = {
    age_min: ageMin,
    age_max: ageMax,
  };

  if (marital) {
    params.marital_status = marital.toLowerCase();
  }

  if (education && education !== FILTER_ANY) {
    params.qualification = education;
  }

  if (profession && profession !== FILTER_ANY) {
    params.profession = profession;
  }

  if (religion && religion !== FILTER_ANY) {
    params.religion = religion;
  }

  const city = citySearch.trim() || location;

  if (city) {
    params.city = city;
  }

  Object.assign(params, mapIncomeToParams(incomeRange));

  Object.entries(activeQuickFilters).forEach(([key, enabled]) => {
    if (enabled) {
      params[key as keyof MatchFilterParams] = 1;
    }
  });

  return params;
};

export const withAnyOption = (options: string[]) => [FILTER_ANY, ...options];
