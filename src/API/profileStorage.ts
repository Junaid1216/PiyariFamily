import type { ProfileApiData } from './mappers/profileMapper';

let cachedProfile: ProfileApiData | null = null;

export const profileStorage = {
  get: () => cachedProfile,
  set: (profile: ProfileApiData | null) => {
    cachedProfile = profile;
  },
  clear: () => {
    cachedProfile = null;
  },
};
