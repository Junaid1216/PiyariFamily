import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import FilterMatchesScreen from '../Screens/Like/FilterMatchesScreen';
import ProfileDetailScreen from '../Screens/Home/ProfileDetailScreen';
import ShortlistedScreen from '../Screens/Like/ShortlistedScreen';

export type LikeStackParamList = {
  Shortlisted: undefined;
  FilterMatches: undefined;
  ProfileDetail: { profileId: string };
};

const Stack = createNativeStackNavigator<LikeStackParamList>();

const LikeStackNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="Shortlisted" component={ShortlistedScreen} />
      <Stack.Screen name="FilterMatches" component={FilterMatchesScreen} />
      <Stack.Screen name="ProfileDetail" component={ProfileDetailScreen} />
    </Stack.Navigator>
  );
};

export default LikeStackNavigator;
