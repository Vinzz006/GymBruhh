import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import StorageService from '../services/storage';
import { User, FitnessProfile, FitnessTargets } from '../types';
import { API_ENDPOINTS } from '../constants/api';

interface AuthContextType {
  user: User | null;
  profile: FitnessProfile | null;
  targets: FitnessTargets | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  unitSystem: 'metric' | 'imperial';
  apiUrl: string;
  login: (email: string, pass: string) => Promise<void>;
  register: (fullName: string, email: string, pass: string) => Promise<void>;
  completeOnboarding: (onboardingData: Record<string, any>) => Promise<void>;
  refreshUserData: () => Promise<void>;
  setUnitSystem: (unit: 'metric' | 'imperial') => Promise<void>;
  setApiUrl: (url: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<FitnessProfile | null>(null);
  const [targets, setTargets] = useState<FitnessTargets | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [unitSystem, setUnitSystemState] = useState<'metric' | 'imperial'>('metric');
  const [apiUrl, setApiUrlState] = useState<string>('');

  const fetchProfileAndTargets = async () => {
    try {
      const pData = await api.get(API_ENDPOINTS.profile);
      if (pData) {
        setProfile({
          id: pData.id,
          userId: pData.user_id,
          age: pData.age,
          gender: pData.gender,
          heightCm: pData.height_cm,
          currentWeightKg: pData.current_weight_kg,
          targetWeightKg: pData.target_weight_kg,
          fitnessLevel: pData.fitness_level,
          primaryGoal: pData.primary_goal,
          activityLevel: pData.activity_level,
          trainingDaysPerWeek: pData.training_days_per_week,
          workoutDurationMinutes: pData.workout_duration_minutes,
          workoutLocation: pData.workout_location,
          equipmentAvailable: pData.equipment_available || [],
          preferredSplit: pData.preferred_split,
          dietaryPreference: pData.dietary_preference,
          allergiesRestrictions: pData.allergies_restrictions || [],
        });
      }
    } catch (e) {
      console.warn('Could not fetch profile:', e);
    }

    try {
      const tData = await api.get(API_ENDPOINTS.targets);
      if (tData) {
        setTargets({
          bmr: tData.bmr,
          tdee: tData.tdee,
          targetCalories: tData.target_calories,
          targetProteinGrams: tData.target_protein_g,
          targetCarbsGrams: tData.target_carbs_g,
          targetFatGrams: tData.target_fat_g,
          waterIntakeMl: tData.water_intake_ml,
        });
      }
    } catch (e) {
      console.warn('Could not fetch targets:', e);
    }
  };

  const init = async () => {
    setIsLoading(true);
    try {
      const storedUnit = await StorageService.getUnit();
      setUnitSystemState(storedUnit);

      const currentApiUrl = await api.getBaseUrl();
      setApiUrlState(currentApiUrl);

      const token = await StorageService.getToken();
      if (token) {
        const userData = await api.get(API_ENDPOINTS.me);
        if (userData) {
          const mappedUser: User = {
            id: userData.id,
            email: userData.email,
            fullName: userData.full_name,
            isOnboarded: userData.is_onboarded,
            role: userData.role,
            createdAt: userData.created_at,
          };
          setUser(mappedUser);
          if (mappedUser.isOnboarded) {
            await fetchProfileAndTargets();
          }
        }
      }
    } catch (e) {
      console.warn('Auth init error:', e);
      await StorageService.clearToken();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    init();
  }, []);

  const refreshUserData = async () => {
    try {
      const token = await StorageService.getToken();
      if (token) {
        const userData = await api.get(API_ENDPOINTS.me);
        if (userData) {
          const mappedUser: User = {
            id: userData.id,
            email: userData.email,
            fullName: userData.full_name,
            isOnboarded: userData.is_onboarded,
            role: userData.role,
            createdAt: userData.created_at,
          };
          setUser(mappedUser);
          if (mappedUser.isOnboarded) {
            await fetchProfileAndTargets();
          }
        }
      }
    } catch (e) {
      console.warn('Refresh user data error:', e);
    }
  };

  const login = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      const res = await api.post(API_ENDPOINTS.login, {
        email: email.trim(),
        password: pass,
      });
      await StorageService.saveToken(res.access_token);
      const mappedUser: User = {
        id: res.user.id,
        email: res.user.email,
        fullName: res.user.full_name,
        isOnboarded: res.user.is_onboarded,
        role: res.user.role,
      };
      setUser(mappedUser);
      if (mappedUser.isOnboarded) {
        await fetchProfileAndTargets();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (fullName: string, email: string, pass: string) => {
    setIsLoading(true);
    try {
      const res = await api.post(API_ENDPOINTS.register, {
        full_name: fullName.trim(),
        email: email.trim(),
        password: pass,
      });
      await StorageService.saveToken(res.access_token);
      const mappedUser: User = {
        id: res.user.id,
        email: res.user.email,
        fullName: res.user.full_name,
        isOnboarded: res.user.is_onboarded,
        role: res.user.role,
      };
      setUser(mappedUser);
    } finally {
      setIsLoading(false);
    }
  };

  const completeOnboarding = async (onboardingData: Record<string, any>) => {
    setIsLoading(true);
    try {
      const res = await api.post(API_ENDPOINTS.onboarding, onboardingData);
      if (res.profile) {
        setProfile({
          id: res.profile.id,
          userId: res.profile.user_id,
          age: res.profile.age,
          gender: res.profile.gender,
          heightCm: res.profile.height_cm,
          currentWeightKg: res.profile.current_weight_kg,
          targetWeightKg: res.profile.target_weight_kg,
          fitnessLevel: res.profile.fitness_level,
          primaryGoal: res.profile.primary_goal,
          activityLevel: res.profile.activity_level,
          trainingDaysPerWeek: res.profile.training_days_per_week,
          workoutDurationMinutes: res.profile.workout_duration_minutes,
          workoutLocation: res.profile.workout_location,
          equipmentAvailable: res.profile.equipment_available || [],
          preferredSplit: res.profile.preferred_split,
          dietaryPreference: res.profile.dietary_preference,
          allergiesRestrictions: res.profile.allergies_restrictions || [],
        });
      }
      if (res.targets) {
        setTargets({
          bmr: res.targets.bmr,
          tdee: res.targets.tdee,
          targetCalories: res.targets.target_calories,
          targetProteinGrams: res.targets.target_protein_g,
          targetCarbsGrams: res.targets.target_carbs_g,
          targetFatGrams: res.targets.target_fat_g,
          waterIntakeMl: res.targets.water_intake_ml,
        });
      }
      setUser((prev) => (prev ? { ...prev, isOnboarded: true } : null));
    } finally {
      setIsLoading(false);
    }
  };

  const setUnitSystem = async (unit: 'metric' | 'imperial') => {
    setUnitSystemState(unit);
    await StorageService.saveUnit(unit);
  };

  const setApiUrl = async (url: string) => {
    const trimmed = url.trim();
    if (trimmed.length > 0) {
      await StorageService.saveApiUrl(trimmed);
      api.setCustomBaseUrl(trimmed);
      setApiUrlState(trimmed);
    } else {
      await StorageService.clearApiUrl();
      api.setCustomBaseUrl(null);
      const def = await api.getBaseUrl();
      setApiUrlState(def);
    }
  };

  const logout = async () => {
    await StorageService.clearAll();
    setUser(null);
    setProfile(null);
    setTargets(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        targets,
        isLoading,
        isAuthenticated: !!user,
        unitSystem,
        apiUrl,
        login,
        register,
        completeOnboarding,
        refreshUserData,
        setUnitSystem,
        setApiUrl,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
