import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors } from '../Constant/Colors';
import { Fonts } from '../Constant/Fonts';
import { Strings } from '../Constant/Strings';
import { fs, hp, wp } from '../Functions/responsive';
import HomeStackNavigator from './HomeStackNavigator';
import LikeStackNavigator from './LikeStackNavigator';
import PlaceholderScreen from '../Screens/Main/PlaceholderScreen';

export type MainTabParamList = {
  Home: undefined;
  Search: undefined;
  Messages: undefined;
  Like: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();
const TAB_BAR_CONTENT_HEIGHT = hp('7%');

type TabIconProps = {
  name: string;
  focused: boolean;
  color: string;
};

const TabIcon = ({ name, focused, color }: TabIconProps) => {
  if (focused && (name === 'home' || name === 'heart-outline')) {
    return (
      <View style={styles.activeIconWrap}>
        <Icon name={name} size={fs(22)} color={Colors.primary} />
      </View>
    );
  }

  return <Icon name={name} size={fs(22)} color={color} />;
};

const MainTabNavigator = () => {
  const insets = useSafeAreaInsets();
  const bottomPadding = Math.max(
    insets.bottom,
    Platform.OS === 'android' ? hp('5%') : hp('0.5%'),
  );

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textLight,
        tabBarLabelStyle: styles.tabLabel,
        tabBarStyle: [
          styles.tabBar,
          {
            height: TAB_BAR_CONTENT_HEIGHT + bottomPadding,
            paddingBottom: bottomPadding,
          },
        ],
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
        {() => <PlaceholderScreen title={Strings.tabSearch} />}
      </Tab.Screen>
      <Tab.Screen
        name="Messages"
        options={{ tabBarLabel: Strings.tabMessages }}
      >
        {() => <PlaceholderScreen title={Strings.tabMessages} />}
      </Tab.Screen>
      <Tab.Screen name="Like" options={{ tabBarLabel: Strings.tabLike }}>
        {() => <LikeStackNavigator />}
      </Tab.Screen>
      <Tab.Screen name="Profile" options={{ tabBarLabel: Strings.tabProfile }}>
        {() => <PlaceholderScreen title={Strings.tabProfile} />}
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
