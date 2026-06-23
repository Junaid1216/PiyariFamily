import { NavigationProp, ParamListBase } from '@react-navigation/native';
import { ProfileStackParamList } from '../Navigation/ProfileStackNavigator';

type ProfileScreen = keyof ProfileStackParamList;

export const navigateToProfileScreen = <T extends ProfileScreen>(
  navigation: NavigationProp<ParamListBase>,
  screen: T,
  params?: ProfileStackParamList[T],
) => {
  navigation.getParent()?.navigate('Profile', { screen, params });
};
