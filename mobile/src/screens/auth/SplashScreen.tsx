import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AppColors from '../../constants/colors';
import { useAuth } from '../../context/AuthContext';

export const SplashScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const scaleAnim = React.useRef(new Animated.Value(0.9)).current;
  const opacityAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 900,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 900,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => {
        if (isAuthenticated) {
          if (user?.isOnboarded) {
            navigation.replace('MainTabs');
          } else {
            navigation.replace('Onboarding');
          }
        } else {
          navigation.replace('Login');
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isLoading, isAuthenticated, user]);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.content,
          {
            opacity: opacityAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <View style={styles.iconCircle}>
          <Ionicons name="barbell" size={54} color={AppColors.accent} />
        </View>

        <View style={styles.titleRow}>
          <Text style={styles.titleGym}>GYM</Text>
          <Text style={styles.titleBruhh}>Bruhh</Text>
        </View>

        <Text style={styles.tagline}>⚡ TRACK → ANALYZE → TRAIN → ADAPT ⚡</Text>
        <Text style={styles.sub}>Production-Grade AI Fitness Intelligence</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  content: {
    alignItems: 'center',
  },
  iconCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: AppColors.card,
    borderWidth: 2,
    borderColor: `${AppColors.accent}66`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: AppColors.accent,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  titleGym: {
    color: AppColors.white,
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  titleBruhh: {
    color: AppColors.accent,
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  tagline: {
    color: AppColors.accent,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginBottom: 6,
  },
  sub: {
    color: AppColors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
});

export default SplashScreen;
