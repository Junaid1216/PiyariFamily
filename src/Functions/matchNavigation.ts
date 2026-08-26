import { NavigationProp, ParamListBase } from '@react-navigation/native';
import { ImageSourcePropType } from 'react-native';

type MatchSuccessParams = {
  name: string;
  fullName: string;
  matchImage: ImageSourcePropType;
  matchId?: string;
  mutualMatch?: boolean;
};

const routeNames = (navigation: NavigationProp<ParamListBase>) =>
  navigation.getState()?.routeNames ?? [];

export const navigateToMatchSuccess = (
  navigation: NavigationProp<ParamListBase>,
  params: MatchSuccessParams,
) => {
  if (routeNames(navigation).includes('MatchSuccess')) {
    navigation.navigate('MatchSuccess', params);
    return;
  }

  navigation.getParent()?.navigate('Home', {
    screen: 'MatchSuccess',
    params,
  });
};

export const navigateToChat = (
  navigation: NavigationProp<ParamListBase>,
  params: { chatId: string; name: string },
) => {
  navigation.getParent()?.navigate('Messages', {
    screen: 'Chat',
    params,
  });
};

export const navigateToSearchFilterResults = (
  navigation: NavigationProp<ParamListBase>,
) => {
  if (routeNames(navigation).includes('SearchMain')) {
    navigation.navigate('SearchMain', { fromFilter: true });
    return;
  }

  navigation.getParent()?.navigate('Search', {
    screen: 'SearchMain',
    params: { fromFilter: true },
  });
};
