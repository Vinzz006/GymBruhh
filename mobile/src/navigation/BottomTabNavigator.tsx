import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import AppColors from '../constants/colors';
import { useWorkout } from '../context/WorkoutContext';
import HomeScreen from '../screens/tabs/HomeScreen';
import WorkoutScreen from '../screens/tabs/WorkoutScreen';
import NutritionScreen from '../screens/tabs/NutritionScreen';
import ProgressScreen from '../screens/tabs/ProgressScreen';
import AICoachScreen from '../screens/tabs/AICoachScreen';

const Tab = createBottomTabNavigator();

export const BottomTabNavigator: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { activeSession, elapsedSeconds } = useWorkout();

  const formatElapsed = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <View style={{ flex: 1, backgroundColor: AppColors.background }}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarStyle: styles.tabBar,
          tabBarActiveTintColor: AppColors.accent,
          tabBarInactiveTintColor: AppColors.textSecondary,
          tabBarLabelStyle: styles.tabLabel,
          tabBarIcon: ({ focused, color, size }) => {
            let iconName: any = 'home';
            if (route.name === 'Home') {
              iconName = focused ? 'home' : 'home-outline';
            } else if (route.name === 'Workout') {
              iconName = focused ? 'barbell' : 'barbell-outline';
            } else if (route.name === 'Nutrition') {
              iconName = focused ? 'restaurant' : 'restaurant-outline';
            } else if (route.name === 'Progress') {
              iconName = focused ? 'trending-up' : 'analytics-outline';
            } else if (route.name === 'AI Coach') {
              iconName = focused ? 'sparkles' : 'sparkles-outline';
            }
            return <Ionicons name={iconName} size={22} color={color} />;
          },
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Workout" component={WorkoutScreen} />
        <Tab.Screen name="Nutrition" component={NutritionScreen} />
        <Tab.Screen name="Progress" component={ProgressScreen} />
        <Tab.Screen name="AI Coach" component={AICoachScreen} />
      </Tab.Navigator>

      {/* Floating in-progress workout banner if active session exists */}
      {activeSession ? (
        <TouchableOpacity
          style={styles.floatingBanner}
          activeOpacity={0.9}
          onPress={() => navigation.navigate('ActiveWorkout')}
        >
          <View style={styles.bannerLeft}>
            <View style={styles.pulseDot} />
            <View>
              <Text style={styles.bannerTag}>ACTIVE WORKOUT SESSION • {formatElapsed(elapsedSeconds)}</Text>
              <Text style={styles.bannerTitle}>{activeSession.title}</Text>
            </View>
          </View>
          <View style={styles.resumeBadge}>
            <Text style={styles.resumeText}>Resume</Text>
            <Ionicons name="play" size={12} color={AppColors.black} />
          </View>
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: AppColors.dark,
    borderTopWidth: 1,
    borderTopColor: AppColors.border,
    height: 64,
    paddingBottom: 8,
    paddingTop: 8,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '800',
  },
  floatingBanner: {
    position: 'absolute',
    bottom: 74,
    left: 16,
    right: 16,
    backgroundColor: AppColors.accent,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: AppColors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
    zIndex: 999,
  },
  bannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  pulseDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: AppColors.black,
  },
  bannerTag: {
    color: AppColors.black,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  bannerTitle: {
    color: AppColors.black,
    fontSize: 13,
    fontWeight: '900',
  },
  resumeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppColors.black,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    gap: 4,
  },
  resumeText: {
    color: AppColors.accent,
    fontSize: 11,
    fontWeight: '800',
  },
});

export default BottomTabNavigator;
