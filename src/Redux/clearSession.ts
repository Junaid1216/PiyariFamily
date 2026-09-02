import { persistor, store } from './store';
import { clearAuth } from './slices/authSlice';
import { clearProfile } from './slices/profileSlice';
import { clearHomeMatches } from './slices/homeSlice';
import { clearShortlist } from './slices/shortlistSlice';
import { clearReferral } from './slices/referralSlice';
import { clearFilter } from './slices/filterSlice';
import {
  clearNavigationState,
  setHasSeenWelcome,
  setLastAccount,
} from './slices/appSlice';

export const clearSession = () => {
  const { auth, profile } = store.getState();

  store.dispatch(
    setLastAccount({
      name: auth.user?.name || profile.profile?.name,
      email: auth.user?.email || profile.profile?.email,
    }),
  );

  store.dispatch(clearAuth());
  store.dispatch(clearProfile());
  store.dispatch(clearHomeMatches());
  store.dispatch(clearShortlist());
  store.dispatch(clearReferral());
  store.dispatch(clearFilter());
  store.dispatch(clearNavigationState());
  store.dispatch(setHasSeenWelcome(true));
  void persistor.flush();
};
