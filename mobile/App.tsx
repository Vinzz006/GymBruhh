import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider } from './src/context/AuthContext';
import { WorkoutProvider } from './src/context/WorkoutContext';
import { NutritionProvider } from './src/context/NutritionContext';
import { ProgressProvider } from './src/context/ProgressContext';
import { AIProvider } from './src/context/AIContext';
import RootNavigator from './src/navigation/RootNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <WorkoutProvider>
          <NutritionProvider>
            <ProgressProvider>
              <AIProvider>
                <NavigationContainer>
                  <StatusBar style="light" />
                  <RootNavigator />
                </NavigationContainer>
              </AIProvider>
            </ProgressProvider>
          </NutritionProvider>
        </WorkoutProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
