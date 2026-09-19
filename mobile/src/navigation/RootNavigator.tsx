import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AppColors from '../constants/colors';
import SplashScreen from '../screens/auth/SplashScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import OnboardingScreen from '../screens/onboarding/OnboardingScreen';
import BottomTabNavigator from './BottomTabNavigator';
import ActiveWorkoutScreen from '../screens/workout/ActiveWorkoutScreen';
import SettingsScreen from '../screens/settings/SettingsScreen';

const Stack = createNativeStackNavigator();

export const RootNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="Splash"
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: AppColors.background },
        animation: 'fade',
      }}
    >
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="MainTabs" component={BottomTabNavigator} />
      <Stack.Screen
        name="ActiveWorkout"
        component={ActiveWorkoutScreen}
        options={{ animation: 'slide_from_bottom' }}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ animation: 'slide_from_right' }}
      />
    </Stack.Navigator>
  );
};

export default RootNavigator;
