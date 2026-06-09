import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import {
  LoginScreen,
  SignUpScreen,
  SplashScreen,
  VerifyEmailScreen,
  ForgotPasswordScreen,
  CheckEmailScreen,
  CodeVerifiedScreen,
  SetNewPasswordScreen,
  PasswordResetSuccessScreen,
} from '../Screens/Auth';

export type AuthStackParamList = {
  Splash: undefined;
  Login: undefined;
  SignUp: undefined;
  VerifyEmail: undefined;
  ForgotPassword: undefined;
  CheckEmail: { email?: string };
  CodeVerified: undefined;
  SetNewPassword: undefined;
  PasswordResetSuccess: undefined;
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

const AuthNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}>
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="SignUp" component={SignUpScreen} />
        <Stack.Screen name="VerifyEmail" component={VerifyEmailScreen} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        <Stack.Screen name="CheckEmail" component={CheckEmailScreen} />
        <Stack.Screen name="CodeVerified" component={CodeVerifiedScreen} />
        <Stack.Screen name="SetNewPassword" component={SetNewPasswordScreen} />
        <Stack.Screen
          name="PasswordResetSuccess"
          component={PasswordResetSuccessScreen}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AuthNavigator;
