import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ImageSourcePropType } from 'react-native';
import HomeScreen from '../Screens/Home/HomeScreen';
import MatchSuccessScreen from '../Screens/Home/MatchSuccessScreen';
import ProfileDetailScreen from '../Screens/Home/ProfileDetailScreen';

export type HomeStackParamList = {
  HomeMain: undefined;
  ProfileDetail: { profileId: string };
  MatchSuccess: {
    name: string;
    fullName: string;
    matchImage: ImageSourcePropType;
    mutualMatch?: boolean;
  };
};

const Stack = createNativeStackNavigator<HomeStackParamList>();

const HomeStackNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="HomeMain" component={HomeScreen} />
      <Stack.Screen name="ProfileDetail" component={ProfileDetailScreen} />
      <Stack.Screen
        name="MatchSuccess"
        component={MatchSuccessScreen}
        options={{ animation: 'fade' }}
      />
    </Stack.Navigator>
  );
};

export default HomeStackNavigator;
