import {
  Country,
  CountryCode,
  FlagType,
  getAllCountries,
  isCountryCode,
} from 'react-native-country-picker-modal';
import { search } from 'react-native-country-picker-modal/lib/CountryService';
import type { CountryOption } from '../../Constant/ProfileSetup';
export type CountryApiItem =
  | string
  | {
      name?: string;
      code?: string;
      country?: string;
    };

let countriesIndex: Country[] | null = null;

const getCountriesIndex = async () => {
  if (!countriesIndex) {
    countriesIndex = await getAllCountries(FlagType.EMOJI);
  }

  return countriesIndex;
};

const normalizeApiItem = (item: CountryApiItem): string => {
  if (typeof item === 'string') {
    return item.trim();
  }

  return (item.name ?? item.country ?? '').trim();
};

const SHORT_ALIASES: Record<string, CountryCode> = {
  USA: 'US',
  UK: 'GB',
  UAE: 'AE',
};

const resolveCountryCode = async (apiName: string): Promise<CountryCode> => {
  const normalized = apiName.trim();
  const upper = normalized.toUpperCase();

  if (SHORT_ALIASES[upper]) {
    return SHORT_ALIASES[upper];
  }

  if (normalized.length === 2 && isCountryCode(upper)) {
    return upper;
  }

  const allCountries = await getCountriesIndex();
  const exactMatch = allCountries.find(
    country => country.name.toLowerCase() === normalized.toLowerCase(),
  );

  if (exactMatch) {
    return exactMatch.cca2;
  }

  const fuzzyMatch = search(normalized, allCountries, { keys: ['name'] })[0];

  if (fuzzyMatch) {
    return fuzzyMatch.cca2;
  }

  return upper.slice(0, 2) as CountryCode;
};

export const mapCountries = async (
  data?: CountryApiItem[],
): Promise<CountryOption[]> => {
  if (!data?.length) {
    return [];
  }

  return Promise.all(
    data.map(async item => {
      if (typeof item === 'object' && item.code) {
        return {
          name: normalizeApiItem(item),
          code: item.code.toUpperCase() as CountryCode,
        };
      }

      const name = normalizeApiItem(item);
      const code = await resolveCountryCode(name);

      return { name, code };
    }),
  );
};
