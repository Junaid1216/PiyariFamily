import {
  CommonActions,
  NavigationProp,
  ParamListBase,
} from '@react-navigation/native';
import { Api, saveProfileCache, type ProfileApiData } from '../API';
import { store } from '../Redux';

export type PostLoginRoute = 'Main' | 'SelectCountry';

const hasText = (value?: string | number | null) =>
  value !== undefined && value !== null && String(value).trim() !== '';

export const isProfileSetupComplete = (profile?: ProfileApiData | null) => {
  if (!profile) {
    return false;
  }

  const countryId = Number(profile.country_id);
  if (Number.isFinite(countryId) && countryId > 0) {
    return true;
  }

  return hasText(profile.country);
};

export const getPostLoginRoute = (
  profile?: ProfileApiData | null,
): PostLoginRoute =>
  isProfileSetupComplete(profile) ? 'Main' : 'SelectCountry';

export const resolvePostLoginRoute = async (): Promise<PostLoginRoute> => {
  let profile = store.getState().profile.profile;

  if (!isProfileSetupComplete(profile)) {
    try {
      const res = await Api.getProfile();
      if (res?.status == 200) {
        profile = saveProfileCache(res.data);
      }
    } catch (error) {
    }
  }

  const route = getPostLoginRoute(profile);

  return route;
};

export const navigateAfterLogin = (
  navigation: {
    replace: (screen: string) => void;
    reset?: (state: { index: number; routes: Array<{ name: string }> }) => void;
  },
  route: PostLoginRoute,
) => {
  if (route === 'Main') {
    if (navigation.reset) {
      navigation.reset({
        index: 0,
        routes: [{ name: 'Main' }],
      });
      return;
    }

    navigation.replace('Main');
    return;
  }

  navigation.replace('SelectCountry');
};

export const resetToLogin = (navigation: NavigationProp<ParamListBase>) => {
  const authNavigation = navigation.getParent()?.getParent();

  if (authNavigation) {
    authNavigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      }),
    );
    return;
  }

  navigation.dispatch(
    CommonActions.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    }),
  );
};
