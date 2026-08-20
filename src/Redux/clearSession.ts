import { store } from './store';
import { clearAuth } from './slices/authSlice';
import { clearProfile } from './slices/profileSlice';
import { clearHomeMatches } from './slices/homeSlice';
import { clearShortlist } from './slices/shortlistSlice';
import { clearReferral } from './slices/referralSlice';

export const clearSession = () => {
  store.dispatch(clearAuth());
  store.dispatch(clearProfile());
  store.dispatch(clearHomeMatches());
  store.dispatch(clearShortlist());
  store.dispatch(clearReferral());
};
