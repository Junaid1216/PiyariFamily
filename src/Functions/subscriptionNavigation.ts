import { NavigationProp, ParamListBase } from '@react-navigation/native';
import { ProfileStackParamList } from '../Navigation/ProfileStackNavigator';

type SubscriptionScreen = keyof Pick<
  ProfileStackParamList,
  | 'ChooseYourPlan'
  | 'ComparePlans'
  | 'PremiumPaywall'
  | 'CompletePayment'
  | 'PremiumSuccess'
  | 'ManageSubscription'
>;

export const navigateToSubscription = <T extends SubscriptionScreen>(
  navigation: NavigationProp<ParamListBase>,
  screen: T,
  params?: ProfileStackParamList[T],
) => {
  navigation.getParent()?.navigate('Profile', { screen, params });
};
