import React, { createContext, useContext, useState, useEffect } from 'react';
import * as Haptics from 'expo-haptics';
import api from '../services/api';
import { API_ENDPOINTS } from '../constants/api';
import { ProgressDashboard, MeasurementEntry } from '../types';

interface ProgressContextType {
  dashboard: ProgressDashboard | null;
  isLoading: boolean;
  fetchDashboard: () => Promise<void>;
  logWeight: (weightKg: number, bodyFatPct?: number, notes?: string) => Promise<void>;
  logMeasurements: (data: {
    chestCm?: number;
    waistCm?: number;
    hipsCm?: number;
    leftArmCm?: number;
    rightArmCm?: number;
    leftThighCm?: number;
    rightThighCm?: number;
    shouldersCm?: number;
    calvesCm?: number;
    notes?: string;
  }) => Promise<void>;
}

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

export const ProgressProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [dashboard, setDashboard] = useState<ProgressDashboard | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchDashboard = async () => {
    setIsLoading(true);
    try {
      const data = await api.get(API_ENDPOINTS.progressDashboard);
      if (data) {
        setDashboard({
          currentWeightKg: data.current_weight_kg || 0,
          startWeightKg: data.start_weight_kg || 0,
          targetWeightKg: data.target_weight_kg || 0,
          totalWorkoutsCompleted: data.total_workouts_completed || 0,
          totalVolumeLiftedKg: data.total_volume_lifted_kg || 0,
          activeStreakWeeks: data.active_streak_weeks || 0,
          recentWeights: (data.recent_weights || []).map((w: any) => ({
            id: w.id,
            weightKg: w.weight_kg,
            bodyFatPct: w.body_fat_pct,
            notes: w.notes,
            recordedAt: w.recorded_at,
          })),
          recentMeasurements: (data.recent_measurements || []).map((m: any) => ({
            id: m.id,
            chestCm: m.chest_cm,
            waistCm: m.waist_cm,
            hipsCm: m.hips_cm,
            leftArmCm: m.left_arm_cm,
            rightArmCm: m.right_arm_cm,
            leftThighCm: m.left_thigh_cm,
            rightThighCm: m.right_thigh_cm,
            shouldersCm: m.shoulders_cm,
            calvesCm: m.calves_cm,
            notes: m.notes,
            recordedAt: m.recorded_at,
          })),
          personalRecords: (data.personal_records || []).map((pr: any) => ({
            id: pr.id,
            exerciseId: pr.exercise_id,
            exerciseName: pr.exercise_name,
            weightKg: pr.weight_kg,
            reps: pr.reps,
            estimatedOneRepMax: pr.estimated_one_rep_max,
            achievedAt: pr.achieved_at,
          })),
        });
      }
    } catch (e) {
      console.warn('Could not fetch progress dashboard:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const logWeight = async (weightKg: number, bodyFatPct?: number, notes?: string) => {
    setIsLoading(true);
    try {
      await api.post(API_ENDPOINTS.logWeight, {
        weight_kg: weightKg,
        body_fat_pct: bodyFatPct,
        notes: notes || '',
      });
      try {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (_) {}
      await fetchDashboard();
    } finally {
      setIsLoading(false);
    }
  };

  const logMeasurements = async (data: {
    chestCm?: number;
    waistCm?: number;
    hipsCm?: number;
    leftArmCm?: number;
    rightArmCm?: number;
    leftThighCm?: number;
    rightThighCm?: number;
    shouldersCm?: number;
    calvesCm?: number;
    notes?: string;
  }) => {
    setIsLoading(true);
    try {
      await api.post(API_ENDPOINTS.logMeasurements, {
        chest_cm: data.chestCm,
        waist_cm: data.waistCm,
        hips_cm: data.hipsCm,
        left_arm_cm: data.leftArmCm,
        right_arm_cm: data.rightArmCm,
        left_thigh_cm: data.leftThighCm,
        right_thigh_cm: data.rightThighCm,
        shoulders_cm: data.shouldersCm,
        calves_cm: data.calvesCm,
        notes: data.notes || '',
      });
      try {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (_) {}
      await fetchDashboard();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ProgressContext.Provider
      value={{
        dashboard,
        isLoading,
        fetchDashboard,
        logWeight,
        logMeasurements,
      }}
    >
      {children}
    </ProgressContext.Provider>
  );
};

export const useProgress = () => {
  const context = useContext(ProgressContext);
  if (!context) {
    throw new Error('useProgress must be used within a ProgressProvider');
  }
  return context;
};

export default ProgressContext;
