import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { AccountStatus } from '../../API/accountStorage';
import type { ProfileApiData } from '../../API/mappers/profileMapper';

export type ProfileState = {
  profile: ProfileApiData | null;
  accountStatus: AccountStatus | null;
};

const initialState: ProfileState = {
  profile: null,
  accountStatus: null,
};

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    setProfile: (state, action: PayloadAction<ProfileApiData | null>) => {
      state.profile = action.payload;
    },
    setAccountStatus: (state, action: PayloadAction<AccountStatus | null>) => {
      state.accountStatus = action.payload;
    },
    clearProfile: () => initialState,
  },
});

export const { setProfile, setAccountStatus, clearProfile } =
  profileSlice.actions;

export const selectProfile = (state: { profile: ProfileState }) =>
  state.profile.profile;

export const selectAccountStatus = (state: { profile: ProfileState }) =>
  state.profile.accountStatus;

export const selectIsAccountInactive = (state: { profile: ProfileState }) =>
  state.profile.accountStatus === 'inactive';

export const selectProfilePhoto = (state: { profile: ProfileState }) =>
  state.profile.profile?.profile_photo ??
  state.profile.profile?.image ??
  null;

export default profileSlice.reducer;
