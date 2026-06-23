import React from 'react';
import { StyleSheet, View } from 'react-native';
import { NavigatorScreenParams } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors } from '../Constant/Colors';
import { Fonts } from '../Constant/Fonts';
import { Strings } from '../Constant/Strings';
import { getTabBarBottomPadding, resolveInsets } from '../Functions/safeArea';
import { getTabBarStyle } from '../Functions/tabBarVisibility';
import { fs, hp, wp } from '../Functions/responsive';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import HomeStackNavigator from './HomeStackNavigator';
import LikeStackNavigator from './LikeStackNavigator';
import SearchStackNavigator from './SearchStackNavigator';
import MessagesStackNavigator from './MessagesStackNavigator';
import ProfileStackNavigator, {
  ProfileStackParamList,
} from './ProfileStackNavigator';

export type MainTabParamList = {
  Home: undefined;
  Search: undefined;
  Messages: undefined;
  Like: undefined;
  Profile: NavigatorScreenParams<ProfileStackParamList>;
};

const Tab = createBottomTabNavigator<MainTabParamList>();
const TAB_BAR_CONTENT_HEIGHT = hp('7%');

type TabIconProps = {
  name: string;
  focused: boolean;
  color: string;
};

const TabIcon = ({ name, focused, color }: TabIconProps) => {
  if (
    focused &&
    (name === 'home' ||
      name === 'heart-outline' ||
      name === 'magnify' ||
      name === 'message-outline' ||
      name === 'account-outline')
  ) {
    return (
      <View style={styles.activeIconWrap}>
        <Icon name={name} size={fs(22)} color={Colors.primary} />
      </View>
    );
  }

  return <Icon name={name} size={fs(22)} color={color} />;
};

const MainTabNavigator = () => {
  const insets = resolveInsets(useSafeAreaInsets());
  const bottomPadding = getTabBarBottomPadding(insets.bottom);
  const visibleTabBarStyle = [
    styles.tabBar,
    {
      height: TAB_BAR_CONTENT_HEIGHT + bottomPadding,
      paddingBottom: bottomPadding,
    },
  ];

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textLight,
        tabBarLabelStyle: styles.tabLabel,
        tabBarStyle: getTabBarStyle(route, visibleTabBarStyle),
        tabBarIcon: ({ focused, color }) => {
          const iconMap: Record<keyof MainTabParamList, string> = {
            Home: 'home',
            Search: 'magnify',
            Messages: 'message-outline',
            Like: 'heart-outline',
            Profile: 'account-outline',
          };

          return (
            <TabIcon
              name={iconMap[route.name]}
              focused={focused}
              color={color}
            />
          );
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeStackNavigator}
        options={{ tabBarLabel: Strings.tabHome }}
      />
      <Tab.Screen name="Search" options={{ tabBarLabel: Strings.tabSearch }}>
        {() => <SearchStackNavigator />}
      </Tab.Screen>
      <Tab.Screen
        name="Messages"
        options={{ tabBarLabel: Strings.tabMessages }}
      >
        {() => <MessagesStackNavigator />}
      </Tab.Screen>
      <Tab.Screen name="Like" options={{ tabBarLabel: Strings.tabLike }}>
        {() => <LikeStackNavigator />}
      </Tab.Screen>
      <Tab.Screen
        name="Profile"
        options={{ tabBarLabel: Strings.tabProfile }}
        listeners={({ navigation }) => ({
          tabPress: () => {
            navigation.navigate('Profile', { screen: 'Settings' });
          },
        })}
      >
        {() => <ProfileStackNavigator />}
      </Tab.Screen>
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    paddingTop: hp('0.8%'),
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
    backgroundColor: Colors.white,
    elevation: 8,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  tabLabel: {
    fontSize: fs(11),
    fontFamily: Fonts.medium,
    marginTop: hp('0.5%'),
  },
  activeIconWrap: {
    width: wp('11%'),
    height: wp('11%'),
    borderRadius: wp('3%'),
    backgroundColor: Colors.tabActiveBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default MainTabNavigator;
